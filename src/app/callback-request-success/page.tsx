import BrickfiCallbackSuccess from "@/components/common/brickfi-callback-success";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brickfi | Advisor Callback",
  description: "Brickfi advisor callback form.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BrickfiCallbackSuccessPage() {
  return <BrickfiCallbackSuccess />;
}
