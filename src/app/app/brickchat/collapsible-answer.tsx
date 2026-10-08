"use client";

import { Button, Flex } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import { COLORS } from "@/theme/style-constants";

interface CollapsibleAnswerProps {
  children: ReactNode;
  // false renders children as-is (e.g. the latest turn, which should always
  // show in full)
  collapsible: boolean;
  maxHeight?: number;
}

// Clamps an answer to maxHeight with a fade and a "See more" toggle - only
// when its content actually overflows, measured via ResizeObserver so it
// stays right as fonts/images load or the panel resizes.
export default function CollapsibleAnswer({
  children,
  collapsible,
  maxHeight = 300,
}: CollapsibleAnswerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || !collapsible) return;
    const measure = () => setOverflows(el.scrollHeight > maxHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [collapsible, maxHeight]);

  if (!collapsible) return <>{children}</>;

  const clamped = overflows && !expanded;

  return (
    <div>
      <div
        ref={contentRef}
        style={{
          position: "relative",
          maxHeight: clamped ? maxHeight : undefined,
          overflow: clamped ? "hidden" : undefined,
        }}
      >
        {children}
        {clamped ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 64,
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0), white)",
              pointerEvents: "none",
            }}
          />
        ) : null}
      </div>
      {overflows ? (
        <Flex>
        <Button
          type="link"
          size="small"
          style={{ padding: 0, color: COLORS.primaryColor, marginLeft: "auto" }}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "See less" : "See more"}
        </Button>
        </Flex>
      ) : null}
    </div>
  );
}
