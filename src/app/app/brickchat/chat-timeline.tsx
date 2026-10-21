"use client";

import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, Spin, Typography } from "antd";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import styles from "./chat-timeline.module.css";
import { Loader } from "@/components/common/loader";
import { LoadingOutlined } from "@ant-design/icons";

export interface TimelineStep {
  id: string;
  label: string;
  detail?: string;
  status: "active" | "done";
  startedAt: number;
  endedAt?: number;
}

interface ChatTimelineProps {
  steps: TimelineStep[];
  running: boolean;
  totalMs?: number;
}

// steps visible at once - older ones scroll up out of view
const VISIBLE_STEPS = 3;

const formatSecs = (ms: number) =>
  ms < 10000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms / 1000)}s`;

const ChatTimeline = ({ steps, running, totalMs }: ChatTimelineProps) => {
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [maxHeight, setMaxHeight] = useState<number>();
  const listRef = useRef<HTMLDivElement>(null);

  // one ticker for the whole component, only while steps are still running
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running]);

  // cap the list at the last VISIBLE_STEPS rows (measured, since a label
  // can wrap)
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const rows = el.children;
    if (rows.length <= VISIBLE_STEPS) {
      setMaxHeight(undefined);
      return;
    }
    const first = rows[rows.length - VISIBLE_STEPS] as HTMLElement;
    const last = rows[rows.length - 1] as HTMLElement;
    setMaxHeight(last.offsetTop + last.offsetHeight - first.offsetTop);
  }, [steps, running, expanded]);

  // keep it scrolled to the newest step - runs after maxHeight is committed,
  // otherwise the list isn't overflowing yet and scrollTop is a no-op
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [maxHeight, steps, running, expanded]);

  if (!steps.length && !running) return null;

  const renderSteps = () => (
    <Flex
      vertical
      ref={listRef}
      className={`${styles.timeline} ${maxHeight ? styles.scrollable : ""}`}
      style={{ maxHeight }}
    >
      {steps.map((step) => {
        const elapsed = (step.endedAt ?? now) - step.startedAt;
        const isActive = step.status === "active";
        return (
          <div key={step.id} className={styles.step}>
            <div className={styles.row}>
              <span className={styles.icon}>
                {isActive ? (
                  <Loader
                    height={10}
                    indicator={
                      <LoadingOutlined
                        spin
                        style={{ fontSize: 10, color: COLORS.primaryColor }}
                      />
                    }
                  />
                ) : (
                  <DynamicReactIcon
                    iconName="IoCheckmarkCircle"
                    iconSet="io5"
                    size={14}
                    color={COLORS.primaryColor}
                  />
                )}
              </span>
              <Typography.Text
                className={styles.label}
                type={isActive ? undefined : "secondary"}
                style={{ fontSize: FONT_SIZE.PARA }}
              >
                {step.label}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                className={styles.elapsed}
                style={{ fontSize: FONT_SIZE.SUB_TEXT }}
              >
                {formatSecs(elapsed)}
              </Typography.Text>
            </div>
            {/* {step.detail ? (
              <Typography.Text
                type="secondary"
                className={styles.detail}
                style={{ fontSize: FONT_SIZE.SUB_TEXT, display: "block" }}
              >
                → {step.detail}
              </Typography.Text>
            ) : null} */}
          </div>
        );
      })}

      {running && !steps.length ? (
        <div className={styles.row}>
          <span className={styles.icon}>
            <Spin size="small" />
          </span>
          <Typography.Text
            type="secondary"
            style={{ fontSize: FONT_SIZE.PARA }}
          >
            Searching for projects...
          </Typography.Text>
        </div>
      ) : null}
    </Flex>
  );

  if (running) return renderSteps();

  // finished: collapse to a single line the user can open back up
  const total =
    totalMs ??
    (steps.length
      ? (steps[steps.length - 1].endedAt ?? steps[steps.length - 1].startedAt) -
        steps[0].startedAt
      : 0);

  return (
    <Flex vertical gap={4}>
      <button
        type="button"
        className={styles.summary}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className={`${styles.caret} ${expanded ? styles.caretOpen : ""}`}>
          <DynamicReactIcon
            iconName="IoChevronForward"
            iconSet="io5"
            size={12}
            color={COLORS.textColorMedium}
          />
        </span>
        <Typography.Text
          type="secondary"
          style={{ fontSize: FONT_SIZE.SUB_TEXT }}
        >
          Worked for {formatSecs(total)}
        </Typography.Text>
      </button>
      {expanded ? renderSteps() : null}
    </Flex>
  );
};

export default ChatTimeline;
