import { Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";

export const CorridorMarkerIcon = ({ name }: { name?: string }) => {
  function svgRings() {
    return (
      <svg width="50" height="50" viewBox="0 0 200 200">
        {/* Solid filled center circle */}
        <circle cx="100" cy="100" r="6" fill={COLORS.textColorDark} />

        {/* Animated rings */}
        <circle
          cx="100"
          cy="100"
          r="10"
          fill="none"
          stroke={COLORS.textColorDark}
          strokeWidth="2"
        >
          <animate
            attributeName="r"
            from="10"
            to="90"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="1"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="100"
          cy="100"
          r="10"
          fill="none"
          stroke={COLORS.textColorDark}
          strokeWidth="2"
        >
          <animate
            attributeName="r"
            from="10"
            to="90"
            begin="0.5s"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="1"
            to="0"
            begin="0.5s"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="100"
          cy="100"
          r="10"
          fill="none"
          stroke={COLORS.textColorDark}
          strokeWidth="2"
        >
          <animate
            attributeName="r"
            from="10"
            to="90"
            begin="1s"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="1"
            to="0"
            begin="1s"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="100"
          cy="100"
          r="10"
          fill="none"
          stroke={COLORS.textColorDark}
          strokeWidth="2"
        >
          <animate
            attributeName="r"
            from="10"
            to="90"
            begin="1.5s"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="1"
            to="0"
            begin="1.5s"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    );
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        zIndex: 999999999,
      }}
    >
      {/* {svgRings()} */}
      <DynamicReactIcon
        iconName="LuMilestone"
        iconSet="lu"
        color={COLORS.textColorDark}
        size={18}
      ></DynamicReactIcon>
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_4,
          fontWeight: 500,
          lineHeight: "120%",
          color: COLORS.textColorDark,
        }}
      >
        {name}
      </Typography.Text>
    </div>
  );
};
