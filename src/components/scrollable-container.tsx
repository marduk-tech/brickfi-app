import { Flex } from "antd";
import { useWindowDimensions } from "../hooks/use-browser-safe";

export function ScrollableContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  const { height } = useWindowDimensions();
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        paddingRight: 8,
        paddingTop: 8,
        scrollbarWidth: "none",
        height: height - 250,
      }}
    >
      <Flex vertical>{children}</Flex>
    </div>
  );
}
