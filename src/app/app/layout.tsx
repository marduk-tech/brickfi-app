"use client";

import { ClientProviders } from "@/components/client-providers";
import { DashboardLayout } from "../../layouts/dashboard-layout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout>
      {" "}
      <ClientProviders>{children}</ClientProviders>
    </DashboardLayout>
  );
}
