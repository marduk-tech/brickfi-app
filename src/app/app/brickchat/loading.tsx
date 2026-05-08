import { Loader } from "@/components/common/loader";
import { Flex } from "antd";

// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <Flex style={{ marginTop: 200 }} align="center" justify="center">
      <Loader></Loader>
    </Flex>
  );
}
