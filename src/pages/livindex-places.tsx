import { Flex } from "antd";
import { LivIndexFull } from "../components/map-view/map-old/liv-index-all/livindex-full";

export function MapView() {
  return (
    <Flex
      vertical
      style={{
        borderRadius: 16,
        height: "80vh",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <LivIndexFull></LivIndexFull>
    </Flex>
  );
}
