import { Alert, Flex, List, Typography } from "antd";
import { BRICK360_CATEGORY, Brick360DataPoints } from "../../libs/constants";
import { capitalize, getCategoryScore } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import GradientBar from "../common/grading-bar";
import RatingBar from "../common/rating-bar";
import { ScrollableContainer } from "../scrollable-container";
import { SnapshotModal } from "./snapshot-modal";
import { forwardRef, ReactNode, useState } from "react";
import DynamicReactIcon from "../common/dynamic-react-icon";
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

      function reasoningStmt(truncate: boolean) {
        return (
          <Flex vertical>
            <Flex align="center" gap={4}>
              <DynamicReactIcon
                size={isPro ? 20 : 24}
                iconName={isPro ? "FaRegLaugh" : "PiSmileySadBold"}
                iconSet={isPro ? "fa" : "pi"}
                color={isPro ? COLORS.primaryColor : COLORS.redIdentifier}
              ></DynamicReactIcon>
              <Typography.Text
                style={{ fontWeight: 500, fontSize: FONT_SIZE.HEADING_2 }}
              >
                {title}
              </Typography.Text>
            </Flex>
            <div
              dangerouslySetInnerHTML={{
                __html: `${pt.replace(`<b>${title}</b><br>`, "")} ${
                  truncate ? '<span class="read-more">Read more</span>' : ""
                }`,
              }}
              className={`reasoning ${truncate ? "truncated" : ""} ${
                isPro ? "" : "con"
              }`}
              style={{
                fontSize: truncate ? FONT_SIZE.HEADING_4 : FONT_SIZE.HEADING_3,
                margin: 0,
                marginTop: truncate ? 0 : 16,
                width: truncate ? 275 : "100%",
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
            setQuickSnapshotDialogContent(reasoningStmt(false));
          }}
          gap={4}
          vertical
        >
          {reasoningStmt(true)}
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
                            onClick={() => onDataPointClick(sc, item)}
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
                      <Alert
                        message="There are no other projects by the developer in the state of Karnataka yet. Please make sure to check track record in other states.   "
                        type="warning"
                      />
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
