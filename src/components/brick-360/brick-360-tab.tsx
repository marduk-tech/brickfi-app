import { Alert, Flex, List, Typography } from "antd";
import { forwardRef, ReactNode, useState } from "react";
import { BRICK360_CATEGORY, Brick360DataPoints } from "../../libs/constants";
import {
  capitalize,
  captureAnalyticsEvent,
  getCategoryScore,
} from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import GradientBar from "../common/grading-bar";
import RatingBar from "../common/rating-bar";
import { ScrollableContainer } from "../scrollable-container";
import { SnapshotModal } from "./snapshot-modal";
const { Paragraph } = Typography;

interface Brick360TabProps {
  lvnzyProject: any;
  scoreParams: any[];
  onDataPointClick: (category: any, item: any) => void;
}

export const Brick360Tab = forwardRef<any, Brick360TabProps>(
  ({ lvnzyProject, scoreParams, onDataPointClick }, ref) => {
    const [quickSnapshotDialogOpen, setQuickSnapshotDialogOpen] =
      useState(false);
    const [quickSnapshotDialogContent, setQuickSnapshotDialogContent] =
      useState<ReactNode>("");

    function renderSummaryPoint(pt: string, isPro: boolean) {
      const match = pt.match(/<b>(.*?)<\/b>/);
      const title = match ? match[1] : null;

      function reasoningStmt(isDialog: boolean) {
        return (
          <Flex vertical>
            <Flex align="flex-start" gap={4} style={{ marginBottom: 8 }}>
              {isDialog ? null : (
                <DynamicReactIcon
                  size={isPro ? 20 : 24}
                  iconName={isPro ? "FaRegLaugh" : "PiSmileySadBold"}
                  iconSet={isPro ? "fa" : "pi"}
                  color={isPro ? COLORS.primaryColor : COLORS.redIdentifier}
                ></DynamicReactIcon>
              )}
              <Typography.Text
                style={{
                  fontWeight: 500,
                  fontSize: FONT_SIZE.HEADING_2,
                  lineHeight: "110%",
                  marginTop: isDialog ? 24 : 0,
                }}
              >
                {title}
              </Typography.Text>
            </Flex>
            <div
              dangerouslySetInnerHTML={{
                __html: `${pt.replace(`<b>${title}</b><br>`, "")} ${
                  !isDialog ? '<span class="read-more">Read more</span>' : ""
                }`,
              }}
              className={`reasoning ${!isDialog ? "truncated" : ""} ${
                isPro ? "" : "con"
              }`}
              style={{
                fontSize: !isDialog ? FONT_SIZE.HEADING_4 : FONT_SIZE.HEADING_3,
                margin: 0,
                marginTop: !isDialog ? 0 : 16,
                width: !isDialog ? 275 : "100%",
                color: COLORS.textColorMedium,

                textWrap: "wrap",
              }}
            ></div>
          </Flex>
        );
      }
      return (
        <Flex
          align="flex-start"
          style={{
            padding: "8px",
            backgroundColor: isPro ? "#f7fcff" : "#fffafa",
            borderRadius: 8,
            cursor: "pointer",
            borderWidth: "0.05px",
            borderColor: COLORS.borderColorMedium,
            borderStyle: "solid",
          }}
          onClick={() => {
            setQuickSnapshotDialogOpen(true);
            setQuickSnapshotDialogContent(reasoningStmt(true));
            captureAnalyticsEvent("summary-expand", {
              summaryType: isPro ? "pros" : "cons",
              summaryTitle: title,
              projectName: lvnzyProject?.meta.projectName,
              projectId: lvnzyProject._id
            });
          }}
          gap={4}
          vertical
        >
          {reasoningStmt(false)}
        </Flex>
      );
    }

    return (
      <ScrollableContainer>
        <Flex vertical>
          {/* Summary point */}
          {lvnzyProject?.score.summary && (
            <Flex vertical style={{ marginBottom: 16 }}>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.PARA,
                  marginBottom: 4,
                  color: COLORS.textColorMedium,
                }}
              >
                360 HIGHLIGHTS
              </Typography.Text>
              <Flex
                gap={16}
                style={{
                  width: "100%",
                  overflowX: "scroll",
                  whiteSpace: "nowrap",
                  scrollbarWidth: "none",
                }}
              >
                {lvnzyProject?.score.summary.pros.map((p: any) => {
                  return renderSummaryPoint(p, true);
                })}
                {lvnzyProject?.score.summary.cons.map((p: any) => {
                  return renderSummaryPoint(p, false);
                })}
              </Flex>
            </Flex>
          )}
          {/*  data points */}
          <Flex vertical gap={24} style={{ paddingBottom: 125, paddingTop: 0 }}>
            {scoreParams &&
              scoreParams.map((sc) => {
                return (
                  <Flex vertical>
                    <Flex
                      gap={4}
                      align="center"
                      style={{
                        borderBottom: "1px solid",
                        paddingBottom: 8,
                        borderBottomColor: COLORS.borderColor,
                      }}
                    >
                      <Flex
                        style={{
                          width: 24,
                          height: 24,
                        }}
                        align="center"
                        justify="center"
                      >
                        {sc.icon ? sc.icon : null}
                      </Flex>
                      <Typography.Text
                        style={{
                          margin: 0,
                          marginBottom: 0,
                          fontWeight: 500,
                          color: COLORS.textColorDark,
                          fontSize: FONT_SIZE.HEADING_3,
                        }}
                      >
                        {sc.title}
                      </Typography.Text>
                      {lvnzyProject!.score?.[sc.key] ? (
                        <GradientBar
                          value={getCategoryScore(lvnzyProject!.score[sc.key])}
                          showBadgeOnly={true}
                        ></GradientBar>
                      ) : null}
                    </Flex>

                    {sc.dataPoints &&
                    sc.dataPoints.filter(
                      (dp: any[]) => !["_id", "openAreaRating"].includes(dp[0])
                    ).length ? (
                      <List
                        size="large"
                        style={{ borderRadius: 16, cursor: "pointer" }}
                        dataSource={Object.keys(
                          (Brick360DataPoints as any)[sc.key]
                        )
                          .map((d) => {
                            return sc.dataPoints.find((dp: any) => dp[0] == d);
                          })
                          .filter((d) => !!d)}
                        renderItem={(item, index) => (
                          <List.Item
                            key={`p-${index}`}
                            ref={
                              index == 0 &&
                              sc.key == BRICK360_CATEGORY.areaConnectivity
                                ? ref
                                : null
                            }
                            style={{
                              padding: "6px 0",
                              borderBottom:
                                index ==
                                Object.keys((Brick360DataPoints as any)[sc.key])
                                  .map((d) => {
                                    return sc.dataPoints.find(
                                      (dp: any) => dp[0] == d
                                    );
                                  })
                                  .filter((d) => !!d).length -
                                  1
                                  ? "none"
                                  : "1px solid",
                              borderBottomColor: COLORS.borderColor,
                            }}
                            onClick={() => {
                              onDataPointClick(sc, item);
                              captureAnalyticsEvent("expand-datapoint", {
                                pillar: sc.key,
                                dataPoint: (item as any)[0],
                                projectName: lvnzyProject?.meta.projectName,
                                projectId: lvnzyProject._id
                              });
                            }}
                          >
                            <Flex align="center" style={{ width: "100%" }}>
                              <Flex
                                style={{ width: "60%" }}
                                align="center"
                                gap={4}
                              >
                                <Typography.Text
                                  style={{
                                    fontSize: FONT_SIZE.HEADING_4,
                                    color:
                                      (item as any)[1].rating > 0
                                        ? COLORS.textColorDark
                                        : COLORS.textColorLight,
                                  }}
                                >
                                  {capitalize(
                                    (Brick360DataPoints as any)[sc.key][
                                      (item as any)[0]
                                    ]["label"]
                                  )}{" "}
                                </Typography.Text>
                                <Flex
                                  style={{
                                    height: 18,
                                    width: 18,
                                    borderRadius: 2,
                                    backgroundColor: COLORS.bgColorMedium,
                                  }}
                                  align="center"
                                  justify="center"
                                >
                                  <Typography.Text
                                    style={{
                                      fontSize: FONT_SIZE.HEADING_4,
                                      color: COLORS.textColorMedium,
                                    }}
                                  >
                                    +
                                  </Typography.Text>
                                </Flex>
                              </Flex>
                              <Flex
                                style={{
                                  height: 24,
                                  marginLeft: "auto",
                                  width: "40%",
                                }}
                                justify="flex-end"
                              >
                                <RatingBar
                                  value={(item as any)[1].rating}
                                ></RatingBar>
                              </Flex>
                            </Flex>
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Flex style={{marginTop: 16}}>
                      <Alert
                        message="Due to the absence of a meaningful track record of RERA-registered projects, a rating cannot be provided for this developer. "
                        type="warning"
                      />
                      </Flex>
                    )}
                  </Flex>
                );
              })}
          </Flex>
        </Flex>

        <SnapshotModal
          isOpen={quickSnapshotDialogOpen}
          onClose={() => setQuickSnapshotDialogOpen(false)}
          pt={quickSnapshotDialogContent}
        />
      </ScrollableContainer>
    );
  }
);
