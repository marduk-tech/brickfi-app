import { Metadata } from "next";
import Brk360sClient from "./brk360s-client";

export const metadata: Metadata = {
  title: "Brick360 Reports | Brickfi Admin",
  description: "Admin view of all Brick360 project reports",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Brk360sPage() {
  return <Brk360sClient />;
}
