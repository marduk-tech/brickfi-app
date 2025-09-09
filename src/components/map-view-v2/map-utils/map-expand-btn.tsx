import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex } from "antd";

interface MapExpandBtnProps {
    topPos?: number;
  onClick: () => void;
}


export const MapExpandBtn = ({
    topPos,
  onClick,
}: MapExpandBtnProps) => {
  return (
    <Flex
      style={{
        position: "absolute",
        top: topPos || 68,
        left: 14,
        zIndex: 1500,
      }}
    >
      <Button
        size="small"
        icon={
          <DynamicReactIcon
            iconName="FaExpand"
            color={COLORS.textColorDark}
            iconSet="fa"
            size={16}
          />
        }
        style={{
          marginLeft: "auto",
          marginBottom: 8,
          borderRadius: 8,
          cursor: "pointer",
          backgroundColor: "white",
          color: COLORS.textColorDark,
          fontSize: FONT_SIZE.HEADING_4,
          height: 28,
        }}
        onClick={() => {
          onClick();
        }}
      >
        Expand
      </Button>
    </Flex>
  );
};
