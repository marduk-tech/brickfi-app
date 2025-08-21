import { Flex } from "antd";

export function ScrollableContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        paddingRight: 8,
        paddingTop: 8,
        scrollbarWidth: "none",
        height: window.innerHeight - 250,
      }}
    >
      <Flex vertical>{children}</Flex>
    </div>
  );
}
