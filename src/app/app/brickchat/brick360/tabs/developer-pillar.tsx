"use client";

import { forwardRef } from "react";
import { BRICK360_CATEGORY } from "@/libs/constants";
import { LvnzyProject } from "@/types/LvnzyProject";
import { PillarBase, PillarProps } from "./pillar-base";
import { StatCard, StatCardRow, StatValue } from "./stat-card";

// The developer's whole RERA history - every RERA project of theirs,
// including this one and its other phases. The report endpoints
// (lvnzy-projects/slug, app-report/slug) populate
// originalProjectId.info.developerId.developerProjects[].reraProjectId with
// each project's `complaints`. Falls back to the response's
// developer.reraOtherProjects + reraOtherPhases if the developer doc isn't
// populated.
const getDeveloperReraProjects = (lvnzyProject?: LvnzyProject): any[] => {
  const developerProjects = (lvnzyProject as any)?.originalProjectId?.info
    ?.developerId?.developerProjects;
  if (Array.isArray(developerProjects)) {
    return developerProjects
      .map((dp: any) => dp?.reraProjectId)
      .filter((rp: any) => rp && typeof rp === "object");
  }
  const developer = (lvnzyProject as any)?.developer || {};
  return [
    ...(developer.reraOtherProjects || []),
    ...(developer.reraOtherPhases || []),
  ].filter(Boolean);
};

const DeveloperStats = ({ lvnzyProject }: { lvnzyProject?: LvnzyProject }) => {
  const reraProjects = getDeveloperReraProjects(lvnzyProject);
  if (!reraProjects.length) return null;

  const totalComplaints = reraProjects.reduce(
    (sum: number, rp: any) =>
      sum + (Array.isArray(rp.complaints) ? rp.complaints.length : 0),
    0,
  );

  return (
    <StatCardRow>
      <StatCard label="RERA REGISTERED PROJECTS">
        <StatValue>{reraProjects.length}</StatValue>
      </StatCard>
      <StatCard label="REGISTERED COMPLAINTS">
        <StatValue>{totalComplaints}</StatValue>
      </StatCard>
    </StatCardRow>
  );
};

// Developer pillar - RERA project/complaint counts above the shared
// data-point list/Q&A from PillarBase; no map plotting.
export const DeveloperPillar = forwardRef<any, PillarProps>((props, ref) => (
  <PillarBase
    {...props}
    ref={ref}
    categoryKey={BRICK360_CATEGORY.developer}
    header={<DeveloperStats lvnzyProject={props.lvnzyProject} />}
  />
));
DeveloperPillar.displayName = "DeveloperPillar";
