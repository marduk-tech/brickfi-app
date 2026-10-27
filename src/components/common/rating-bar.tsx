import { Flex } from "antd";
import React from "react";
import { COLORS } from "../../theme/style-constants";

const hexToRgb = (hex: string): number[] =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const rgbToHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase();

interface RatingBarProps {
  value: number;
}

const RatingBar: React.FC<RatingBarProps> = ({ value }) => {
  const totalBars = 5;
  const filledBars = Math.floor((value / 100) * totalBars);
  const partialFill = ((value / 100) * totalBars) % 1;

  const interpolate = (start: number, end: number, factor: number): number => {
    return Math.round(start + (end - start) * factor);
  };

  const getGradientColor = (value: number): string => {
    const clampedValue = Math.max(0, Math.min(100, value)); // Ensure the value is between 0-100

    // Define color stops
    const colors = [
      { stop: 0, color: "#f98518" }, // Red-Orange
      { stop: 30, color: "#f4c119" }, // Orange-Yellow
      { stop: 50, color: "#eee732" }, // Yellow Greenish
      { stop: 70, color: "#bdf163" }, // Greenish
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
  return (
    <Flex gap={0.8} style={{ display: "flex" }}>
      {[...Array(totalBars)].map((_, index) => {
        let fillPercentage = 0;
        if (index < filledBars) {
          fillPercentage = 100;
        } else if (index === filledBars) {
          fillPercentage = partialFill * 100;
        }
        return (
          <div
            key={index}
            style={{
              position: "relative",
              width: "16px",
              height: "16px",
              backgroundColor: COLORS.bgColorMedium,
              border: "1px solid",
              borderColor: COLORS.borderColorMedium,
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                height: "100%",
                width: `${fillPercentage}%`,
                backgroundColor: getGradientColor(value),
                transition: "height 0.3s ease",
              }}
            ></div>
          </div>
        );
      })}
    </Flex>
  );
};

export default RatingBar;
