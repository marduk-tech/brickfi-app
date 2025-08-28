import React, { ReactNode } from "react";
import { Flex, Modal, Tag, Typography } from "antd";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

const { Paragraph } = Typography;

export interface MapModalContent {
  title: string;
  tags?: { label: string; color: string }[];
  titleIcon?: ReactNode;
  content: string;
  subHeading?: ReactNode;
  footerContent?: ReactNode;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  content?: MapModalContent;
}

export const MapModal = ({ isOpen, onClose, content }: MapModalProps) => {
  return (
    <Modal
      title={null}
      closable={true}
      open={isOpen}
      footer={null}
      onCancel={onClose}
      zIndex={2000}
    >
      <Flex
        vertical
        style={{
          maxHeight: 500,
          minHeight: 50,
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
      >
        {content?.tags ? (
          <Flex
            style={{ marginTop: 32, width: "100%", flexWrap: "wrap" }}
            gap={8}
          >
            {content.tags.map((t, index) => (
              <Tag
                key={index}
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.SUB_TEXT,
                  borderColor: COLORS.textColorDark,
                  padding: "0 4px",
                }}
              >
                {t.label}
              </Tag>
            ))}
          </Flex>
        ) : null}
        
        <Flex align="center" gap={4}>
          {content?.titleIcon && content.titleIcon}
          <Paragraph
            style={{
              fontSize: FONT_SIZE.HEADING_2,
              fontWeight: 500,
              marginBottom: 8,
              marginTop: 8,
              paddingBottom: 1,
              minHeight: 32,
            }}
            ellipsis={{
              rows: 2,
            }}
          >
            {content?.title}
          </Paragraph>
        </Flex>
        
        {content?.subHeading && content.subHeading}
        
        {content?.footerContent && content.footerContent}
        
        {content && content.content ? (
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {content.content}
          </Markdown>
        ) : null}
      </Flex>
    </Modal>
  );
};