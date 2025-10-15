"use client";

import { Brick360v2 } from "@/components/brick-360/brick360-v2";

export default function Brick360Client({ slug }: { slug: string }) {
  return <Brick360v2 slug={slug} />;
}
