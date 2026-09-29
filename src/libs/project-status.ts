import moment from "moment";
import { IconSetKey } from "../components/common/dynamic-react-icon";
import { COLORS } from "../theme/style-constants";
import { LvnzyProject } from "../types/LvnzyProject";

export const PROJECT_STATUS = {
  READY_TO_MOVE: "Ready to Move",
  PARTIALLY_READY: "Partially Ready",
  NEW_LAUNCH: "New Launch",
  PRE_LAUNCH: "Launching Soon",
  UNDER_CONSTRUCTION: "Under Construction",
  NEAR_COMPLETION: "Near Completion",
} as const;

export const PROJECT_STATUS_CONFIG: Record<
  string,
  { color: string; iconSet: IconSetKey; iconName: string; description: string }
> = {
  [PROJECT_STATUS.READY_TO_MOVE]: {
    color: COLORS.primaryColor,
    iconSet: "bi",
    iconName: "BiSolidBoltCircle",
    description: "The project has been completed and in ready to move status.",
  },
  [PROJECT_STATUS.PARTIALLY_READY]: {
    color: COLORS.primaryColor,
    iconSet: "tb",
    iconName: "TbProgressBolt",
    description:
      "The project is partially ready with one or more phases completed and others under construction or recently launched.",
  },
  [PROJECT_STATUS.PRE_LAUNCH]: {
    color: COLORS.primaryColor,
    iconSet: "gi",
    iconName: "GiFallingStar",
    description:
      "The project is expected to launch soon and currerntly accepting expression of interest applications.",
  },
  [PROJECT_STATUS.NEW_LAUNCH]: {
    color: COLORS.primaryColor,
    iconSet: "gi",
    iconName: "GiFallingStar",
    description:
      "The project is newly launched in last 6 months with minimal active construction.",
  },
  [PROJECT_STATUS.UNDER_CONSTRUCTION]: {
    color: COLORS.primaryColor,
    iconSet: "io5",
    iconName: "IoConstructOutline",
    description: "The project is under active construction.",
  },
  [PROJECT_STATUS.NEAR_COMPLETION]: {
    color: COLORS.primaryColor,
    iconSet: "tb",
    iconName: "TbProgressBolt",
    description:
      "The project is nearing completion and expected to be ready within 6 months to 1 year.",
  },
};

const getProjectStatus = (
  isPreLaunch: boolean,
  allCompletionDates: any[],
  allStartDates: any[],
  hasMultiplePhases: boolean,
  expectedLaunchDate?: string,
): string | null => {
  if (allCompletionDates.length === 0 && !isPreLaunch) {
    // No RERA timeline data to go on (e.g. pre-RERA projects) — fall back to
    // expectedLaunchDate: if it's already in the past, the project has
    // presumably launched and is ready to move.
    const hasPastLaunchDate =
      !!expectedLaunchDate &&
      moment(expectedLaunchDate).isValid() &&
      moment(expectedLaunchDate).isBefore(moment());
    return hasPastLaunchDate ? PROJECT_STATUS.READY_TO_MOVE : null;
  }
  if (allCompletionDates.length === 0 && isPreLaunch) return PROJECT_STATUS.PRE_LAUNCH;

  const now = moment();
  const latestCompletionDate = moment.max(allCompletionDates);

  if (latestCompletionDate.isBefore(now.clone().subtract(11, "months"))) {
    return PROJECT_STATUS.READY_TO_MOVE;
  }
  if (
    hasMultiplePhases &&
    allCompletionDates.some((d: any) =>
      d.isSameOrBefore(now.clone().subtract(6, "months")),
    ) &&
    !allCompletionDates.every((d: any) =>
      d.isSameOrBefore(now.clone().subtract(6, "months")),
    )
  ) {
    return PROJECT_STATUS.PARTIALLY_READY;
  }
  if (
    isPreLaunch ||
    allStartDates.some((d: any) =>
      d.isBetween(now.clone().subtract(6, "months"), now, undefined, "[]"),
    )
  ) {
    return PROJECT_STATUS.NEW_LAUNCH;
  }
  if (latestCompletionDate.isAfter(now.clone().add(6, "months"))) {
    return PROJECT_STATUS.UNDER_CONSTRUCTION;
  }
  return PROJECT_STATUS.NEAR_COMPLETION;
};

// Latest RERA completion date: max entry per reraOtherPhases phase, plus max entry from meta.projectTimelines
const getMaxCompletionDateEntry = (entries: any[]): any | null =>
  entries.reduce((latest: any, curr: any) => {
    const currDate = moment(curr.completionDate, "DD-MM-YYYY");
    if (!currDate.isValid()) return latest;
    if (!latest) return curr;
    const latestDate = moment(latest.completionDate, "DD-MM-YYYY");
    return currDate.isAfter(latestDate) ? curr : latest;
  }, null);

/** Derives the current PROJECT_STATUS value for a project from its RERA
 * timeline/extension data (falling back to expectedLaunchDate when there's
 * no RERA data to go on). Shared by meta-info.tsx and units-tab.tsx. */
export const computeProjectStatus = (lvnzyProject: any): string | null => {
  if (!lvnzyProject) return null;

  const extensions = [
    ...(lvnzyProject?.developer?.reraOtherPhases || [])
      .map((p: any) =>
        getMaxCompletionDateEntry(
          p.projectDetails?.listOfRegistrationsExtensions || [],
        ),
      )
      .filter(Boolean),
    getMaxCompletionDateEntry(
      (lvnzyProject?.meta?.projectTimelines as any[]) || [],
    ),
  ].filter(Boolean);

  const allStartDates = extensions
    .map((ext: any) => moment(ext.startDate, "DD-MM-YYYY"))
    .filter((d: any) => d.isValid());

  const expectedLaunchDate =
    lvnzyProject?.originalProjectId?.info?.realTimeStatus?.expectedLaunchDate;
  const isLaunchInFuture =
    !!expectedLaunchDate &&
    moment(expectedLaunchDate).isValid() &&
    moment(expectedLaunchDate).isAfter(moment());

  const isPreLaunch =
    isLaunchInFuture ||
    (allStartDates.length > 0 &&
      allStartDates.every((d: any) => d.isAfter(moment())));

  const allCompletionDates = extensions
    .map((ext: any) => moment(ext.completionDate, "DD-MM-YYYY"))
    .filter((d: any) => d.isValid());

  return getProjectStatus(
    isPreLaunch,
    allCompletionDates,
    allStartDates,
    extensions.length > 1,
    expectedLaunchDate,
  );
};
