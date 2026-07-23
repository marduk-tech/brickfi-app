import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Flex, Tag, Typography } from "antd";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";

const { Paragraph } = Typography;

export interface MapModalContent {
  title: string | ReactNode;
  tags?: { label: string; color: string }[];
  titleIcon?: ReactNode;
  content: string | ReactNode;
  subHeading?: ReactNode;
  footerContent?: ReactNode;
}

export interface MapModalPosition {
  x: number;
  y: number;
}

/** Geographic anchor (lat/lng) a modal was opened against — used by the Google InfoWindow path. */
export interface MapModalGeoPosition {
  lat: number;
  lng: number;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  content?: MapModalContent;
  /** Click position, relative to containerRef, that the popover should anchor next to. */
  position?: MapModalPosition;
  /** Element whose bounds the popover must stay within. */
  containerRef?: React.RefObject<HTMLElement | null>;
}

const PANEL_WIDTH = 320;
const CLICK_OFFSET = 14;
const EDGE_PADDING = 8;

interface MapModalBodyProps {
  content?: MapModalContent;
  onClose: () => void;
}

/** Title/tags/content block shared by the Leaflet popover panel and the Google InfoWindow. */
export const MapModalBody = ({ content, onClose }: MapModalBodyProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on any click outside this content — works for both the Leaflet
  // Popup and Google InfoWindow, since both mount this into the live DOM.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div ref={containerRef}>
      {/* <div
        onClick={onClose}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          cursor: "pointer",
        }}
      >
        <DynamicReactIcon
          iconName="IoCloseCircle"
          iconSet="io5"
          size={20}
          color={COLORS.textColorMedium}
        />
      </div> */}

      <Flex
        vertical
        style={{
          maxHeight: 250,
          minHeight: 50,
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {content?.tags ? (
          <Flex style={{ width: "100%", flexWrap: "wrap" }} gap={8}>
            {content.tags.map((t, index) => (
              <Tag
                key={index}
                color={t.color}
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.SUB_TEXT,
                  padding: "0 4px",
                }}
              >
                {t.label}
              </Tag>
            ))}
          </Flex>
        ) : null}

        <Flex align="center" gap={4} style={{ paddingRight: 20 }}>
          {content?.titleIcon && content.titleIcon}
          {typeof content?.title == "string" ? (
            <Paragraph
              style={{
                fontSize: FONT_SIZE.HEADING_3,
                fontWeight: 500,
                marginBottom: 8,
                marginTop: 8,
                paddingBottom: 1,
                lineHeight: "100%"
              }}
              ellipsis={{
                rows: 2,
              }}
            >
              {content?.title}
            </Paragraph>
          ) : (
            <>{content?.title}</>
          )}
        </Flex>

        {content?.subHeading && content.subHeading}

        {content?.footerContent && content.footerContent}

        {content && content.content && typeof content.content == "string" ? (
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {content.content}
          </Markdown>
        ) : (
          <>{content && content.content ? content?.content : ""}</>
        )}
      </Flex>
    </div>
  );
};

export const MapModal = ({
  isOpen,
  onClose,
  content,
  position,
  containerRef,
}: MapModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ left: number; top: number }>();

  useLayoutEffect(() => {
    if (!isOpen || !position || !panelRef.current) {
      setCoords(undefined);
      return;
    }

    const containerRect = containerRef?.current?.getBoundingClientRect();
    const containerWidth = containerRect?.width ?? window.innerWidth;
    const containerHeight = containerRect?.height ?? window.innerHeight;
    const panelRect = panelRef.current.getBoundingClientRect();

    // Prefer to the right of the click; flip to the left if it would overflow.
    let left = position.x + CLICK_OFFSET;
    if (left + panelRect.width + EDGE_PADDING > containerWidth) {
      left = position.x - panelRect.width - CLICK_OFFSET;
    }
    left = Math.max(
      EDGE_PADDING,
      Math.min(left, containerWidth - panelRect.width - EDGE_PADDING),
    );

    // Center vertically on the click, clamped to stay within the container.
    let top = position.y - panelRect.height / 2 - 10;
    top = Math.max(
      EDGE_PADDING,
      Math.min(top, containerHeight - panelRect.height - EDGE_PADDING),
    );

    setCoords({ left, top: top });
  }, [isOpen, position, content, containerRef]);

  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, zIndex: 1999 }}
      />
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          zIndex: 2000,
          width: PANEL_WIDTH,
          maxWidth: `calc(100% - ${EDGE_PADDING * 2}px)`,
          left: coords?.left ?? 0,
          top: coords?.top ?? 0,
          visibility: coords ? "visible" : "hidden",
          background: "#fff",
          borderRadius: 8,
          border: `0.4px solid ${COLORS.borderColorMedium}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
          padding: 16,
        }}
      >
        <MapModalBody content={content} onClose={onClose} />
      </div>
    </>
  );
};
