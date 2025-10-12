"use client";

import { BrickMapCustomer } from "@/components/map-view-v2/brick-map/brick-map-customer";
import { BrickMapAdmin } from "../../../components/map-view-v2/brick-map/brick-map-admin";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";

export default function BrickMap() {
  const { user } = useUser();
  const [projectIds, setProjectIds] = useState<string[]>([]);

    useEffect(() => {
       if (user && user.savedProjects) {
      setProjectIds(user.savedProjects);
    }
    }, [user]);
  return <BrickMapCustomer projectIds={projectIds} />;
}