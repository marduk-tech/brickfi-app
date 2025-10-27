import { Flex, Modal, Tag, Typography } from "antd";
import { LvnzyProject } from "../../types/LvnzyProject";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import {
  capitalize,
  fetchPmtPlan,
  getMinMaxPrices,
  rupeeAmountFormat,
} from "../../libs/lvnzy-helper";
import moment from "moment";
import { forwardRef, useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DynamicReactIcon from "../common/dynamic-react-icon";

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

  const renderTimelineStatus = (completionDate: string) => {
    const year = moment(
      lvnzyProject?.meta.projectTimelines[
        lvnzyProject?.meta.projectTimelines.length - 1
      ].completionDate,
      "DD-MM-YYYY"
    ).year();
    const currentYear = moment().year();
    let label = year > currentYear ? "Under Construction" : year == currentYear;
    if (year == currentYear) {
      label = "Nearing Completion";
    } else {
      label = "Ready to Move";
    }
    return (
      <Flex
        style={{
          borderRadius: 4,
          padding: "0 2px",
          backgroundColor: "white",
          border: `2px solid ${COLORS.textColorDark}`,
          height: 24,
          marginLeft: 4
        }}
        align="center"
      >
        <Typography.Text
          style={{
            color: COLORS.textColorDark,
            fontSize: FONT_SIZE.SUB_TEXT,
            fontWeight: 500
          }}
        >
          {label}
        </Typography.Text>
      </Flex>
    );
  };

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
            {lvnzyProject?.originalProjectId?.info?.developerId?.name || "Developer"} · {capitalize(
              lvnzyProject?.meta.projectUnitTypes.split(",").join(" · ")
            )}
          </Typography.Text>
  
        </Flex>
        <Flex align="center">
          {renderText(`
            ${getMinMaxPrices(
              lvnzyProject?.originalProjectId?.info.unitConfigWithPricing.map(
                (c: any) => c.price
              )
            )} · ${
            lvnzyProject.meta.projectCorridors.sort(
              (a: any, b: any) => a.approxDistanceInKms - b.approxDistanceInKms
            )[0].corridorName
          } · ${moment(
            lvnzyProject?.meta.projectTimelines[
              lvnzyProject?.meta.projectTimelines.length - 1
            ].completionDate,
            "DD-MM-YYYY"
          ).format("MMM YYYY")}`)}
          {/* {renderTimelineStatus(
            lvnzyProject?.meta.projectTimelines[
              lvnzyProject?.meta.projectTimelines.length - 1
            ].completionDate
          )} */}
        </Flex>
      </Flex>
      
    </>
  );
});

export default MetaInfo;
