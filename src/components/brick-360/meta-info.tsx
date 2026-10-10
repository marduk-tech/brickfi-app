import { Flex, Modal, Typography } from "antd";
import moment from "moment";
import { forwardRef, useState } from "react";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { capitalize, getMinMaxPrices } from "../../libs/lvnzy-helper";
import {
  computeProjectStatus,
  PROJECT_STATUS_CONFIG,
} from "../../libs/project-status";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LvnzyProject } from "../../types/LvnzyProject";
import { useDevice } from "@/hooks/use-device";
import { useBrick360FontSize } from "@/app/app/brickchat/brick360/use-font-size";

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
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);

  const { isMobile } = useDevice();
  // must run before the early return below (rules of hooks)
  const fs = useBrick360FontSize();

  if (!lvnzyProject) return null;

  const projectStatus = computeProjectStatus(lvnzyProject);

  // the one-line summary (configurations, price range, nearest corridor) -
  // clipped with an ellipsis, full text in a dialog on click
  const unitTypesText = (lvnzyProject?.meta.projectUnitTypes || "")
    .split(",")
    .map((unitType: string) => capitalize(unitType))
    .join("/");
  const priceText = getMinMaxPrices(
    (lvnzyProject?.originalProjectId?.info.unitConfigWithPricing || []).map(
      (c: any) => c.price,
    ),
  );
  // sorted copy - .sort() on the array itself would reorder the project data
  const corridorText =
    [...(lvnzyProject.meta.projectCorridors || [])].sort(
      (a: any, b: any) => a.approxDistanceInKms - b.approxDistanceInKms,
    )[0]?.corridorName || "";

  const projectStatusConfig = projectStatus
    ? PROJECT_STATUS_CONFIG[projectStatus]
    : null;

  return (
    <Flex style={{ margin: 0, minWidth: 0, maxWidth: "100%" }}>
     
      <Flex
        style={{
          border: `0px solid ${COLORS.borderColor}`,
          marginTop: 0,
          marginBottom: 0,
          borderRadius: 8,
          minWidth: 0,
          maxWidth: "100%",
        }}
        gap={isMobile ? 8: 16}
        vertical
      >
        <div
          onClick={() => setSummaryModalOpen(true)}
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            minWidth: 0,
            maxWidth: "100%",
            cursor: "pointer",
            fontSize: fs.HEADING_3,
            color: COLORS.textColorMedium,
          }}
        >
          {unitTypesText},{" "}
          <span style={{ display: "inline-flex", verticalAlign: "middle" }}>
            <DynamicReactIcon
              iconSet="fa6"
              iconName="FaIndianRupeeSign"
              size={16}
              color={COLORS.textColorMedium}
            />
          </span>
          {priceText}
          {corridorText ? `, ${corridorText}` : ""}
        </div>
        <Flex align="center" gap={16} style={{marginTop: 0}}>
          <Flex align="center" gap={8} style={{backgroundColor: COLORS.bgColorMedium, padding: "2px 4px", borderRadius: 4}}>
            <DynamicReactIcon
              iconSet="tb"
              iconName="TbBuildingBank"
              size={18}
              color={COLORS.textColorDark}
            />
            <Typography.Text
              style={{
                fontSize:isMobile ? FONT_SIZE.SUB_TEXT : FONT_SIZE.HEADING_4,
                margin: 0,
                color: COLORS.textColorDark,
              }}
            >
              {lvnzyProject?.originalProjectId?.info?.developerId?.name ||
                "Developer"}
            </Typography.Text>
          </Flex>
           {projectStatus && projectStatusConfig && (
        <Flex
          align="center"
          gap={4}
          onClick={() => setStatusModalOpen(true)}
          style={{
            cursor: "pointer",
            backgroundColor: COLORS.bgColorMedium, 
            padding: "2px 4px", borderRadius: 4
          }}
        >
          <DynamicReactIcon
            iconSet={projectStatusConfig.iconSet}
            iconName={projectStatusConfig.iconName}
            size={18}
            color={COLORS.textColorDark}
          />
          <Typography.Text
            style={{
              fontSize:isMobile ? FONT_SIZE.SUB_TEXT : FONT_SIZE.HEADING_4,
              fontWeight: 500,
              color: COLORS.textColorDark,
            }}
          >
            {projectStatus}
          </Typography.Text>
        </Flex>
      )}
       
        </Flex>
       
       
      </Flex>
      <Modal
        open={summaryModalOpen}
        onCancel={() => setSummaryModalOpen(false)}
        footer={null}
        title={lvnzyProject.meta.projectName}
      >
        <Flex vertical gap={8}>
          {[
            ["Configurations", unitTypesText],
            ["Price range", priceText ? `₹${priceText}` : ""],
            ["Corridor", corridorText],
          ]
            .filter(([, value]) => !!value)
            .map(([label, value]) => (
              <Flex vertical key={label}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorLight,
                  }}
                >
                  {label}
                </Typography.Text>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    color: COLORS.textColorDark,
                  }}
                >
                  {value}
                </Typography.Text>
              </Flex>
            ))}
        </Flex>
      </Modal>
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
              <Typography.Text
                style={{ fontWeight: 600, color: projectStatusConfig.color }}
              >
                {projectStatus}
              </Typography.Text>
            </Flex>
          }
        >
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.PARA,
              color: "white",
              lineHeight: "100%",
            }}
          >
            {projectStatusConfig.description}
          </Typography.Text>
          <div style={{ marginTop: 12, lineHeight: "100%" }}>
            <Typography.Text
              style={{
                lineHeight: 0.4,
                fontSize: FONT_SIZE.SUB_TEXT,
                color: COLORS.textColorLight,
              }}
            >
              * For more details or for real time status, please{" "}
              <a
                href={ADVISOR_LINK}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: COLORS.textColorDark, fontWeight: 500 }}
              >
                reach out to a brickfi advisor
              </a>{" "}
              today
            </Typography.Text>
          </div>
        </Modal>
      )}
    </Flex>
  );
});

export default MetaInfo;
