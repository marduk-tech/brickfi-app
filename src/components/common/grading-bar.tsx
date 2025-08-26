import React from "react";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { Flex, Typography } from "antd";
import DynamicReactIcon from "./dynamic-react-icon";

type GradientBarProps = {
  value: number;
  showBadgeOnly?: boolean;
};

const GradientBar: React.FC<GradientBarProps> = ({ value, showBadgeOnly }) => {
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

  const getSmileyIcon = (value: number, size?: number): any => {
    let iconName = "FaRegLaugh",
      iconSet: any = "fa",
      color = getGradientColor(value);
    size = size || 22;

    if (value >= 80) {
      iconName = "FaRegLaugh";
      iconSet = "fa";
      size = size * 0.8;
    } else if (value < 80 && value >= 65) {
      iconName = "PiSmileyBold";
      iconSet = "pi";
    } else if (value < 65 && value >= 40) {
      iconName = "PiSmileyMehBold";
      iconSet = "pi";
    } else if (value < 40 && value > 0) {
      iconName = "PiSmileySadBold";
      iconSet = "pi";
    } else {
      iconName = "PiSmileyMehDuotone";
      iconSet = "pi";
      color = "grey";
    }
    return (
      <DynamicReactIcon
        iconName={iconName}
        iconSet={iconSet}
        size={size}
        color={color}
      ></DynamicReactIcon>
    );
  };

  if (showBadgeOnly) {
    return (
      <Flex
        style={{
          color: COLORS.textColorDark,
          backgroundColor: "white",
          borderRadius: 6,
        }}
        gap={2}
        align="center"
      >
        <Typography.Text
          style={{
            fontWeight: 300,
            fontSize: FONT_SIZE.HEADING_4,
            color: COLORS.textColorDark,
          }}
        >
          {value ? Math.round(value * 5) / 100 : ""}
        </Typography.Text>
        {getSmileyIcon(value, 18)}
      </Flex>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 200,
        marginLeft: "auto",
        borderRadius: 24,
        border: "1px solid",
        borderColor: COLORS.borderColor,
      }}
    >
      {/* Gradient Background */}
      {value > 0 ? (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: COLORS.borderColorMedium,
            width: "100%",
            height: "100%",
            borderRadius: 24,
            border: "1px solid",
            borderColor: COLORS.borderColor,
          }}
        >
          <div
            style={{
              width: `${value}%`,
              backgroundColor: getGradientColor(value),
              height: "100%",
              border: "1px solid",
              borderRadius: 24,
              fontSize: FONT_SIZE.SUB_TEXT,
              color: "white",
              padding: "0 4px",
              textAlign: "center",
              borderColor: COLORS.borderColor,
            }}
          ></div>
        </div>
      ) : null}
    </div>
  );
};

export default GradientBar;
