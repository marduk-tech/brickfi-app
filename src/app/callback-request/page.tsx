import { BrickfiCallback } from "@/components/common/brickfi-callback";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brickfi | Request a callback",
  description: "Admin view of all Brick360 project reports",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Brk360sPage() {
  return <BrickfiCallback />;
}
