import React, { useEffect, useState } from "react";
import { Flex, Tag, Timeline, Typography } from "antd";
import dayjs from "dayjs";
import moment from "moment";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { capitalize } from "@/libs/lvnzy-helper";

interface PhaseItem {
  phase: string;
  name: string;
  startDate: string; // in DD-MM-YYYY
  completionDate: string; // in DD-MM-YYYY
}

interface EventItem {
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
}

interface PhaseTimeline {
  name: string;
  timeline: EventItem[];
}

interface TimelineTabProps {
  lvnzyProject: any;
}

const TimelineTabV2 = ({ lvnzyProject }: TimelineTabProps) => {
  const [timelines, setTimelines] = useState<any[]>([]);
  useEffect(() => {
    let timelines: any[] = [];
    try {
      timelines.push({
        name: lvnzyProject.originalProjectId.info.reraProjectId.projectDetails
          .projectName,
        timeline: lvnzyProject.meta.projectTimelines.sort((a: any, b: any) =>
          moment(a.startDate, "DD-MM-YYYY").diff(
            moment(b.startDate, "DD-MM-YYYY")
          )
        ),
      });

      lvnzyProject.developer.reraOtherPhases.forEach((p: any) => {
        timelines.push({
          name: p.projectDetails.projectName,
          timeline: p.projectDetails.listOfRegistrationsExtensions.sort(
            (a: any, b: any) =>
              moment(a.startDate, "DD-MM-YYYY").diff(
                moment(b.startDate, "DD-MM-YYYY")
              )
          ),
        });
      });

      timelines = timelines.sort((a: any, b: any) => {
        const diff = moment(b.timeline[0].startDate, "DD-MM-YYYY").diff(
          moment(a.timeline[0].startDate, "DD-MM-YYYY")
        );
        return diff;
      });

      setTimelines(
        timelines.map((t, i) => {
          return {
            dot: (
              <div
                style={{
                  height: 20,
                  width: 20,
                  border: `2px solid ${COLORS.textColorDark}`,
                  backgroundColor: COLORS.primaryColor,
                  borderRadius: "50%",
                }}
              ></div>
            ),
            children: (
              <Flex vertical>
                <Flex gap={8} align="center" style={{marginBottom: 4}}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    lineHeight: "110%",
                    textTransform: "uppercase",
                    color: COLORS.primaryColor,
                  }}
                >
                  {moment(t.timeline[0].startDate, "DD-MM-YYYY").format(
                    "MMM YYYY"
                  )}
                </Typography.Text>
                {t.timeline.length > 1 ? (
                    <Flex>
                    <Typography.Text
                      style={{
                        color: COLORS.orangeIdentifier,
                        border: `1px solid ${COLORS.orangeIdentifier}`,
                        padding: "1px 2px",
                        fontSize: FONT_SIZE.SUB_TEXT,
                        borderRadius: 4,
                      }}
                    >
                      DELAYED
                    </Typography.Text>
                    </Flex>
                  ) : null}
                  </Flex>
                <Flex align="center" gap={8}>
                  <Flex>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_2,
                      lineHeight: "110%",
                      
                    }}
                  >
                    {capitalize(t.name)}
                  </Typography.Text>
                  </Flex>
                  
                </Flex>
                <Flex vertical>
                  {t.timeline.map((entry: any, index: number) => {
                    return (
                      <Flex>
                        <Typography.Text
                          style={{
                            marginRight: 4,
                            color: COLORS.textColorMedium,
                            fontSize: FONT_SIZE.HEADING_4,
                          }}
                        >
                          {index == 0 ? "Initial Timeline" : "Extension"}:
                        </Typography.Text>
                        <Typography.Text
                          style={{
                            color: COLORS.textColorMedium,
                            fontSize: FONT_SIZE.HEADING_4,
                          }}
                        >
                          {moment(entry.startDate, "DD-MM-YYYY").format(
                            "MMM YYYY"
                          )}{" "}
                          -{" "}
                          {moment(entry.completionDate, "DD-MM-YYYY").format(
                            "MMM YYYY"
                          )}
                        </Typography.Text>
                      </Flex>
                    );
                  })}
                </Flex>
              </Flex>
            ),
          };
        })
      );
    } catch (err) {
      console.log("error while setting timelines");
    }
  }, [lvnzyProject]);

  return (
    <Flex vertical style={{ padding: "0 16px" }}>
      <Flex
        style={{
          width: "100",
          display: "inline",
          marginTop: 16,
          marginBottom: 32,
        }}
      >
        <Tag
          style={{
            lineHeight: "120%",
            padding: "4px 8px",
            borderRadius: 8,
            color: COLORS.textColorDark,
            fontSize: FONT_SIZE.PARA,
            width: "100",
            textWrap: "initial",
          }}
          color="processing"
        >
          The timeline shows different phases of the same project as per RERA
          records.
        </Tag>
      </Flex>
      <Timeline items={timelines}></Timeline>
    </Flex>
  );
};

export default TimelineTabV2;
