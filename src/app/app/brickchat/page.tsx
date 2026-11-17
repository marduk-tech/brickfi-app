import { BrickChatMaintenanceGate } from "@/components/common/brickchat-maintenance";
import BrickChatClient from "./brickchat-client";

export { metadata } from "./metadata";

export default async function BrickChatPage() {
  return (
    <BrickChatMaintenanceGate>
      <BrickChatClient />
    </BrickChatMaintenanceGate>
  );
}
