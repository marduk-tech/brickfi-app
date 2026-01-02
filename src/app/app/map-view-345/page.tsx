"use client";

import { BrickMapAdmin } from "../../../components/map-view-v2/brick-map/brick-map-admin";
import { AdminGuard } from "@/components/auth/admin-guard";

export default function MapView345Page() {
  return (
    <AdminGuard>
      <BrickMapAdmin />
    </AdminGuard>
  );
}