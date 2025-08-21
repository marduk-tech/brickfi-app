import { Flex, Tabs, Tour, TourProps, Typography } from "antd";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { useFetchLvnzyProjectById } from "../../hooks/use-lvnzy-project";

import { Brick360Tab } from "./brick-360-tab";
import { ConfigurationsModal } from "./configurations-modal";
import { FakeProgress } from "./fake-progress";
import { MapTab } from "./map-tab";
import { MediaTab } from "./media-tab";
import { PricePointModal } from "./price-point-modal";
import { ProjectHeader } from "./project-header";
import { UnitsTab } from "./units-tab";
import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  Brick360DataPoints,
  LocalStorageKeys,
} from "../../libs/constants";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import Brick360Chat from "../liv/brick360-chat";

const FAKE_TIMER_SECS = 700;

export function Brick360v2() {
  const { lvnzyProjectId } = useParams();

  const brick360ChatRef = useRef<{
    expandChat: () => void;
  } | null>(null);

  const { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectById(lvnzyProjectId!);

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
  });

  const [scoreParams, setScoreParams] = useState<any[]>([]);

  const [pmtDetailsModalContent, setPmtDetailsModalContent] = useState<
    ReactNode | undefined
  >();

  const [selectedDataPointCategory, setSelectedDataPointCategory] =
    useState<any>();
  const [selectedDataPointSubCategory, setSelectedDataPointSubCategory] =
    useState<any>();

  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");
  const [fakeInterval, setFakeInterval] = useState<any>();

  const [isConfigurationsModalOpen, setIsConfigurationsModalOpen] =
    useState(false);

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
  });

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

  if (lvnzyProjectIsLoading) {
    return <FakeProgress progress={fakeTimeoutProgress} projectName={""} />;
  }

  // // Fake progress bar
  // if (fakeTimeoutProgress < 130) {
  //   return (
  //     <FakeProgress
  //       progress={fakeTimeoutProgress}
  //       projectName={lvnzyProject?.meta.projectName}
  //     />
  //   );
  // }

  return (
    <Flex
      vertical
      style={{
        width: "100%",
        margin: "auto",
        overflowX: "hidden",
      }}
    >
      <ProjectHeader ref={pmtPlanTourRef} lvnzyProject={lvnzyProject} />

      <Tabs
        tabBarGutter={24}
        defaultActiveKey="brick-360"
        tabBarStyle={{}}
        style={{ padding: "0 8px" }}
        items={[
          {
            key: "brick-360",
            label: (
              <Flex gap={4} align="center">
                <DynamicReactIcon
                  iconName="LiaGgCircle"
                  iconSet="lia"
                  color={COLORS.textColorDark}
                  size={20}
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_3,
                    color: COLORS.textColorDark,
                  }}
                >
                  Brick 360
                </Typography.Text>
              </Flex>
            ),
            children: (
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
            ),
          },
          {
            key: "units",
            label: (
              <Flex gap={4} align="center">
                <DynamicReactIcon
                  iconName="RiLayout2Fill"
                  iconSet="ri"
                  color={COLORS.textColorDark}
                  size={20}
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_3,
                    color: COLORS.textColorDark,
                  }}
                >
                  Price/Units
                </Typography.Text>
              </Flex>
            ),
            children: <UnitsTab lvnzyProject={lvnzyProject} />,
          },
          {
            key: "map",
            label: (
              <Flex gap={4} align="center">
                <DynamicReactIcon
                  iconName="LiaMapMarkedAltSolid"
                  iconSet="lia"
                  color={COLORS.textColorDark}
                  size={20}
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_3,
                    color: COLORS.textColorDark,
                  }}
                >
                  Map
                </Typography.Text>
              </Flex>
            ),
            children: <MapTab lvnzyProject={lvnzyProject} />,
          },
          {
            key: "media",
            label: (
              <Flex gap={4} align="center">
                <DynamicReactIcon
                  iconName="PiImagesDuotone"
                  iconSet="pi"
                  color={COLORS.textColorDark}
                  size={20}
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_3,
                    color: COLORS.textColorDark,
                  }}
                >
                  Media
                </Typography.Text>
              </Flex>
            ),
            children: <MediaTab lvnzyProject={lvnzyProject} />,
          },
        ]}
      ></Tabs>

      <PricePointModal
        content={pmtDetailsModalContent}
        onClose={() => setPmtDetailsModalContent(undefined)}
      />

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
      <Tour
        open={tourOpen}
        onClose={() => {
          setTourOpen(false);
          localStorage.setItem(LocalStorageKeys.tour, "tour-done");
        }}
        steps={tourSteps}
      />

      <ConfigurationsModal
        isOpen={isConfigurationsModalOpen}
        onClose={() => setIsConfigurationsModalOpen(false)}
        lvnzyProject={lvnzyProject}
      />
    </Flex>
  );
}
