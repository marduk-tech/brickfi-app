import { Flex, Spin, SpinProps } from "antd";

export function Loader({
  size = "large",
  height = 125,
  ...props
}: SpinProps & { height?: number }) {
  return (
    <Flex align="center" justify="center" style={{ height }}>
      <Spin size={size} {...props} />
    </Flex>
  );
}
