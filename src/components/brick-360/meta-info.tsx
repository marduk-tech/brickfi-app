import { Flex, Typography } from "antd";
import moment from "moment";
import { forwardRef } from "react";
import {
  capitalize,
  getMinMaxPrices,
} from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LvnzyProject } from "../../types/LvnzyProject";

type MetaInfoProps = {
  lvnzyProject: LvnzyProject;
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

  // Latest RERA completion date across all phases
  const allCompletionDates = (lvnzyProject?.developer?.reraOtherPhases || [])
    .flatMap((p: any) => p.projectDetails?.listOfRegistrationsExtensions || [])
    .map((ext: any) => moment(ext.completionDate, "DD-MM-YYYY"))
    .filter((d: any) => d.isValid());

  const latestCompletionDate =
    allCompletionDates.length > 0
      ? moment.max(allCompletionDates).format("MMM YYYY")
      : "";

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
