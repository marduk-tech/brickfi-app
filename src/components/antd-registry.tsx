"use client";

// Server-side extraction of antd's CSS-in-JS styles, for every page (see the
// root layout).
//
// Uses antd's official Next.js registry, which on each streamed chunk sends
// only the styles that chunk added (extractStyle with `once: true`). The
// previous hand-rolled registry called extractStyle(cache, true) on every
// chunk, re-sending the entire stylesheet each time - e.g. the home page
// shipped the same ~135 KB of CSS 19 times (2.56 of its 2.66 MB of HTML),
// and the layout styles arrived late, so pages rendered unstyled first.
export { AntdRegistry as default } from "@ant-design/nextjs-registry";
