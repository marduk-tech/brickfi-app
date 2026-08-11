import { Flex, Modal, Typography } from "antd";
import moment from "moment";
import { forwardRef, useState } from "react";
import DynamicReactIcon, { IconSetKey } from "../common/dynamic-react-icon";
import { capitalize, getMinMaxPrices } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LvnzyProject } from "../../types/LvnzyProject";
import { useDevice } from "@/hooks/use-device";

type MetaInfoProps = {
  lvnzyProject: LvnzyProject;
};

const getLatestCompletionDate = (lvnzyProject: LvnzyProject): string => {
  const phasesExtensions = (
    lvnzyProject?.developer?.reraOtherPhases || []
  ).flatMap((p: any) => p.projectDetails?.listOfRegistrationsExtensions || []);

  const timelineExtensions =
    phasesExtensions.length > 0
      ? phasesExtensions
      : (lvnzyProject?.meta?.projectTimelines as any[]) || [];

  const allCompletionDates = timelineExtensions
    .map((ext: any) => moment(ext.completionDate, "DD-MM-YYYY"))
    .filter((d: any) => d.isValid());

  if (allCompletionDates.length > 0) {
    return moment.max(allCompletionDates).format("MMM YYYY");
  }

  const expectedDate =
    lvnzyProject?.originalProjectId?.info?.realTimeStatus
      ?.expectedCompletionDate;
  if (expectedDate) {
    const parsed = moment(expectedDate);
    if (parsed.isValid()) return parsed.format("MMM YYYY");
  }

  return "";
};

const PROJECT_STATUS = {
  READY_TO_MOVE: "Ready to Move",
  PARTIALLY_READY: "Partially Ready",
  NEW_LAUNCH: "New Launch",
  PRE_LAUNCH: "Launching Soon",
  UNDER_CONSTRUCTION: "Under Construction",
  NEAR_COMPLETION: "Near Completion",
} as const;

const PROJECT_STATUS_CONFIG: Record<
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

const ADVISOR_LINK =
  "https://www.brickfi.in/callback-request?srcIntent=brick360-status";

const MetaInfo = forwardRef<any, MetaInfoProps>(({ lvnzyProject }, ref) => {
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const {isMobile} = useDevice();

  const renderText = (text: string, color?: string) => {
    return (
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_4,
          margin: 0,
          color: color || COLORS.textColorMedium,
        }}
      >
        {text}
      </Typography.Text>
    );
  };

  if (!lvnzyProject) return null;

  // Latest RERA completion date: max entry per reraOtherPhases phase, plus max entry from meta.projectTimelines
  const getMaxCompletionDateEntry = (entries: any[]): any | null =>
    entries.reduce((latest: any, curr: any) => {
      const currDate = moment(curr.completionDate, "DD-MM-YYYY");
      if (!currDate.isValid()) return latest;
      if (!latest) return curr;
      const latestDate = moment(latest.completionDate, "DD-MM-YYYY");
      return currDate.isAfter(latestDate) ? curr : latest;
    }, null);

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

  const projectStatus = getProjectStatus(
    isPreLaunch,
    allCompletionDates,
    allStartDates,
    extensions.length > 1,
    expectedLaunchDate,
  );

  const projectStatusConfig = projectStatus
    ? PROJECT_STATUS_CONFIG[projectStatus]
    : null;

  return (
    <>
      <Flex vertical style={{ marginTop: 4, marginBottom: 0 }}>
        <Flex align="center" gap={8}>
          <Flex align="center" gap={4}>
            <DynamicReactIcon
              iconSet="tb"
              iconName="TbBuildingBank"
              size={14}
              color={COLORS.textColorMedium}
            />
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                margin: 0,
                color: COLORS.textColorMedium,
              }}
            >
              {lvnzyProject?.originalProjectId?.info?.developerId?.name ||
                "Developer"}
            </Typography.Text>
          </Flex>
          <Flex align="center">
            <DynamicReactIcon
              iconSet="io5"
              iconName="IoLocationSharp"
              size={14}
              color={COLORS.textColorMedium}
            />
            <Flex align="center">
              {renderText(`
            ${
              lvnzyProject.meta.projectCorridors.sort(
                (a: any, b: any) =>
                  a.approxDistanceInKms - b.approxDistanceInKms,
              )[0].corridorName
            }`)}
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={12}>
          <Flex align="center" gap={2}>
            <DynamicReactIcon
              iconSet="tb"
              iconName="TbHome"
              size={14}
              color={COLORS.textColorMedium}
            />
            <Typography.Text
              style={{
                fontSize: isMobile ? FONT_SIZE.PARA: FONT_SIZE.HEADING_4,
                margin: 0,
                color: COLORS.textColorMedium,
              }}
            >
              {lvnzyProject?.meta.projectUnitTypes
                .split(",")
                .map((unitType: string) =>
                  unitType.trim().toLowerCase() === "apartment"
                    ? "Apt"
                    : capitalize(unitType),
                )
                .join("/")}
            </Typography.Text>
          </Flex>
          <Flex align="center" gap={2}>
            <DynamicReactIcon
              iconSet="hi"
              iconName="HiOutlineCurrencyRupee"
              size={14}
              color={COLORS.textColorMedium}
            />
            <Typography.Text
              style={{
                fontSize: isMobile ? FONT_SIZE.PARA: FONT_SIZE.HEADING_4,
                margin: 0,
                color: COLORS.textColorMedium,
              }}
            >
              {getMinMaxPrices(
                lvnzyProject?.originalProjectId?.info.unitConfigWithPricing.map(
                  (c: any) => c.price,
                ),
              )}
            </Typography.Text>
          </Flex>

          {projectStatus && projectStatusConfig && (
            <Flex
              align="center"
              gap={4}
              onClick={() => setStatusModalOpen(true)}
              style={{
                border: `1.5px solid ${projectStatusConfig.color}`,
                borderRadius: 4,
                padding: "2px 4px",
                cursor: "pointer",
              }}
            >
              <DynamicReactIcon
                iconSet={projectStatusConfig.iconSet}
                iconName={projectStatusConfig.iconName}
                size={12}
                color={projectStatusConfig.color}
              />
              <Typography.Text
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  color: projectStatusConfig.color,
                }}
              >
                {projectStatus}
              </Typography.Text>
            </Flex>
          )}
        </Flex>
      </Flex>
      {projectStatus && projectStatusConfig && (
        <Modal
          open={statusModalOpen}
          onCancel={() => setStatusModalOpen(false)}
          footer={null}
          title={
            <Flex align="center" gap={6}>
              <DynamicReactIcon
                iconSet={projectStatusConfig.iconSet}
                iconName={projectStatusConfig.iconName}
                size={16}
                color={projectStatusConfig.color}
              />
              <Typography.Text style={{ fontWeight: 600, color: projectStatusConfig.color }}>
                {projectStatus}
              </Typography.Text>
            </Flex>
          }
        >
          <Typography.Text style={{ color: COLORS.textColorMedium, lineHeight: "100%" }}>
            {projectStatusConfig.description}
          </Typography.Text>
          <div style={{ marginTop: 12,lineHeight: "100%" }}>
            <Typography.Text style={{ lineHeight: .4, fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}>
              * For more details or for real time status, please{" "}
              <a href={ADVISOR_LINK} target="_blank" rel="noopener noreferrer" style={{color: COLORS.textColorDark, fontWeight: 500}}>
                reach out to a brickfi advisor
              </a>{" "}
              today
            </Typography.Text>
          </div>
        </Modal>
      )}
    </>
  );
});

export default MetaInfo;
