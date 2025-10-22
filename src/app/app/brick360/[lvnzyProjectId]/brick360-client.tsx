"use client";

import { Brick360v2 } from "@/components/brick-360/brick360-v2";
import { Loader } from "@/components/common/loader";
import { Flex } from "antd";
import { useEffect, useState } from "react";

export default function Brick360Client({ slug }: { slug: string }) {
  const [flickerWait, setFlickerWait] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFlickerWait(false);
    }, 500);
  });
  if (flickerWait) {
    return (
      <Flex style={{ marginTop: 200 }} align="center" justify="center">
        <Loader></Loader>
      </Flex>
    );
  }
  return <Brick360v2 slug={slug} />;
}
