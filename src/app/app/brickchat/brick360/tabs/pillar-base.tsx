"use client";

import { Alert, Flex, Form, Tag, Typography, message } from "antd";
import { makeStreamingJsonRequest } from "http-streaming-request";
import { sha256 } from "js-sha256";
import { ReactNode, forwardRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import RatingBar from "@/components/common/rating-bar";
import { useUser } from "@/hooks/use-user";
import { axiosApiInstance } from "@/libs/axios-api-Instance";
import {
  baseApiUrl,
  Brick360CategoryInfo,
  Brick360DataPoints,
  DRIVER_CATEGORIES,
} from "@/libs/constants";
import { capitalize, captureAnalyticsEvent } from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { LvnzyProject } from "@/types/LvnzyProject";
import { ISurroundingElement } from "@/types/Project";
import ReferredLocationChips from "../../referred-location-chips";

// Shared logic behind every per-pillar tab (location-pillar.tsx,
// developer-pillar.tsx, property-pillar.tsx, financials-pillar.tsx) - split
// out of components/brick-360/brick360-pillar.tsx, which branched on
// categoryKey inline for each pillar's extras. Everything common lives here
// (data-point Collapse, inline Q&A, map-config reporting, no-report/no-data
// states); each pillar file only supplies what's specific to it via the
// header / getMapConfig / renderDataPointExtra / noDataPlaceholder props.

const REPORT_ACCESS_DENIED_MESSAGE =
  "You don't have access to this report. Please request for one or reachout to Brickfi.";

// What the primary/embedded map should show while a given data point's
// panel is expanded - handed to the parent (Brick360Inline -> brickchat-client)
// via onMapConfigChange, which forwards it into BrickMapChat's pillarMapConfig
// prop instead of a pillar rendering its own map (see brick-map-chat.tsx).
export interface PillarMapConfig {
  categories: string[];
  drivers: any[];
  surroundingElements?: ISurroundingElement[];
  projectsNearby?: any[];
}

// The project's neighborhood + connectivity drivers belonging to any of the
// given DRIVER_CATEGORIES, flattened into the shape the map expects - used by
// the pillars whose data points plot drivers (location, financials).
export const driversOfCategories = (
  lvnzyProject: LvnzyProject,
  categories: string[],
) => {
  const categoryDrivers = categories.flatMap(
    (category) =>
      DRIVER_CATEGORIES[category as keyof typeof DRIVER_CATEGORIES]?.drivers ||
      [],
  );
  return [
    ...(lvnzyProject.neighborhood?.drivers || []),
    ...(lvnzyProject.connectivity?.drivers || []),
  ]
    .filter(
      (d: any) =>
        !!d && !!d.driverId && categoryDrivers.includes(d.driverId.driver),
    )
    .map((d: any) => ({
      ...d.driverId,
      distance: d.distanceKms,
      duration: d.durationMins
        ? d.durationMins
        : Math.round(d.mapsDurationSeconds / 60),
    }));
};

// Lets a pillar's renderDataPointActions focus the map on one of its own
// items (keyed - e.g. a single nearby place) instead of a whole data point.
// Only one thing drives the map at a time: focusing an item clears any data
// point's "See on Map", and vice versa; focusing the focused key clears it.
export interface PillarMapFocus {
  focusedKey?: string;
  toggleFocus: (key: string, config: PillarMapConfig) => void;
}

// Props every pillar tab accepts (and forwards to the base).
export interface PillarProps {
  lvnzyProject?: LvnzyProject;
  userProjects?: { name: string; id: string }[];
  onMapConfigChange?: (config: PillarMapConfig | null) => void;
  /** Opens brick360-inline's media gallery modal, optionally on a tag. */
  onOpenGallery?: (tag?: string) => void;
}

interface PillarBaseProps extends PillarProps {
  /** BRICK360_CATEGORY key of the pillar being rendered. */
  categoryKey: string;
  /** Pillar-specific content shown above the data-point list. */
  header?: ReactNode;
  /** Map config for an expanded data point, or null to leave the map as-is. */
  getMapConfig?: (
    dataPointKey: string,
    lvnzyProject: LvnzyProject,
  ) => PillarMapConfig | null;
  /** Extra content inside an expanded data point, above its reasoning. */
  renderDataPointExtra?: (dataPointKey: string) => ReactNode;
  /** Content shown in the same row as a data point's "See on Map" button,
   * right below its title - mapFocus lets it put its own items on the map
   * (e.g. Location's nearest-place chips). */
  renderDataPointActions?: (
    dataPointKey: string,
    mapFocus: PillarMapFocus,
  ) => ReactNode;
  /** Overrides Brick360DataPoints[categoryKey].noDataPlaceholder. */
  noDataPlaceholder?: string;
}

export const PillarBase = forwardRef<any, PillarBaseProps>(
  (
    {
      lvnzyProject,
      categoryKey,
      userProjects,
      onMapConfigChange,
      header,
      getMapConfig,
      renderDataPointExtra,
      renderDataPointActions,
      noDataPlaceholder,
    },
    ref,
  ) => {
    const { user } = useUser();
    const [messageApi, contextHolder] = message.useMessage();

    // This pillar's title/data-points, derived synchronously from
    // lvnzyProject.score. Title/icon/score badge live in the tab label
    // itself (see tabItems in brick360-inline.tsx).
    const scorePillar = (() => {
      if (!lvnzyProject) return null;
      const catInfo = (Brick360CategoryInfo as any)[categoryKey];
      if (!catInfo || catInfo.disabled) return null;
      return {
        title: catInfo.title,
        key: categoryKey,
        dataPoints: ((lvnzyProject.score as any)?.[categoryKey]
          ? Object.entries((lvnzyProject.score as any)[categoryKey]).filter(
              (e: any) => e && e.length && e[1].rating,
            )
          : []) as any[],
      };
    })();

    // sub-pillar (data point) list, ordered per Brick360DataPoints
    const orderedDataPoints = scorePillar
      ? Object.keys((Brick360DataPoints as any)[scorePillar.key])
          .map((d) => scorePillar.dataPoints.find((dp: any) => dp[0] === d))
          .filter((d: any) => !!d && !["_id", "openAreaRating"].includes(d[0]))
      : [];

    // Sources shown once at the end of the pillar - the pillar's own sources
    // plus any data point's (Brick360DataPoints[pillar][dataPoint].sources,
    // if defined), deduped by label - instead of repeating the same list
    // inside every expanded data point.
    const pillarSources = (() => {
      const all = [
        ...((Brick360CategoryInfo as any)[categoryKey]?.sources || []),
        ...orderedDataPoints.flatMap(
          (dp: any) =>
            (Brick360DataPoints as any)[categoryKey]?.[dp[0]]?.sources || [],
        ),
      ];
      const seen = new Set<string>();
      return all.filter((s: any) => {
        if (!s?.label || seen.has(s.label)) return false;
        seen.add(s.label);
        return true;
      });
    })();

    // --- data-point selection + Q&A, driven by which Collapse panel is open
    // - starts with nothing expanded until the user picks one ---
    // every data point always renders open. selectedKey is the one ACTIVE
    // data point - the one whose "See on Map" was clicked - which drives the
    // map (getMapConfig) and the Q&A thread.
    const [selectedKey, setSelectedKey] = useState<string | undefined>();
    // a pillar item focused via PillarMapFocus (see renderDataPointActions)
    const [customFocus, setCustomFocus] = useState<
      { key: string; config: PillarMapConfig } | undefined
    >();

    const [followUpPrompts, setFollowupPrompts] = useState<string[]>([]);
    const [note, setNote] = useState<string>();

    const [currentSessionId, setCurrentSessionId] = useState<string>(() =>
      uuidv4(),
    );
    const [queryStreaming, setQueryStreaming] = useState(false);
    const [queryStreamingText, setQueryStreamingText] = useState<string>();
    const [isFirstQuestion, setIsFirstQuestion] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState<string>();
    const [currentAnswer, setCurrentAnswer] = useState<
      { answer: string } | undefined
    >();
    const [currentChat, setCurrentChat] = useState<
      Array<{ question: string; answer: any }>
    >([]);

    useEffect(() => {
      if (user && lvnzyProject) {
        setCurrentSessionId(sha256(`${user._id}:${lvnzyProject._id}`));
      }
    }, [user, lvnzyProject]);

    const dataPointSelected = (() => {
      if (!selectedKey || !scorePillar) return undefined;
      const [, dataPointKey] = selectedKey.split("::");
      const item = scorePillar.dataPoints?.find(
        (dp: any) => dp[0] === dataPointKey,
      );
      if (!item) return undefined;
      return {
        selectedDataPointCategory: categoryKey,
        selectedDataPointSubCategory: dataPointKey,
        selectedDataPoint: item[1],
        selectedDataPointTitle: `${scorePillar.title} > ${
          (Brick360DataPoints as any)[categoryKey][dataPointKey]["label"]
        }`,
      };
    })();

    // sources/note/follow-ups + map config for the selected data point - the
    // map config itself comes from the pillar (getMapConfig) and is reported
    // upward rather than rendered here.
    useEffect(() => {
      setFollowupPrompts([]);
      onMapConfigChange?.(null);
      // a focused pillar item takes the map instead of any data point
      if (customFocus) {
        onMapConfigChange?.(customFocus.config);
        return;
      }
      if (
        !dataPointSelected ||
        !lvnzyProject ||
        !dataPointSelected.selectedDataPointCategory ||
        !dataPointSelected.selectedDataPointSubCategory
      ) {
        setNote(undefined);
        return;
      }

      const {
        selectedDataPointCategory: cat,
        selectedDataPointSubCategory: sub,
      } = dataPointSelected;

      const prompts = (Brick360DataPoints as any)[cat][sub]["prompts"];
      const noteForDataPt =
        (Brick360CategoryInfo as any)[cat].note ||
        (Brick360DataPoints as any)[cat][sub]["note"];
      setNote(noteForDataPt);
      setFollowupPrompts(prompts || []);

      const mapConfig = getMapConfig?.(sub, lvnzyProject);
      if (mapConfig) onMapConfigChange?.(mapConfig);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedKey, customFocus, lvnzyProject]);

    const initiateQueryStreamingText = () => {
      setQueryStreamingText(
        "<span class='progress-text'>Checking on this. Hold on !</span>",
      );
      setTimeout(() => {
        setQueryStreamingText(
          "<span class='progress-text'>Found relevant info...</span>",
        );
        setTimeout(() => {
          setQueryStreamingText(
            "<span class='progress-text'>Preparing the answer...</span>",
          );
          setTimeout(() => {
            setQueryStreamingText(
              "<span class='progress-text'>Taking a bit longer...</span>",
            );
          }, 5000);
        }, 3000);
      }, 2000);
    };

    const handleRequest = async (question: string) => {
      try {
        if (!question || question.length < 3) return;

        captureAnalyticsEvent("question-asked", {
          question,
          pillar: dataPointSelected?.selectedDataPointCategory || "",
          dataPoint: dataPointSelected?.selectedDataPointSubCategory || "",
          projectName: lvnzyProject?.meta.projectName || "",
          projectId: lvnzyProject?._id,
        });

        setQueryStreaming(true);

        if (currentQuestion) {
          setCurrentChat((prev) => [
            ...prev,
            { question: currentQuestion, answer: currentAnswer || {} },
          ]);
        }
        setCurrentQuestion(question);
        setCurrentAnswer({ answer: "" });
        initiateQueryStreamingText();

        if (isFirstQuestion && user?._id) {
          try {
            await axiosApiInstance.put(`/user/${user._id}/chat-session`, {
              userId: user._id,
              sessionId: currentSessionId,
              startingQuestion: question,
            });
            setIsFirstQuestion(false);
          } catch (error) {
            console.log("Error saving chat session:", error);
          }
        }

        const stream = makeStreamingJsonRequest({
          url: `${baseApiUrl}ai/ask-stream-brick360`,
          method: "POST",
          payload: {
            question,
            sessionId: currentSessionId,
            userId: user?._id,
            userProjects,
            lvnzyProjectId: lvnzyProject?._id,
            dataPointCategory: dataPointSelected
              ? dataPointSelected.selectedDataPointCategory
              : "",
          },
        });

        for await (const data of stream) {
          setCurrentAnswer(data as any);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        const status = (error as any)?.response?.status;
        messageApi.open({
          type: status === 403 ? "warning" : "error",
          content:
            status === 403
              ? REPORT_ACCESS_DENIED_MESSAGE
              : "Oops. Can you please try again?",
        });
      } finally {
        setQueryStreaming(false);
      }
    };

    // only referenced by the (currently commented-out) inline ask input
    const [askForm] = Form.useForm();

    const renderQABlock = (q: string, a: string, isCurrent: boolean) => (
      <Flex vertical>
        <Flex>
          <Typography.Text
            style={{
              backgroundColor: COLORS.textColorDark,
              color: "white",
              borderRadius: 8,
              padding: "4px 8px",
              marginBottom: 8,
            }}
          >
            {q}
          </Typography.Text>
        </Flex>
        <Flex style={{ maxWidth: 850, marginTop: 8 }} gap={4} vertical>
          {isCurrent && queryStreaming ? (
            <Flex align="center">
              <img
                src="/images/liv-streaming.gif"
                style={{ height: 26, width: 26 }}
              />
              <div
                dangerouslySetInnerHTML={{
                  __html: (queryStreamingText || "").replace(/\n/g, "<br>"),
                }}
                className="reasoning"
                style={{ fontSize: FONT_SIZE.HEADING_3, margin: 0 }}
              ></div>
            </Flex>
          ) : null}
          <div
            dangerouslySetInnerHTML={{ __html: a }}
            className="reasoning"
            style={{ fontSize: FONT_SIZE.HEADING_3, margin: 0 }}
          ></div>
        </Flex>
      </Flex>
    );

    // Selecting a different data point starts a fresh Q&A thread rather than
    // carrying the previous one along under a visually different panel.
    const handleSelectKey = (key: string | undefined) => {
      setSelectedKey(key);
      setCurrentChat([]);
      setCurrentQuestion(undefined);
      setCurrentAnswer(undefined);
    };

    // "See on Map": make this data point the active one (its getMapConfig
    // goes to the map); clicking it again on the active one clears it.
    const handleSeeOnMap = (key: string) => {
      setCustomFocus(undefined);
      if (selectedKey === key) {
        handleSelectKey(undefined);
        return;
      }
      handleSelectKey(key);
      captureAnalyticsEvent("datapoint-map-view", {
        pillar: categoryKey,
        dataPoint: key.split("::")[1],
        projectName: lvnzyProject?.meta.projectName,
        projectId: lvnzyProject?._id,
      });
    };

    const mapFocus: PillarMapFocus = {
      focusedKey: customFocus?.key,
      toggleFocus: (key, config) => {
        if (customFocus?.key === key) {
          setCustomFocus(undefined);
          return;
        }
        handleSelectKey(undefined);
        setCustomFocus({ key, config });
      },
    };

    const renderDataPointDetail = (dataPointKey: string, dataPoint: any) => {
      const isSelected =
        selectedKey === `${categoryKey}::${dataPointKey}` &&
        !!dataPointSelected;

      return (
        <Flex vertical style={{ paddingTop: 8 }}>
          {/* <Flex style={{ width: "100", display: "inline", margin: "8px 0" }}>
            <Typography.Text
              style={{
                color: COLORS.textColorMedium,
                fontSize: FONT_SIZE.PARA,
                width: "100",
                textWrap: "initial",
              }}
            >
              Brickfi always uses legit data sources for analysis. {note}
            </Typography.Text>
          </Flex> */}

          {renderDataPointExtra?.(dataPointKey)}

          <Flex vertical gap={16} style={{ marginBottom: 24, marginTop: 8 }}>
            {(dataPoint?.reasoning || []).map(
              (r: string, i: number) => (
                <Flex key={i} style={{ maxWidth: 850 }}>
                  <div
                    dangerouslySetInnerHTML={{ __html: r }}
                    className="reasoning"
                    style={{ fontSize: FONT_SIZE.HEADING_3, margin: 0 }}
                  ></div>
                </Flex>
              ),
            )}
          </Flex>

          {/* {followUpPrompts && followUpPrompts.length && !currentQuestion ? (
            <Flex gap={4} style={{ width: "100%", flexWrap: "wrap", marginBottom: 16 }}>
              <Divider
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  color: COLORS.textColorLight,
                  margin: 0,
                  marginBottom: 8,
                }}
                orientation="left"
              >
                Ask next
              </Divider>
              {followUpPrompts.map((p: string) => (
                <Tag
                  key={p}
                  style={{
                    backgroundColor: COLORS.bgColorBlue,
                    fontSize: FONT_SIZE.HEADING_4,
                    padding: "4px",
                    borderRadius: 8,
                    marginBottom: 4,
                    fontWeight: 600,
                    borderColor: COLORS.borderColor,
                    cursor: "pointer",
                  }}
                  onClick={() => handleRequest(p)}
                >
                  {p}
                </Tag>
              ))}
            </Flex>
          ) : null} */}

          {isSelected && (currentChat.length || currentQuestion) && (
            <Flex vertical gap={40} style={{ marginBottom: 16 }}>
              {currentChat.map((thread, i) => (
                <div key={i}>
                  {renderQABlock(thread.question, thread.answer.answer, false)}
                </div>
              ))}
              {currentQuestion &&
                renderQABlock(
                  currentQuestion,
                  currentAnswer?.answer || "",
                  true,
                )}
            </Flex>
          )}

          {/* Inline (non-fixed) ask input, scoped to this panel - part of
              normal document flow, so it doesn't clash with brickchat-client's
              own search bar.
          <Form
            form={askForm}
            onFinish={(value) => {
              askForm.resetFields();
              handleRequest(value.question);
            }}
          >
            <Form.Item name="question" style={{ marginBottom: 0 }}>
              <Input
                disabled={queryStreaming}
                placeholder="Have a question about this? Ask away!"
                style={{
                  height: 44,
                  backgroundColor: "white",
                  border: "1px solid",
                  borderColor: COLORS.borderColorMedium,
                  borderRadius: 16,
                  fontSize: FONT_SIZE.PARA,
                }}
                prefix={
                  <Flex style={{ marginRight: 8 }}>
                    <DynamicReactIcon
                      iconName="GiOilySpiral"
                      iconSet="gi"
                      size={18}
                    ></DynamicReactIcon>
                  </Flex>
                }
                suffix={
                  <Button
                    htmlType="submit"
                    type="link"
                    disabled={queryStreaming}
                    style={{
                      opacity: !queryStreaming ? 1 : 0.3,
                      padding: 0,
                    }}
                  >
                    <DynamicReactIcon iconName="BiSolidSend" iconSet="bi" size={18} />
                  </Button>
                }
              />
            </Form.Item>
          </Form>
           */}
        </Flex>
      );
    };

    if (
      !lvnzyProject ||
      !lvnzyProject.score ||
      Object.keys(lvnzyProject.score).length < 3
    ) {
      return (
        <Flex
          vertical
          align="center"
          justify="center"
          gap={12}
          style={{
            padding: "32px 16px",
            marginBottom: 16,
            borderRadius: 12,
            backgroundColor: "#f8f8f8",
            border: "1px dashed #d9d9d9",
          }}
        >
          <Typography.Text
            style={{ marginBottom: 16, color: "#8c8c8c", textAlign: "left" }}
          >
            The Brick 360 report for this project has not been generated yet.
            Request the admin.
          </Typography.Text>
        </Flex>
      );
    }

    if (!scorePillar) return null;
    const sc = scorePillar;

    return (
      <Flex vertical>
        {contextHolder}
        <Flex vertical>
          <Flex vertical key={sc.key}>
            {header}

            {orderedDataPoints.length ? (
              <Flex vertical style={{ marginTop: 16 }}>
                <Flex vertical gap={16}>
                  {orderedDataPoints.map((item: any, index: number) => {
                    const key = `${sc.key}::${item[0]}`;
                    const isActive = selectedKey === key;
                    // only offered when this data point has something to plot
                    const hasMap =
                      !!lvnzyProject && !!getMapConfig?.(item[0], lvnzyProject);
                    return (
                      <Flex
                        vertical
                        key={key}
                        style={{
                          paddingLeft: 8,
                        }}
                      >
                        <div ref={index === 0 ? ref : null}>
                          <Flex align="center" gap={8} style={{ minWidth: 0 }}>
                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.HEADING_2,
                                color:
                                  item[1].rating > 0
                                    ? COLORS.textColorDark
                                    : COLORS.textColorLight,
                                    fontWeight: 500
                              }}
                            >
                              {capitalize(
                                (Brick360DataPoints as any)[sc.key][item[0]][
                                  "label"
                                ],
                              )}
                            </Typography.Text>
                            <RatingBar value={item[1].rating}></RatingBar>
                          </Flex>
                        </div>
                        {(() => {
                          const actions = renderDataPointActions?.(
                            item[0],
                            mapFocus,
                          );
                          if (!hasMap && !actions) return null;
                          return (
                            <Flex
                              align="center"
                              gap={8}
                              style={{
                                marginTop: 6,
                                overflowX: "auto",
                                flexWrap: "nowrap",
                                paddingBottom: 2,
                                scrollbarWidth: "none",
                              }}
                            >
                              {hasMap ? (
                                <ReferredLocationChips
                                  items={[
                                    {
                                      key,
                                      id: key,
                                      type: "",
                                      name: isActive
                                        ? "Showing on Map"
                                        : "See on Map",
                                      keepLabelCase: true,
                                    },
                                  ]}
                                  selectedKey={isActive ? key : null}
                                  onToggle={() => handleSeeOnMap(key)}
                                />
                              ) : null}
                              {actions}
                            </Flex>
                          );
                        })()}
                        {renderDataPointDetail(item[0], item[1])}
                      </Flex>
                    );
                  })}
                </Flex>
              </Flex>
            ) : (
              <Flex style={{ marginTop: 16 }}>
                <Alert
                  showIcon
                  message={
                    noDataPlaceholder ??
                    (Brick360DataPoints as any)[sc.key]?.noDataPlaceholder
                  }
                  type="warning"
                />
              </Flex>
            )}
            {pillarSources.length ? (
              <Flex wrap gap={4} align="center" style={{ marginTop: 16 }}>
                <Flex style={{ marginRight: 4 }}>
                  <DynamicReactIcon
                    color={COLORS.textColorMedium}
                    size={22}
                    iconName="MdVerifiedUser"
                    iconSet="md"
                  ></DynamicReactIcon>
                </Flex>
                {pillarSources.map((s: any) => (
                  <Tag
                    key={s.label}
                    onClick={() => {
                      if (s.url) window.open(s.url, "_blank");
                    }}
                    style={{
                      cursor: s.url ? "pointer" : "default",
                      fontWeight: 500,
                      border: `0px`,
                      borderRadius: 8,
                      color: COLORS.textColorDark,
                      fontSize: FONT_SIZE.HEADING_4,
                      backgroundColor: COLORS.bgColorMedium,
                    }}
                  >
                    {s.label}
                  </Tag>
                ))}
              </Flex>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    );
  },
);
PillarBase.displayName = "PillarBase";
