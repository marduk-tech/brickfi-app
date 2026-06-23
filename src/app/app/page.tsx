"use client";

import { BrickChatCore } from "./brickchat/brickchat-client";
import { usePinnedProjects } from "@/hooks/use-pinned-projects";
import { Loader } from "@/components/common/loader";
import { NoProjectsFound } from "@/components/common/no-projects-found";

export default function AppHomePage() {
  const { defaultProjectResults, defaultProjectsDescription, isLoading } = usePinnedProjects();

  if (isLoading) return <Loader />;
  if (!defaultProjectResults?.length) return <NoProjectsFound />;

  return (
    <BrickChatCore
      defaultProjectResults={defaultProjectResults}
      defaultProjectsDescription={defaultProjectsDescription}
    />
  );
}
