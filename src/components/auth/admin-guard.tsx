"use client";

import { useUser } from "@/hooks/use-user";
import { Loader } from "../common/loader";
import AccessDenied from "./access-denied";

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function AdminGuard({
  children,
  allowedRoles = ["admin"],
}: AdminGuardProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <Loader />;
  }

  if (user?.role && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  return <AccessDenied />;
}
