"use client";

import { Flex } from "antd";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import DynamicReactIcon, {
  IconSetKey,
} from "@/components/common/dynamic-react-icon";

interface StaticQueriesProps {
  /** Disables clicking while a search is already in flight - matches the sample-prompts tags' own chatLoading guard in brickchat-client.tsx. */
  disabled?: boolean;
  onSelect: (query: string) => void;
}

// Icons follow the same style as SAMPLE_QUERIES on the landing page
// (custom-pages/landing/brick-chat.tsx).
const SAMPLE_PROMPTS: {
  text: string;
  icons: { iconName: string; iconSet: IconSetKey }[];
}[] = [
  {
    text: "Looking for a 3BHK near Electronic City under 2 crore",
    icons: [
      { iconName: "MdHome", iconSet: "md" },
      { iconName: "PiCurrencyInr", iconSet: "pi" },
    ],
  },
  {
    text: "Gated plot at less than 6000 per sq.ft in North Bangalore",
    icons: [
      { iconName: "MdLandscape", iconSet: "md" },
      { iconName: "MdLocationOn", iconSet: "md" },
    ],
  },
  {
    text: "4BHK under 3 crore with lake or forest facing views in East Bangalore",
    icons: [
      { iconName: "MdHome", iconSet: "md" },
      { iconName: "PiTree", iconSet: "pi" },
    ],
  },
  {
    text: "Where can I get the best rental in East Bangalore for 1.5 crore ?",
    icons: [
      { iconName: "PiKey", iconSet: "pi" },
      { iconName: "PiCurrencyInr", iconSet: "pi" },
    ],
  },
];

// 2x2 grid of pre-written queries - each one just fills the search box and
// submits it (see onSelect in brickchat-client.tsx). Kept as its own
// component since it's rendered unconditionally right after the welcome
// message (see showWelcome there), independent of the chatThreads-driven
// sample-prompts fallback further down the same screen.
export default function StaticQueries({
  disabled,
  onSelect,
}: StaticQueriesProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        // equal-height rows, sized to the tallest card
        gridAutoRows: "1fr",
        gap: 8,
      }}
    >
      {SAMPLE_PROMPTS.map((q) => (
        <button
          key={q.text}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(q.text)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 16,
            border: "none",
            backgroundColor: "white",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
            color: COLORS.textColorDark,
            fontSize: FONT_SIZE.PARA,
            lineHeight: "130%",
            textAlign: "left",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        >
          <Flex gap={4}>
            {q.icons.map((icon) => (
              <Flex
                key={`${icon.iconSet}-${icon.iconName}`}
                style={{
                  backgroundColor: COLORS.LANDING.PINK,
                  borderRadius: "50%",
                  padding: 3,
                }}
              >
                <DynamicReactIcon
                  iconName={icon.iconName}
                  iconSet={icon.iconSet}
                  size={12}
                  color="white"
                />
              </Flex>
            ))}
          </Flex>
          {q.text}
        </button>
      ))}
    </div>
  );
}
