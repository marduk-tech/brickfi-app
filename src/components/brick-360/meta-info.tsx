import { Flex, Tag, Typography } from "antd";
import moment from "moment";
import { forwardRef } from "react";
import { capitalize, getMinMaxPrices } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LvnzyProject } from "../../types/LvnzyProject";

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
    lvnzyProject?.originalProjectId?.info?.realTimeStatus?.expectedCompletionDate;
  if (expectedDate) {
    const parsed = moment(expectedDate);
    if (parsed.isValid()) return parsed.format("MMM YYYY");
  }

  return "";
};

const MetaInfo = forwardRef<any, MetaInfoProps>(({ lvnzyProject }, ref) => {
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

  const latestCompletionDate = getLatestCompletionDate(lvnzyProject);

  const expectedLaunchDate =
    lvnzyProject?.originalProjectId?.info?.realTimeStatus?.expectedLaunchDate;
  const isPreLaunch =
    !!expectedLaunchDate &&
    moment(expectedLaunchDate).isAfter(moment());

  return (
    <>
      <Flex vertical style={{ marginTop: 4, marginBottom: 0 }}>
        <Flex align="center" gap={8}>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              margin: 0,
              color: COLORS.textColorMedium,
            }}
          >
            {lvnzyProject?.originalProjectId?.info?.developerId?.name ||
              "Developer"}{" "}
            ·{" "}
            {capitalize(
              lvnzyProject?.meta.projectUnitTypes.split(",").join(" · "),
            )}
          </Typography.Text>
          {isPreLaunch && <Tag style={{fontSize: 12}} color="orange">Pre Launch</Tag>}
        </Flex>
        <Flex align="center">
          {renderText(`
            ${getMinMaxPrices(
              lvnzyProject?.originalProjectId?.info.unitConfigWithPricing.map(
                (c: any) => c.price,
              ),
            )} · ${
              lvnzyProject.meta.projectCorridors.sort(
                (a: any, b: any) =>
                  a.approxDistanceInKms - b.approxDistanceInKms,
              )[0].corridorName
            }${latestCompletionDate ? ` · ${latestCompletionDate}` : ""}`)}
        </Flex>
      </Flex>
    </>
  );
});

export default MetaInfo;
