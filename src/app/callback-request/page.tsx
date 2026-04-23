import { BrickfiCallback } from "@/components/common/brickfi-callback";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brickfi | Request a callback",
   description: "Brickfi advisor callback form.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BrickfiCallbackPage() {
  return <BrickfiCallback />;
}
