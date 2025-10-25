import type { Metadata } from "next";
import OfflineClient from "./offline-client";

export const metadata: Metadata = {
  title: "Offline | Brickfi",
  description: "You are currently offline. Please check your connection.",
};

export default function OfflinePage() {
  return <OfflineClient />;
}
