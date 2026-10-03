"use client";

import { Flex, Tag } from "antd";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";

interface StaticQueriesProps {
  /** Disables clicking while a search is already in flight - matches the sample-prompts tags' own chatLoading guard in brickchat-client.tsx. */
  disabled?: boolean;
  onSelect: (query: string) => void;
}

const SAMPLE_PROMPTS = [
  "Looking for a 3BHK above 1200 sq.ft near Electronic City",
  "Find me a plot at less than 6000 per sq.ft in North Bangalore",
  "4BHK apartment above 2500 sq.ft with lake facing units",
];

// Simple clickable list of pre-written queries - each one just fills the
// search box and submits it (see onSelect in brickchat-client.tsx). Kept as
// its own component since it's rendered unconditionally right after the
// welcome message (see showWelcome there), independent of the
// chatThreads-driven sample-prompts fallback further down the same screen.
export default function StaticQueries({
  disabled,
  onSelect,
}: StaticQueriesProps) {
  return (
    <Flex style={{ width: "100%", flexWrap: "wrap" }} gap={8}>
      {SAMPLE_PROMPTS.map((query) => (
        <Tag
          key={query}
          style={{
            fontSize: FONT_SIZE.PARA,
            backgroundColor: COLORS.textColorDark,
            color: "white",
            padding: "4px 10px",
            borderRadius: 16,
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
          onClick={() => {
            if (disabled) return;
            onSelect(query);
          }}
        >
          {query}
        </Tag>
      ))}
    </Flex>
  );
}
