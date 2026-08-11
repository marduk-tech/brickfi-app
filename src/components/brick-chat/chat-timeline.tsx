"use client";

import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import DynamicReactIcon from "../common/dynamic-react-icon";
import styles from "./chat-timeline.module.css";

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

const formatSecs = (ms: number) =>
  ms < 10000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms / 1000)}s`;

const ChatTimeline = ({ steps, running, totalMs }: ChatTimelineProps) => {
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  // one ticker for the whole component, only while steps are still running
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running]);

  if (!steps.length && !running) return null;

  const renderSteps = () => (
    <Flex vertical className={styles.timeline}>
      {steps.map((step) => {
        const elapsed = (step.endedAt ?? now) - step.startedAt;
        const isActive = step.status === "active";
        return (
          <div key={step.id} className={styles.step}>
            <div className={styles.row}>
              <span className={styles.icon}>
                {isActive ? (
                  <Spin size="small" />
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
            {step.detail ? (
              <Typography.Text
                type="secondary"
                className={styles.detail}
                style={{ fontSize: FONT_SIZE.SUB_TEXT, display: "block" }}
              >
                → {step.detail}
              </Typography.Text>
            ) : null}
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
