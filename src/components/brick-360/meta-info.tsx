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
  const [isPmtPlanModalOpen, setIsPmtPlanModalOpen] = useState(false);
  const [pmtPlan, setPmtPlan] = useState();
  useEffect(() => {
    if (lvnzyProject && lvnzyProject.originalProjectId?.info?.financialPlan) {
      setPmtPlan(
        fetchPmtPlan(lvnzyProject.originalProjectId.info.financialPlan)
      );
    }
  }, [lvnzyProject]);

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
      <Flex vertical style={{ marginTop: 4 }}>
        <Flex align="center" gap={8}>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_3,
              margin: 0,
              color: COLORS.textColorDark,
            }}
          >
            {getMinMaxPrices(
              lvnzyProject?.originalProjectId.info.unitConfigWithPricing.map(
                (c: any) => c.price
              )
            )}
          </Typography.Text>
          {pmtPlan ? (
            <Flex
              align="center"
              ref={ref}
              style={{
                padding: "2px 8px",
                borderRadius: 8,
                backgroundColor: COLORS.textColorDark,
                border: `1px solid ${COLORS.textColorDark}`,
              }}
              gap={2}
            >
              <DynamicReactIcon
                iconName="RiDiscountPercentFill"
                iconSet="ri"
                size={20}
                color="white"
              ></DynamicReactIcon>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,

                  color: "white",
                }}
                onClick={() => {
                  setIsPmtPlanModalOpen(true);
                }}
              >
                {pmtPlan}
              </Typography.Text>
            </Flex>
          ) : null}
        </Flex>
        <Flex align="center">
          {renderText(`
            ${capitalize(
              lvnzyProject?.meta.projectUnitTypes.split(",")[0]
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
      <Modal
        open={isPmtPlanModalOpen}
        footer={null}
        closable={true}
        onCancel={() => {
          setIsPmtPlanModalOpen(false);
        }}
      >
        <Flex
          style={{
            height: 600,
            overflowY: "scroll",
            scrollbarWidth: "none",
            paddingTop: 32,
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {lvnzyProject.originalProjectId?.info?.financialPlan ||
              "No financial plan available"}
          </Markdown>
        </Flex>
      </Modal>
    </>
  );
});

export default MetaInfo;
