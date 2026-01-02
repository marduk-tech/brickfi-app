"use client";

import { useUser } from "@/hooks/use-user";
import { Loader } from "../common/loader";
import AccessDenied from "./access-denied";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loader />;
  }

  if (user?.role === "admin") {
    return <>{children}</>;
  }

  return <AccessDenied />;
}
