"use client";

import { Flex, Tabs, Tour, TourProps, Typography } from "antd";
import { useParams } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import {
  useFetchLvnzyProjectById,
  useFetchLvnzyProjectBySlug,
} from "../../hooks/use-lvnzy-project";
import DynamicReactIcon from "../common/dynamic-react-icon";

import { useWindowDimensions } from "@/hooks/use-browser-safe";
import { useDevice } from "@/hooks/use-device";
import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  Brick360DataPoints,
  LocalStorageKeys,
} from "../../libs/constants";
import { captureAnalyticsEvent } from "../../libs/lvnzy-helper";
import {
  COLORS,
  FONT_SIZE,
  HORIZONTAL_PADDING,
} from "../../theme/style-constants";
import { Brick360Tab } from "./brick-360-tab";
import Brick360Chat from "./brick360-chat";
import { ConfigurationsModal } from "./configurations-modal";
import { FakeProgress } from "./fake-progress";
import { MapTab } from "./map-tab";
import { MediaTab } from "./media-tab";
import { PricePointModal } from "./price-point-modal";
import { ProjectHeader } from "./project-header";
import TimelineTab from "./timeline-tab";
import TimelineTabV2 from "./timeline-tab-v2";
import { UnitsTab } from "./units-tab";

const FAKE_TIMER_SECS = 500;

interface Brick360v2Props {
  slug: string;
}

export function Brick360v2({ slug }: Brick360v2Props) {
  const { isMobile } = useDevice();
  const { width } = useWindowDimensions();

  const brick360ChatRef = useRef<{
    expandChat: () => void;
  } | null>(null);

  const { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectBySlug(slug);

  const scoreParamTourRef = useRef(null);
  const pmtPlanTourRef = useRef(null);

  const [tourSteps, setTourSteps] = useState<TourProps["steps"]>([]);

  useEffect(() => {
    if (!lvnzyProject) {
      return;
    }
    const tempTourSteps: TourProps["steps"] = [];
    tempTourSteps?.push({
      title: (
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, color: "white" }}
        >
          Click card to know more details
        </Typography.Text>
      ),
      description: (
        <Flex vertical align="center" gap={8}>
          <img
            src="/images/tour-1.png"
            alt="see rating details"
            width={300}
            style={{
              border: `3px solid ${COLORS.borderColorDark}`,
              borderRadius: 8,
            }}
          ></img>
          <Typography.Text
            style={{ width: 300, fontSize: FONT_SIZE.HEADING_2 }}
          >
            Click here to see more details of this rating including map view.
          </Typography.Text>
        </Flex>
      ),
      placement: "bottom",
      type: "default",
      target: () => scoreParamTourRef.current,
    });
    if (
      !!pmtPlanTourRef &&
      !!lvnzyProject.originalProjectId?.info?.financialPlan
    ) {
      tempTourSteps?.push({
        title: (
          <Typography.Text
            style={{ fontSize: FONT_SIZE.HEADING_3, color: "white" }}
          >
            Click card to know more details
          </Typography.Text>
        ),
        description: (
          <Flex vertical align="center" gap={8}>
            <img
              src="/images/tour-2.png"
              alt="see rating details"
              width={300}
              style={{
                border: `3px solid ${COLORS.borderColorDark}`,
                borderRadius: 8,
              }}
            ></img>
            <Typography.Text
              style={{ width: 300, fontSize: FONT_SIZE.HEADING_2 }}
            >
              Click to see payment plan details.
            </Typography.Text>
          </Flex>
        ),
        placement: "bottom",
        type: "default",
        target: () => pmtPlanTourRef.current,
      });
    }
    setTourSteps(tempTourSteps);
  }, [lvnzyProject]);
  const [tourOpen, setTourOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(LocalStorageKeys.tour) !== "tour-done") {
      setTimeout(() => {
        setTourOpen(true);
      }, 2000);
    }
  }, []);

  const [scoreParams, setScoreParams] = useState<any[]>([]);
  const [selectedTabKey, setSelectedTabKey] = useState<string>("brick360");

  const [selectedDataPointCategory, setSelectedDataPointCategory] =
    useState<any>();
  const [selectedDataPointSubCategory, setSelectedDataPointSubCategory] =
    useState<any>();

  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");
  const [fakeInterval, setFakeInterval] = useState<any>();

  const isLvnzyProjectLoadingRef = useRef(lvnzyProjectIsLoading);
  useEffect(() => {
    isLvnzyProjectLoadingRef.current = lvnzyProjectIsLoading;
  }, [lvnzyProjectIsLoading]);

  // Get data category icon
  const getDataCategoryIcon = (iconName: string, iconSet: any) => {
    return (
      <DynamicReactIcon
        iconName={iconName}
        iconSet={iconSet}
        color={COLORS.textColorDark}
        size={20}
      ></DynamicReactIcon>
    );
  };

  // Fake timeout and progress
  useEffect(() => {
    if (!fakeInterval) {
      const interval = setInterval(() => {
        setFakeTimeoutProgress((prevFakeTimeoutProgress: any) => {
          if (!isLvnzyProjectLoadingRef.current) {
            // Stop at 10
            clearInterval(interval);
            return 100;
          }
          return Math.min(95, prevFakeTimeoutProgress + 10);
        });
      }, FAKE_TIMER_SECS);
      setFakeInterval(interval);
    }
  }, []);

  // Setting main data points category
  useEffect(() => {
    if (lvnzyProject) {
      const params = [];

      for (const key in BRICK360_CATEGORY) {
        const cat = BRICK360_CATEGORY[key as keyof typeof BRICK360_CATEGORY];
        const catInfo = Brick360CategoryInfo[cat];
        if (!catInfo.disabled) {
          params.push({
            title: catInfo.title,
            key: key,
            icon: getDataCategoryIcon(catInfo.iconName, catInfo.iconSet),
            dataPoints: lvnzyProject.score?.[cat]
              ? Object.entries(lvnzyProject.score[cat]).filter(
                  (e) => e && e.length && (e as any)[1].rating
                )
              : [],
          });
        }
      }
      setScoreParams(params);
    }
  }, [lvnzyProject]);

  function renderTabHeader(
    title: string,
    iconName: string,
    iconSet: any,
    tabKey: string
  ) {
    return (
      <Flex
        gap={0}
        align="center"
        vertical
        style={{ position: "relative", padding: 0 }}
      >
        {tabKey == "units" &&
        lvnzyProject &&
        lvnzyProject.originalProjectId?.info?.financialPlan ? (
          <Flex style={{ position: "absolute", right: -2, top: -8 }}>
            <DynamicReactIcon
              iconName="BiSolidOffer"
              iconSet="bi"
              size={16}
              color={
                selectedTabKey == tabKey
                  ? COLORS.primaryColor
                  : COLORS.textColorMedium
              }
            ></DynamicReactIcon>
          </Flex>
        ) : null}
        <DynamicReactIcon
          iconName={iconName}
          iconSet={iconSet}
          color={
            selectedTabKey == tabKey
              ? COLORS.primaryColor
              : COLORS.textColorMedium
          }
          size={28}
        ></DynamicReactIcon>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color:
              selectedTabKey == tabKey
                ? COLORS.primaryColor
                : COLORS.textColorMedium,
          }}
        >
          {title}
        </Typography.Text>
      </Flex>
    );
  }

  if (lvnzyProjectIsLoading) {
    return <FakeProgress progress={fakeTimeoutProgress} projectName={""} />;
  }

  return (
    <Flex
      vertical
      style={{
        margin: "auto",
        overflowX: "hidden",
        width: isMobile ? "100%" : width - HORIZONTAL_PADDING * 2,
      }}
    >
      <ProjectHeader ref={pmtPlanTourRef} lvnzyProject={lvnzyProject} />

      <Tabs
        tabBarGutter={40}
        defaultActiveKey="brick360"
        onChange={(activeKey: string) => {
          captureAnalyticsEvent("tab-navigate", {
            tabName: activeKey,
          });
          setSelectedTabKey(activeKey);
        }}
        tabBarStyle={{}}
        style={{ padding: "0 8px" }}
        items={[
          ...[
            {
              key: "brick360",
              label: renderTabHeader(
                "Brick 360",
                "TbView360Number",
                "tb",
                "brick360"
              ),
              children:
                selectedTabKey === "brick360" ? (
                  <Brick360Tab
                    lvnzyProject={lvnzyProject}
                    scoreParams={scoreParams}
                    ref={scoreParamTourRef}
                    onDataPointClick={(sc, item) => {
                      brick360ChatRef.current?.expandChat();
                      setSelectedDataPointCategory(sc.key);
                      setSelectedDataPointSubCategory((item as any)[0]);
                      setSelectedDataPoint((item as any)[1]);
                      setSelectedDataPointTitle(
                        `${sc.title} > ${
                          (Brick360DataPoints as any)[sc.key][(item as any)[0]][
                            "label"
                          ]
                        }`
                      );
                    }}
                  />
                ) : null,
            },
            {
              key: "units",
              label: renderTabHeader(
                "Price/Units",
                "RiLayout2Fill",
                "ri",
                "units"
              ),
              children:
                selectedTabKey === "units" ? (
                  <UnitsTab lvnzyProject={lvnzyProject} />
                ) : null,
            },
            {
              key: "map",
              label: renderTabHeader(
                "Map",
                "LiaMapMarkedAltSolid",
                "lia",
                "map"
              ),
              children:
                selectedTabKey === "map" ? (
                  <MapTab lvnzyProject={lvnzyProject} />
                ) : null,
            },
            {
              key: "media",
              label: renderTabHeader("Media", "PiImagesDuotone", "pi", "media"),
              children:
                selectedTabKey === "media" ? (
                  <MediaTab lvnzyProject={lvnzyProject} />
                ) : null,
            },
          ],
          ...(lvnzyProject?.property.layout.totalPhases > 0
            ? [
                {
                  key: "timeline",
                  label: renderTabHeader(
                    "Timeline",
                    "LuCalendarRange",
                    "lu",
                    "timeline"
                  ),
                  children:
                    selectedTabKey === "timeline" ? (
                      <TimelineTabV2 lvnzyProject={lvnzyProject} />
                    ) : null,
                },
              ]
            : []),
        ]}
      ></Tabs>

      {selectedTabKey == "brick360" ? (
        <Brick360Chat
          ref={brick360ChatRef}
          lvnzyProject={lvnzyProject!}
          dataPoint={{
            selectedDataPointTitle,
            selectedDataPointCategory,
            selectedDataPoint,
            selectedDataPointSubCategory,
          }}
        />
      ) : null}

      <Tour
        open={tourOpen}
        onClose={() => {
          setTourOpen(false);
          localStorage.setItem(LocalStorageKeys.tour, "tour-done");
        }}
        steps={tourSteps}
      />
    </Flex>
  );
}
