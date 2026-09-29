"use client";

import {
  Alert,
  Button,
  Collapse,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Tag,
  Typography,
  message,
} from "antd";
import dynamic from "next/dynamic";
import { makeStreamingJsonRequest } from "http-streaming-request";
import { sha256 } from "js-sha256";
import moment from "moment";
import { ReactNode, forwardRef, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useDevice } from "../../hooks/use-device";
import { useUser } from "../../hooks/use-user";
import { axiosApiInstance } from "../../libs/axios-api-Instance";
import {
  baseApiUrl,
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  Brick360DataPoints,
  DRIVER_CATEGORIES,
  LivIndexDriversConfig,
} from "../../libs/constants";
import {
  capitalize,
  captureAnalyticsEvent,
  driverStatusLabel,
  thsndFormat,
} from "../../libs/lvnzy-helper";
import { parseProConHtml } from "../../libs/html-utils";
import { fetchTravelDurationElement } from "../map-view-v2/map-utils";
import { MapModalBody, MapModalContent } from "../map-view-v2/map-modal";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LvnzyProject } from "../../types/LvnzyProject";
import { ISurroundingElement } from "../../types/Project";
import DynamicReactIcon from "../common/dynamic-react-icon";
import RatingBar from "../common/rating-bar";
import { SnapshotModal } from "./snapshot-modal";

const ColumnChart = dynamic(
  () => import("@ant-design/plots").then((m) => m.Column),
  { ssr: false },
);

// --- price quartile chart (duplicated from brick360-chat.tsx, which doesn't
// export it, rather than modifying that file - see file header note) ---
function getPercentile(sorted: number[], pct: number): number {
  const idx = (pct / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function PriceQuartileChart({
  pricingData,
}: {
  pricingData: { projectName: string; sqftCost: number }[];
}) {
  if (pricingData.length < 2) return null;

  const costs = pricingData.map((p) => p.sqftCost).sort((a, b) => a - b);
  const q1 = getPercentile(costs, 25);
  const q3 = getPercentile(costs, 75);

  const fmtSqft = (v: number) => `${parseFloat((v / 1000).toFixed(1))}k`;

  const STEP = 1000;
  const bucketMap = new Map<number, { count: number; projects: string[] }>();
  pricingData.forEach((p) => {
    const bucket = Math.round(p.sqftCost / STEP) * STEP;
    const existing = bucketMap.get(bucket) || { count: 0, projects: [] };
    bucketMap.set(bucket, {
      count: existing.count + 1,
      projects: [
        ...existing.projects,
        `${p.projectName} (${fmtSqft(p.sqftCost)})`,
      ],
    });
  });

  const data = Array.from(bucketMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucket, { count, projects }]) => ({
      label: `₹${bucket / 1000}k`,
      count,
      projects,
      inRange: bucket <= q3 && bucket + STEP > q1,
    }));

  const config = {
    data,
    xField: "label",
    yField: "count",
    height: 160,
    autoFit: true,
    label: false as const,
    axis: {
      x: { label: { autoRotate: true, fontSize: 9 } },
      y: { labelFormatter: () => "", tickCount: 4 },
    },
    tooltip: {
      items: [
        (datum: any) => ({
          name: "Projects",
          value: datum.count,
          marker: false,
          projects: datum.projects,
          count: datum.count,
        }),
      ],
    },
    interaction: {
      tooltip: {
        render: (_event: any, { items, title }: any) => {
          const item = items?.[0];
          if (!item) return "";
          const names: string[] = item.projects || [];
          const tagStyle =
            "display:inline-block;padding:0 7px;font-size:11px;line-height:20px;" +
            "border:1px solid #d9d9d9;border-radius:4px;background:rgba(0,0,0,0.02);margin:2px 2px 0 0";
          const tagsHtml = names
            .slice(0, 5)
            .map((n) => `<span style="${tagStyle}">${n}</span>`)
            .join("");
          const moreHtml =
            names.length > 5
              ? `<span style="${tagStyle}">+${names.length - 5} more</span>`
              : "";
          return `<div style="padding:8px 12px;min-width:160px">
          <div style="margin-bottom:6px;font-weight:500; font-size: 24px;">${title}</div>
            <div style="margin-bottom:6px;font-weight:500;color:#999;"> ${item.count} project${item.count !== 1 ? "s" : ""}</div>
            <div style="display:flex;flex-wrap:wrap">${tagsHtml}${moreHtml}</div>
          </div>`;
        },
      },
    },
    style: {
      fill: (d: { inRange: boolean }) => (d.inRange ? "#1677ff" : "#bfbfbf"),
      radius: 4,
    },
  };

  return (
    <Flex
      vertical
      style={{
        maxWidth: 700,
        backgroundColor: COLORS.LANDING.MEDIUM_PINK,
        padding: "8px 8px 0 8px",
        borderRadius: "0 8px",
      }}
    >
      <Typography.Text
        style={{
          fontSize: 11,
          color: "#8c8c8c",
          marginBottom: 4,
        }}
      >
        Price Point Distribution
      </Typography.Text>
      <ColumnChart {...(config as any)} />
    </Flex>
  );
}

const REPORT_ACCESS_DENIED_MESSAGE =
  "You don't have access to this report. Please request for one or reachout to Brickfi.";

// --- property summary line (land area/units/size/floors/phases) - moved
// here from units-tab.tsx so it shows under the Property pillar instead of
// Floorplans (see the sc.key === BRICK360_CATEGORY.property block below) ---
const getTotalFloors = (lvnzyProject: any) => {
  const towers = lvnzyProject?.meta?.projectConfigurations?.towers;
  if (!towers || !Array.isArray(towers) || towers.length === 0) {
    return "";
  }

  const floorCounts = towers
    .map((t: any) => t.totalFloors)
    .filter((floors: any) => typeof floors === "number");
  if (floorCounts.length === 0) {
    return null;
  }

  const minFloors = Math.min(...floorCounts);
  const maxFloors = Math.max(...floorCounts);

  if (minFloors && maxFloors) {
    const totalFloors =
      minFloors == maxFloors ? `${minFloors}` : `${minFloors}-${maxFloors}`;
    return (
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_4,
          fontWeight: 500,
          color: COLORS.textColorMedium,
        }}
      >
        {totalFloors}
      </Typography.Text>
    );
  }

  return null;
};

const getMinMaxSize = (configs: any[]) => {
  let sizes: number[] = [];
  configs.forEach((c: any) => {
    if (c.sizeBuiltup) {
      sizes.push(c.sizeBuiltup);
    } else if (c.config) {
      const split = c.config.split("-");
      if (split.length > 1) {
        sizes.push(parseInt(split[1]));
      }
    }
  });
  if (sizes.length) {
    sizes = sizes.sort((a, b) => a - b);
    return (
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_4,
          fontWeight: 500,
          color: COLORS.textColorMedium,
        }}
      >
        {sizes[0] == sizes[sizes.length - 1]
          ? sizes[0]
          : `${sizes[0]} - ${sizes[sizes.length - 1]}`}{" "}
        sq.ft
      </Typography.Text>
    );
  }
  return null;
};

// What the primary/embedded map should show while a given data point's
// panel is expanded - handed to the parent (Brick360Inline -> brickchat-client)
// via onMapConfigChange, which forwards it into BrickMapChat's pillarMapConfig
// prop instead of this component rendering its own map (see brick-map-chat.tsx).
export interface PillarMapConfig {
  categories: string[];
  drivers: any[];
  surroundingElements?: ISurroundingElement[];
  projectsNearby?: any[];
}

interface Brick360PillarProps {
  lvnzyProject?: LvnzyProject;
  /** Which single pillar (BRICK360_CATEGORY key) to render - see brick360-inline.tsx,
   * where each pillar is now its own top-level tab instead of one shared "Brick 360" tab. */
  categoryKey: string;
  userProjects?: { name: string; id: string }[];
  onMapConfigChange?: (config: PillarMapConfig | null) => void;
}

// Combined replacement for Brick360Tab + Brick360Chat when embedded inside
// brickchat-client (see brick360-inline.tsx) - same pillar/data-point info for
// a single pillar (categoryKey), two differences from the originals (kept
// untouched for the standalone brick360-v2/v3 pages):
// - a data point's detail (reasoning, sources, follow-ups, Q&A) expands
//   inline via antd Collapse instead of a bottom Drawer.
// - no internal map (MapViewV2) - the relevant driver/surrounding info for
//   the expanded data point is reported upward via onMapConfigChange so the
//   single primary map already mounted in brickchat-client can display it.
export const Brick360Pillar = forwardRef<any, Brick360PillarProps>(
  ({ lvnzyProject, categoryKey, userProjects, onMapConfigChange }, ref) => {
    const { user } = useUser();
    const [messageApi, contextHolder] = message.useMessage();

    // This pillar's title/data-points, derived synchronously from
    // lvnzyProject.score - was a loop over every BRICK360_CATEGORY when this
    // component covered all pillars at once; now scoped to just categoryKey.
    // title/icon/score badge for this pillar now live in the tab label
    // itself (see tabItems in brick360-inline.tsx) rather than a heading
    // repeated inside every pillar's content.
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

    // sub-pillar (data point) list, ordered per Brick360DataPoints - computed
    // here (rather than just before the JSX return) so it can seed
    // selectedKey's default below.
    const orderedDataPoints = scorePillar
      ? Object.keys((Brick360DataPoints as any)[scorePillar.key])
          .map((d) => scorePillar.dataPoints.find((dp: any) => dp[0] === d))
          .filter((d: any) => !!d && !["_id", "openAreaRating"].includes(d[0]))
      : [];

    // Closest amenities strip shown at the top of the Location pillar - the
    // single nearest driver (10 min commute or less) per driver type below,
    // sorted by duration ascending.
    const CLOSEST_DRIVER_TYPES = [
      "industrial-hitech",
      "industrial-general",
      "highway",
      "transit",
      "commercial",
      "school",
    ];
    const closestDrivers =
      categoryKey === BRICK360_CATEGORY.areaConnectivity && lvnzyProject
        ? (() => {
            const sorted = [
              ...(lvnzyProject.neighborhood?.drivers || []),
              ...(lvnzyProject.connectivity?.drivers || []),
            ]
              .filter(
                (d: any) =>
                  !!d?.driverId &&
                  CLOSEST_DRIVER_TYPES.includes(d.driverId.driver),
              )
              .map((d: any) => ({
                ...d.driverId,
                distance: d.distanceKms,
                duration: d.durationMins
                  ? d.durationMins
                  : Math.round(d.mapsDurationSeconds / 60),
              }))
              .filter(
                (d: any) => typeof d.duration === "number" && d.duration <= 10,
              )
              .sort((a: any, b: any) => a.duration - b.duration);

            const seenTypes = new Set<string>();
            return sorted.filter((d: any) => {
              if (seenTypes.has(d.driver)) return false;
              seenTypes.add(d.driver);
              return true;
            });
          })()
        : [];

    function getNoDataPlaceholder(categoryKey: string) {
      if (categoryKey === BRICK360_CATEGORY.property) {
        const expectedLaunchDate = (lvnzyProject as any)?.originalProjectId
          ?.info?.realTimeStatus?.expectedLaunchDate;
        const isLaunchInFuture =
          !!expectedLaunchDate &&
          moment(expectedLaunchDate).isValid() &&
          moment(expectedLaunchDate).isAfter(moment());
        return isLaunchInFuture
          ? Brick360DataPoints.property.futureProjectNoDataPlaceholder
          : Brick360DataPoints.property.oldProjectNoDataPlaceholder;
      }
      return (Brick360DataPoints as any)[categoryKey]?.noDataPlaceholder;
    }

    // Info modal for a closest-driver card (Location tab) - mirrors the
    // content shown by a driver marker click on the map (see
    // map-drivers/simple-drivers.tsx) via the same MapModalBody, just in a
    // centered Modal instead of a map-anchored popover since there's no map
    // surface here to anchor a click position against.
    const [driverModalContent, setDriverModalContent] =
      useState<MapModalContent>();

    const openDriverModal = (driver: any) => {
      const isDashed = ![
        "launched",
        "post-launch",
        "partial-launch",
      ].includes(driver.status);
      setDriverModalContent({
        title: driver.name,
        subHeading:
          typeof driver.distance === "number" && typeof driver.duration === "number"
            ? fetchTravelDurationElement(driver.distance, driver.duration)
            : undefined,
        content: driver.details?.oneLiner || driver.details?.description || "",
        tags: [
          {
            label: (LivIndexDriversConfig as any)[driver.driver]?.label || capitalize(driver.driver),
            color: COLORS.primaryColor,
          },
          ...(driver.status
            ? [
                {
                  label: driverStatusLabel(driver.status),
                  color: isDashed ? COLORS.yellowIdentifier : COLORS.greenIdentifier,
                },
              ]
            : []),
          ...(driver.tags || []).map((t: string) => ({
            label: capitalize(t),
            color: COLORS.textColorDark,
          })),
        ],
      });
      captureAnalyticsEvent("driver-info-view", {
        driverName: driver.name,
        driverType: driver.driver,
        projectName: lvnzyProject?.meta.projectName,
        projectId: lvnzyProject?._id,
      });
    };

    // --- data-point selection + Q&A (was Brick360Chat, now driven by which
    // Collapse panel is open instead of a `dataPoint` prop) ---
    // starts with nothing expanded - all sub-pillars stay collapsed until
    // the user picks one.
    const [selectedKey, setSelectedKey] = useState<string | undefined>();

    const [followUpPrompts, setFollowupPrompts] = useState<string[]>([]);
    const [note, setNote] = useState<string>();
    const [sources, setSources] = useState<any[]>([]);

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

    // Setting map config + sources/note/follow-ups based on the selected data
    // point - mirrors Brick360Chat's updateMapState effect, but reports the
    // config upward instead of rendering a map here.
    useEffect(() => {
      setFollowupPrompts([]);
      onMapConfigChange?.(null);
      if (
        !dataPointSelected ||
        !lvnzyProject ||
        !dataPointSelected.selectedDataPointCategory ||
        !dataPointSelected.selectedDataPointSubCategory
      ) {
        setNote(undefined);
        setSources([]);
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
      setSources((Brick360CategoryInfo as any)[cat].sources || []);
      setFollowupPrompts(prompts || []);

      const driversOfCategories = (categories: string[]) => {
        const categoryDrivers = categories.flatMap(
          (category) =>
            DRIVER_CATEGORIES[category as keyof typeof DRIVER_CATEGORIES]
              ?.drivers || [],
        );
        return [
          ...(lvnzyProject.neighborhood?.drivers || []).filter(
            (d: any) =>
              !!d &&
              !!d.driverId &&
              categoryDrivers.includes(d.driverId.driver),
          ),
          ...(lvnzyProject.connectivity?.drivers || []).filter(
            (d: any) =>
              !!d &&
              !!d.driverId &&
              categoryDrivers.includes(d.driverId.driver),
          ),
        ].map((d: any) => ({
          ...d.driverId,
          distance: d.distanceKms,
          duration: d.durationMins
            ? d.durationMins
            : Math.round(d.mapsDurationSeconds / 60),
        }));
      };

      if (cat === "areaConnectivity") {
        let categories: string[] = [];
        switch (sub) {
          case "schoolsOffices":
            categories = ["workplace", "schools"];
            break;
          case "conveniences":
            categories = ["dining", "hospital", "commercial"];
            break;
          case "transport":
            categories = ["roads", "metro"];
            break;
        }
        onMapConfigChange?.({
          categories,
          drivers: driversOfCategories(categories),
        });
      } else if (cat === "financials" && sub === "growthPotential") {
        const categories = ["growth potential"];
        onMapConfigChange?.({
          categories,
          drivers: driversOfCategories(categories),
        });
      } else if (cat === "financials" && sub === "pricePoint") {
        onMapConfigChange?.({
          categories: [],
          drivers: [],
          projectsNearby: (
            lvnzyProject.investment?.corridorPricing || []
          ).filter((p: any) => !!p.sqftCost),
        });
      } else if (cat === "property" && sub === "surroundings") {
        const surrElements = (lvnzyProject as any).property?.surroundings;
        if (
          surrElements?.length &&
          surrElements.some((e: any) => !!e.geometry)
        ) {
          onMapConfigChange?.({
            categories: [],
            drivers: [],
            surroundingElements: surrElements,
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedKey, lvnzyProject]);

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

    const renderDataPointDetail = (
      categoryKey: string,
      dataPointKey: string,
    ) => {
      const isSelected =
        selectedKey === `${categoryKey}::${dataPointKey}` &&
        !!dataPointSelected;
      if (!isSelected || !dataPointSelected) return null;

      return (
        <Flex vertical style={{ paddingTop: 8 }}>
          <Flex
            vertical
            style={{
              margin: "0 0 8px 0",
              borderRadius: 8,
              maxWidth: 800,
            }}
          >
            {sources && sources.length ? (
              <Flex style={{ marginTop: 8 }} wrap gap={4}>
                <Flex style={{ marginRight: 4 }}>
                  <DynamicReactIcon
                    color={COLORS.textColorDark}
                    size={22}
                    iconName="MdVerifiedUser"
                    iconSet="md"
                  ></DynamicReactIcon>
                </Flex>
                {sources.map((s: any) => (
                  <Tag
                    key={s.label}
                    onClick={() => {
                      if (s.url) window.open(s.url, "_blank");
                    }}
                    style={{
                      cursor: "pointer",
                      fontWeight: 500,
                      border: `0px`,
                      borderRadius: 8,
                      color: "white",
                      fontSize: FONT_SIZE.PARA,
                      backgroundColor: COLORS.textColorDark,
                    }}
                  >
                    {s.label}
                  </Tag>
                ))}
              </Flex>
            ) : null}

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
          </Flex>

          {dataPointSelected.selectedDataPointSubCategory === "pricePoint" && (
            <PriceQuartileChart
              pricingData={(
                lvnzyProject?.investment?.corridorPricing || []
              ).filter((p: any) => !!p.sqftCost)}
            />
          )}

          <Flex vertical gap={16} style={{ marginBottom: 24, marginTop: 8 }}>
            {(dataPointSelected.selectedDataPoint?.reasoning || []).map(
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

          {(currentChat.length || currentQuestion) && (
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

          {/* Inline (non-fixed) ask input, scoped to this panel - unlike
              Brick360Chat's floating bottom input, this doesn't clash with
              brickchat-client's own search bar since it's part of normal
              document flow, not position:fixed.
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
        <Modal
          open={!!driverModalContent}
          onCancel={() => setDriverModalContent(undefined)}
          footer={null}
          title={null}
          width={360}
        >
          <MapModalBody
            content={driverModalContent}
            onClose={() => setDriverModalContent(undefined)}
          />
        </Modal>
        <Flex vertical>
          <Flex vertical key={sc.key}>
            {sc.key === BRICK360_CATEGORY.financials && (
              <Flex
                align="flex-start"
                style={{
                  marginBottom: 8,
                  borderRadius: 8,
                  backgroundColor: "white",
                  alignSelf: "flex-start",
                  width: "fit-content",
                  padding: 8,
                  marginLeft: 4,
                }}
                vertical
              >
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    marginTop: 4,
                    marginLeft: 2,
                    color: COLORS.primaryColor,
                  }}
                >
                  AVG. SQUARE FOOT PRICE
                </Typography.Text>
                {lvnzyProject?.meta.costingDetails && (
                  <Flex align="center" gap={4}>
                    <DynamicReactIcon
                      iconName="HiOutlineCurrencyRupee"
                      iconSet="hi"
                      size={20}
                      color={COLORS.textColorDark}
                    ></DynamicReactIcon>
                    <Typography.Text
                      style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}
                    >
                      {thsndFormat(
                        `${
                          Math.round(
                            lvnzyProject?.originalProjectId?.info.rate
                              .minimumUnitCost /
                              lvnzyProject?.originalProjectId?.info.rate
                                .minimumUnitSize /
                              25,
                          ) * 25
                        }`,
                      )}
                    </Typography.Text>
                  </Flex>
                )}
              </Flex>
            )}

            {sc.key === BRICK360_CATEGORY.areaConnectivity &&
              closestDrivers.length > 0 && (
                <Flex
                  gap={8}
                  style={{
                    marginBottom: 8,
                    overflowX: "auto",
                    flexWrap: "nowrap",
                    paddingBottom: 2,
                    scrollbarWidth: "none"
                  }}
                >
                  {closestDrivers.map((d: any) => {
                    const driverCfg = (LivIndexDriversConfig as any)[
                      d.driver
                    ];
                    return (
                      <Flex
                        key={d._id || d.name}
                        align="center"
                        gap={6}
                        onClick={() => openDriverModal(d)}
                        style={{
                          borderRadius: 8,
                          backgroundColor: "white",
                          border: `1px solid ${COLORS.borderColor}`,
                          padding: "6px 10px",
                          width: 160,
                          flexShrink: 0,
                          cursor: "pointer",
                        }}
                      >
                        <DynamicReactIcon
                          iconName={driverCfg?.icon.name || "MdPlace"}
                          iconSet={driverCfg?.icon.set || "md"}
                          size={32}
                          color={COLORS.textColorDark}
                        ></DynamicReactIcon>
                        <Flex gap={0} style={{ minWidth: 0 }}>
                          <Typography.Text
                            ellipsis
                            style={{
                              fontSize: FONT_SIZE.PARA,
                              fontWeight: 500,
                            }}
                          >
                            {d.name}
                          </Typography.Text>
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.SUB_TEXT,
                              color: COLORS.textColorMedium,
                              flexShrink: 0,
                            }}
                          >
                            {d.duration} mins
                          </Typography.Text>
                        </Flex>
                      </Flex>
                    );
                  })}
                </Flex>
              )}

            {sc.key === BRICK360_CATEGORY.property &&
              (() => {
                const unitSizesContent = getMinMaxSize(
                  lvnzyProject?.originalProjectId?.info.unitConfigWithPricing,
                );
                const floorsContent =
                  lvnzyProject?.originalProjectId?.info.unitConfigWithPricing &&
                  (lvnzyProject as any)?.meta.projectConfigurations.unitsBreakup
                    ? getTotalFloors(lvnzyProject)
                    : null;
                const totalUnits = (lvnzyProject as any)?.property.layout
                  .totalUnits;
                const totalPhases = (lvnzyProject as any)?.property.layout
                  .totalPhases;

                const statCardStyle = {
                  borderRadius: 8,
                  backgroundColor: "white",
                  width: "fit-content",
                  border: `1px solid ${COLORS.borderColor}`,
                  padding: 8,
                };
                const labelStyle = {
                  fontSize: FONT_SIZE.SUB_TEXT,
                  marginBottom: 2,
                  color: COLORS.primaryColor,
                };

                return (
                  <Flex gap={8} wrap style={{ marginBottom: 8 }}>
                    <Flex vertical style={statCardStyle}>
                      <Typography.Text style={labelStyle}>
                        SCALE
                      </Typography.Text>
                      <Flex align="center" gap={4}>
                        <Typography.Text
                          style={{
                            fontSize: FONT_SIZE.HEADING_4,
                            color: COLORS.textColorMedium,
                            fontWeight: 500,
                          }}
                        >
                          {Math.round(
                            (lvnzyProject as any)?.property.layout
                              .totalLandArea / 404.68564,
                          ) / 10}{" "}
                          Acre
                        </Typography.Text>
                        {totalUnits && (
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.HEADING_4,
                              color: COLORS.textColorMedium,
                              fontWeight: 500,
                            }}
                          >
                            · {totalUnits} Units
                          </Typography.Text>
                        )}
                        {totalPhases > 1 && (
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.HEADING_4,
                              fontWeight: 500,
                              color: COLORS.textColorMedium,
                            }}
                          >
                            · {totalPhases} Phases
                          </Typography.Text>
                        )}
                      </Flex>
                    </Flex>

                    {unitSizesContent && (
                      <Flex vertical style={statCardStyle}>
                        <Typography.Text style={labelStyle}>
                          UNIT SIZES
                        </Typography.Text>
                        {unitSizesContent}
                      </Flex>
                    )}

                    {floorsContent && (
                      <Flex vertical style={statCardStyle}>
                        <Typography.Text style={labelStyle}>
                          Floors
                        </Typography.Text>
                        {floorsContent}
                      </Flex>
                    )}
                  </Flex>
                );
              })()}

            {orderedDataPoints.length ? (
              <Flex vertical style={{ marginTop: 16 }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    marginBottom: 4,
                    color: COLORS.textColorMedium,
                    fontWeight: 600,
                    marginLeft: 4
                  }}
                >
                  360° ANALYSIS
                </Typography.Text>
                <Collapse
                  style={{ marginTop: 0 }}
                  bordered={false}
                  ghost
                  expandIcon={({ isActive }) => (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        backgroundColor: isActive
                          ? COLORS.textColorDark
                          : COLORS.bgColorMedium,
                        color: isActive ? "white" : COLORS.textColorDark,
                        fontSize: FONT_SIZE.HEADING_3,
                        fontWeight: 800,
                        lineHeight: "100%",
                      }}
                    >
                      {isActive ? "−" : "+"}
                    </Flex>
                  )}
                  activeKey={
                    selectedKey?.startsWith(`${sc.key}::`) ? [selectedKey] : []
                  }
                  onChange={(keys) => {
                    const key = Array.isArray(keys) ? keys[0] : keys;
                    handleSelectKey(key || undefined);
                    if (key) {
                      captureAnalyticsEvent("expand-datapoint", {
                        pillar: sc.key,
                        dataPoint: key.split("::")[1],
                        projectName: lvnzyProject?.meta.projectName,
                        projectId: lvnzyProject?._id,
                      });
                    }
                  }}
                  items={orderedDataPoints.map((item: any, index: number) => {
                    const key = `${sc.key}::${item[0]}`;
                    return {
                      key,
                      style: {
                        marginBottom: 8,
                        border: `1px solid ${COLORS.borderColor}`,
                        borderRadius: 8,
                        overflow: "hidden",
                        backgroundColor: "white",
                      },
                      label: (
                        <div ref={index === 0 ? ref : null}>
                          <Flex align="center" gap={8} style={{ width: "100%" }}>
                            <RatingBar value={item[1].rating}></RatingBar>
                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.HEADING_4,
                                color:
                                  item[1].rating > 0
                                    ? COLORS.textColorDark
                                    : COLORS.textColorLight,
                              }}
                            >
                              {capitalize(
                                (Brick360DataPoints as any)[sc.key][item[0]][
                                  "label"
                                ],
                              )}
                            </Typography.Text>
                          </Flex>
                        </div>
                      ),
                      children: renderDataPointDetail(sc.key, item[0]),
                    };
                  })}
                />
              </Flex>
            ) : (
              <Flex style={{ marginTop: 16 }}>
                <Alert showIcon message={getNoDataPlaceholder(sc.key)} type="warning" />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

interface Brick360HighlightsProps {
  lvnzyProject?: LvnzyProject;
  /** Stack cards top-to-bottom instead of a horizontal scroll strip - used
   * when this renders as its own tab (brick360-inline.tsx) rather than the
   * condensed strip above the tab bar. */
  vertical?: boolean;
}

// The "360 HIGHLIGHTS" pros/cons strip - previously the top of Brick360Tab's
// (and then Brick360Pillar's) content, now its own first tab in
// brick360-inline.tsx instead of a strip shown above every pillar.
export function Brick360Highlights({
  lvnzyProject,
  vertical,
}: Brick360HighlightsProps) {
  const { isMobile } = useDevice();
  const [quickSnapshotDialogOpen, setQuickSnapshotDialogOpen] = useState(false);
  const [quickSnapshotDialogContent, setQuickSnapshotDialogContent] =
    useState<ReactNode>("");

  function renderSummaryPoint(pt: string, isPro: boolean) {
    const { title, content } = parseProConHtml(pt);

    function reasoningStmt(isDialog: boolean) {
      return (
        <Flex vertical>
          <Flex align="flex-start" gap={4} style={{ marginBottom: 8 }}>
            {isDialog ? null : (
              <DynamicReactIcon
                size={isPro ? 16 : 20}
                iconName={isPro ? "FaRegLaugh" : "PiSmileySadBold"}
                iconSet={isPro ? "fa" : "pi"}
                color={isPro ? COLORS.primaryColor : COLORS.redIdentifier}
              ></DynamicReactIcon>
            )}
            <Typography.Text
              style={{
                fontWeight: 500,
                fontSize: isDialog ? FONT_SIZE.HEADING_2 : FONT_SIZE.HEADING_4,
                lineHeight: "110%",
                marginTop: isDialog ? 24 : 0,
              }}
            >
              {title}
            </Typography.Text>
          </Flex>
          {content && (
            <div
              dangerouslySetInnerHTML={{
                __html: `${content} ${
                  !isDialog ? '<span class="read-more">Read more</span>' : ""
                }`,
              }}
              className={`reasoning ${!isDialog ? "truncated" : ""} ${
                isPro ? "" : "con"
              }`}
              style={{
                fontSize: !isDialog ? FONT_SIZE.SUB_TEXT : FONT_SIZE.HEADING_3,
                margin: 0,
                marginTop: !isDialog ? 0 : 16,
                width: !isDialog ? (vertical ? "100%" : 275) : "100%",
                color: COLORS.textColorMedium,
                textWrap: "wrap",
              }}
            ></div>
          )}
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
          width: vertical ? "100%" : undefined,
        }}
        onClick={() => {
          setQuickSnapshotDialogOpen(true);
          setQuickSnapshotDialogContent(reasoningStmt(true));
          captureAnalyticsEvent("summary-expand", {
            summaryType: isPro ? "pros" : "cons",
            summaryTitle: title,
            projectName: lvnzyProject?.meta.projectName,
            projectId: lvnzyProject?._id,
          });
        }}
        gap={4}
        vertical
      >
        {reasoningStmt(false)}
      </Flex>
    );
  }

  if (
    !lvnzyProject?.score?.summary ||
    !(lvnzyProject.score.summary.pros || lvnzyProject.score.summary.cons)
  ) {
    return null;
  }

  const cards = (
    <>
      {(lvnzyProject.score.summary.pros || []).map((p: any, i: number) => (
        <div
          key={`pro-${i}`}
          style={vertical ? { width: "100%" } : undefined}
        >
          {renderSummaryPoint(p, true)}
        </div>
      ))}
      {(lvnzyProject.score.summary.cons || []).map((p: any, i: number) => (
        <div
          key={`con-${i}`}
          style={vertical ? { width: "100%" } : undefined}
        >
          {renderSummaryPoint(p, false)}
        </div>
      ))}
    </>
  );

  return (
    <>
      <Flex vertical style={{ marginBottom: 0 }}>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.PARA,
            marginBottom: 4,
            color: COLORS.textColorMedium,
            fontWeight: 600
          }}
        >
          360° HIGHLIGHTS
        </Typography.Text>
        {vertical ? (
          isMobile ? (
            <Flex vertical gap={12} style={{ width: "100%" }}>
              {cards}
            </Flex>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
                width: "100%",
              }}
            >
              {cards}
            </div>
          )
        ) : (
          <div style={{ position: "relative" }}>
            <Flex
              gap={16}
              style={{
                width: "100%",
                overflowX: "scroll",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
            >
              {cards}
            </Flex>
            {/* fade mask - signals there's more to scroll instead of an abrupt clip */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: 32,
                pointerEvents: "none",
                background:
                  "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,1))",
              }}
            />
          </div>
        )}
      </Flex>

      <SnapshotModal
        isOpen={quickSnapshotDialogOpen}
        onClose={() => setQuickSnapshotDialogOpen(false)}
        pt={quickSnapshotDialogContent}
      />
    </>
  );
}

export default Brick360Pillar;
