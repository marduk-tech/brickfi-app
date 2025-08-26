import { Flex, Typography } from "antd";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

export function Maintenance() {
  return (
    <Flex
      align="center"
      vertical
      style={{ paddingTop: 128, textAlign: "center" }}
      justify="center"
    >
      <DynamicReactIcon
        iconName="GiMagicBroom"
        iconSet="gi"
        size={100}
        color={COLORS.textColorLight}
      ></DynamicReactIcon>
      <Typography.Title level={4}>
        Brickfi is currently undergoing maintenance
      </Typography.Title>
      <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3 }}>
        Please revisit this page in sometime.
      </Typography.Text>
    </Flex>
  );
}
