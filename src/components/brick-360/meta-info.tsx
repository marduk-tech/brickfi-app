import { Flex, Modal, Typography } from "antd";
import moment from "moment";
import { forwardRef, useState } from "react";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { capitalize, getMinMaxPrices } from "../../libs/lvnzy-helper";
import { computeProjectStatus, PROJECT_STATUS_CONFIG } from "../../libs/project-status";
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

const ADVISOR_LINK =
  "https://www.brickfi.in/callback-request?srcIntent=brick360-status";

const MetaInfo = forwardRef<any, MetaInfoProps>(({ lvnzyProject }, ref) => {
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const {isMobile} = useDevice();

  const renderText = (text: string, color?: string) => {
    return (
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.PARA,
          margin: 0,
          color: color || COLORS.textColorMedium,
        }}
      >
        {text}
      </Typography.Text>
    );
  };

  if (!lvnzyProject) return null;

  const projectStatus = computeProjectStatus(lvnzyProject);

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
                fontSize: FONT_SIZE.PARA,
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
                fontSize: isMobile ? FONT_SIZE.PARA: FONT_SIZE.PARA,
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
                fontSize: isMobile ? FONT_SIZE.PARA: FONT_SIZE.PARA,
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
          <Typography.Text style={{ fontSize: FONT_SIZE.PARA, color: COLORS.textColorMedium, lineHeight: "100%" }}>
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
