"use client";

import { MetroMapper } from "../components/metro-mapper/metro-mapper";
import { AdminGuard } from "@/components/auth/admin-guard";

export default function MetroMapperPage() {
  return (
    <AdminGuard>
      <MetroMapper />
    </AdminGuard>
  );
}