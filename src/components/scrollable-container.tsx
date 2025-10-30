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
        padding: "8px 4px",
        scrollbarWidth: "none",
        height: height - 250,
      }}
    >
      <Flex vertical>{children}</Flex>
    </div>
  );
}
