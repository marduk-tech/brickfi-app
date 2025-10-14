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
        top: topPos || 8,
        right: 8,
        zIndex: 1500,
      }}
    >
      <Button
        size="small"
        icon={
          <DynamicReactIcon
            iconName="FaExpand"
            color="white"
            iconSet="fa"
            size={12}
          />
        }
        style={{
          marginLeft: "auto",
          marginBottom: 8,
          borderRadius: 8,
          cursor: "pointer",
          backgroundColor: "rgba(0,0,0,0.75)",
          color: "white",
          fontSize: FONT_SIZE.SUB_TEXT,
          height: 24,
          padding: "12px 8px"
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
