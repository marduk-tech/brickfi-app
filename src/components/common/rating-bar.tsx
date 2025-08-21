import { Flex } from "antd";
import React from "react";
import { COLORS } from "../../theme/style-constants";

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
      { stop: 0, color: [255, 76, 5] }, // Red-Orange
      { stop: 25, color: [255, 149, 107] }, // Orange-Yellow
      { stop: 50, color: [248, 237, 140] }, // Yellow Greenish
      { stop: 75, color: [144, 198, 124] }, // Greenish
      { stop: 100, color: [50, 142, 110] }, // Dark Green
    ];

    // Find two nearest stops
    for (let i = 0; i < colors.length - 1; i++) {
      const start = colors[i];
      const end = colors[i + 1];

      if (clampedValue >= start.stop && clampedValue <= end.stop) {
        const factor = (clampedValue - start.stop) / (end.stop - start.stop);

        const r = interpolate(start.color[0], end.color[0], factor);
        const g = interpolate(start.color[1], end.color[1], factor);
        const b = interpolate(start.color[2], end.color[2], factor);

        return `rgb(${r}, ${g}, ${b})`;
      }
    }

    // Default fallback (should never hit)
    return "rgb(255, 105, 97)";
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
