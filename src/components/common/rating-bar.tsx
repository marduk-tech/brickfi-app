import { Flex, Typography } from "antd";
import React from "react";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

const hexToRgb = (hex: string): number[] =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase();

interface RatingBarProps {
  value: number;
}

// Same overall width the old five 16px blocks took, so layouts don't shift
const BAR_WIDTH = 125;
const BAR_HEIGHT = 8;

const RatingBar: React.FC<RatingBarProps> = ({ value }) => {
  const clampedValue = Math.max(0, Math.min(100, Number(value) || 0));

  const interpolate = (start: number, end: number, factor: number): number => {
    return Math.round(start + (end - start) * factor);
  };

  const getGradientColor = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(100, value)); // Ensure the value is between 0-100

    // Define color stops
    const colors = [
      { stop: 0, color: "#f98518" }, // Red-Orange
      { stop: 30, color: "#f4c119" }, // Orange-Yellow
      { stop: 60, color: "#f5ef35" }, // Yellow Greenish
      { stop: 80, color: "#bdf163" }, // Greenish
      { stop: 100, color: "#0cd68f" }, // Dark Green
    ].map(({ stop, color }) => ({ stop, color: hexToRgb(color) }));

    // Find two nearest stops
    for (let i = 0; i < colors.length - 1; i++) {
      const start = colors[i];
      const end = colors[i + 1];

      if (clampedValue >= start.stop && clampedValue <= end.stop) {
        const factor = (clampedValue - start.stop) / (end.stop - start.stop);

        const r = interpolate(start.color[0], end.color[0], factor);
        const g = interpolate(start.color[1], end.color[1], factor);
        const b = interpolate(start.color[2], end.color[2], factor);

        return rgbToHex(r, g, b);
      }
    }

    // Default fallback (should never hit)
    return "#FF6961";
  };
  // the rating out of 5, rounded up to one decimal - e.g. 76 -> "3.8",
  // 77 -> "3.9". value / 2 is the out-of-5 rating in tenths, so ceil it
  // there to avoid floating point error from scaling first.
  const outOfFive = (Math.ceil(clampedValue / 2) / 10).toFixed(1);

  return (
    <Flex vertical gap={2} style={{ width: BAR_WIDTH, marginTop: -2 }}>
      <Typography.Text
        style={{
          alignSelf: "flex-end",
          lineHeight: "12px",
          fontWeight: 500,
          color: COLORS.textColorDark,
          fontSize: FONT_SIZE.SUB_TEXT
        }}
      >
        {outOfFive}
      </Typography.Text>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: BAR_HEIGHT,
          backgroundColor: COLORS.bgColorMedium,
          borderColor: COLORS.borderColorMedium,
          borderRadius: BAR_HEIGHT,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${clampedValue}%`,
            backgroundColor: getGradientColor(clampedValue),
            borderRadius: BAR_HEIGHT,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </Flex>
  );
};

export default RatingBar;
