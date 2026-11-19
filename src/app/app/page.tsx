import { BrickChatMaintenanceGate } from "@/components/common/brickchat-maintenance";
import { Metadata } from "next";
import BrickChatClient from "./brickchat/brickchat-client";

export { metadata } from "./brickchat/metadata";

export default async function AppHomePage() {
  return (
    <BrickChatMaintenanceGate>
      <BrickChatClient />
    </BrickChatMaintenanceGate>
  );
}
