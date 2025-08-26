import { Flex, Spin, SpinProps } from "antd";

export function Loader({ size = "large", ...props }: SpinProps) {
  return (
    <Flex align="center" justify="center" style={{ height: "200px" }}>
      <Spin size={size} {...props} />
    </Flex>
  );
}
