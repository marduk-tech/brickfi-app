"use client";

import { Button, Flex, Modal, Tabs, Tour, TourProps, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useFetchLvnzyProjectBySlug } from "../../../hooks/use-lvnzy-project";
import DynamicReactIcon from "../../../components/common/dynamic-react-icon";

import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  LocalStorageKeys,
} from "../../../libs/constants";
import { captureAnalyticsEvent, getCategoryScore } from "../../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { LvnzyProject } from "../../../types/LvnzyProject";
import {
  Brick360Highlights,
  Brick360Pillar,
  PillarMapConfig,
} from "../../../components/brick-360/brick360-pillar";
import GradientBar from "../../../components/common/grading-bar";
import { MediaTab } from "../../../components/brick-360/media-tab";
import { ProjectHeader } from "../../../components/brick-360/project-header";
import TimelineTabV2 from "../../../components/brick-360/timeline-tab-v2";
import { UnitsTab } from "../../../components/brick-360/units-tab";
import styles from "./brick360-inline.module.css";

// close button fades the container out before actually unmounting it -
// this must match the CSS transition duration below.
const CLOSE_FADE_MS = 220;

// One tab button per Brick360 pillar (Location/Developer/Property/Financials
// per BRICK360_CATEGORY's declared order) - these used to be sections stacked
// inside a single shared "Brick 360" tab; now each is its own top-level tab,
// same level/styling as Price/Units, Media, Timeline below.
const PILLAR_TABS = Object.keys(BRICK360_CATEGORY)
  .map((key) => {
    const catInfo = (Brick360CategoryInfo as any)[key];
    if (!catInfo || catInfo.disabled) return null;
    return {
      key,
      label: catInfo.title,
      iconName: catInfo.iconName,
      iconSet: catInfo.iconSet,
    };
  })
  .filter((t): t is NonNullable<typeof t> => !!t);
const PILLAR_KEYS = PILLAR_TABS.map((t) => t.key);

const HIGHLIGHTS_TAB_KEY = "highlights";

interface Brick360InlineProps {
  slug: string;
  projectData?: LvnzyProject;
  /** Closes this view and returns to the underlying brickchat conversation. */
  onClose: () => void;
  /** Forwarded from Brick360Pillar - see brick360-pillar.tsx and brick-map-chat.tsx. */
  onMapConfigChange?: (config: PillarMapConfig | null) => void;
}

// Inline, brickchat-embedded variant of Brick360v2 (see
// components/brick-360/brick360-v2.tsx) - same tabs/data, two differences:
// - tabs are rendered as buttons instead of antd <Tabs>, since this sits
//   inside the chat panel rather than owning a full page.
// - the Map tab is dropped entirely. Map-view duties are handled by
//   BrickMapChat, which brickchat-client already keeps mounted alongside
//   this component and re-initializes with this same project's connectivity
//   data instead of spinning up a second map instance.
export function Brick360Inline({
  slug,
  projectData,
  onClose,
  onMapConfigChange,
}: Brick360InlineProps) {
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, CLOSE_FADE_MS);
  };

  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const { data: fetchedProject } = useFetchLvnzyProjectBySlug(
    slug,
    !projectData,
  );
  const lvnzyProject = projectData || fetchedProject;

  const scoreParamTourRef = useRef(null);
  const pmtPlanTourRef = useRef(null);

  const [tourSteps, setTourSteps] = useState<TourProps["steps"]>([]);

  useEffect(() => {
    if (!lvnzyProject) {
      return;
    }
    captureAnalyticsEvent("report-view", {
      projectName: lvnzyProject?.meta.projectName,
      projectId: lvnzyProject?._id,
    });
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
            Click{" "}
            <span
              style={{
                backgroundColor: COLORS.bgColorMedium,
                padding: "1px 4px",
                fontSize: FONT_SIZE.PARA,
                fontWeight: "bold",
                marginTop: -2,
              }}
            >
              +
            </span>{" "}
            here to see more details of this rating including map view.
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

  const [selectedTabKey, setSelectedTabKey] = useState<string>(
    HIGHLIGHTS_TAB_KEY,
  );
  const tabKeyInitialized = useRef(false);

  const hasHighlights = !!(
    lvnzyProject?.score?.summary &&
    (lvnzyProject.score.summary.pros || lvnzyProject.score.summary.cons)
  );

  useEffect(() => {
    if (lvnzyProject && !tabKeyInitialized.current) {
      tabKeyInitialized.current = true;
      setSelectedTabKey(
        hasHighlights
          ? HIGHLIGHTS_TAB_KEY
          : PILLAR_TABS[0]?.key || "units",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lvnzyProject]);

  const tabButtons: {
    key: string;
    label: string;
    iconName: string;
    iconSet: any;
  }[] = [
    ...(hasHighlights
      ? [
          {
            key: HIGHLIGHTS_TAB_KEY,
            label: "Highlights",
            iconName: "AiFillStar",
            iconSet: "ai",
          },
        ]
      : []),
    ...PILLAR_TABS,
    { key: "units", label: "Floorplans", iconName: "RiLayout2Fill", iconSet: "ri" },
    ...((lvnzyProject?.meta?.projectTimelines?.length ?? 0) > 0
      ? [
          {
            key: "timeline",
            label: "Timeline",
            iconName: "LuCalendarRange",
            iconSet: "lu",
          },
        ]
      : []),
  ];

  const handleTabChange = (key: string) => {
    captureAnalyticsEvent("tab-navigate", {
      tabName: key,
      projectName: lvnzyProject?.meta.projectName,
      projectId: lvnzyProject?._id,
    });
    setSelectedTabKey(key);
  };

  const tabItems = tabButtons.map((tab) => {
    const isActive = selectedTabKey === tab.key;
    const categoryScore = PILLAR_KEYS.includes(tab.key)
      ? (lvnzyProject?.score as any)?.[tab.key]
      : undefined;
    return {
      key: tab.key,
      label: (
        <Flex align="center" gap={2}>
          <Flex
            align="center"
            gap={6}
            style={{
              backgroundColor: isActive ? COLORS.primaryColor : "transparent",
              borderRadius: 16,
              padding: isActive ? "4px 12px" : 0,
            }}
          >
            <DynamicReactIcon
              iconName={tab.iconName}
              iconSet={tab.iconSet}
              color={isActive ? "white" : COLORS.textColorMedium}
              size={16}
            ></DynamicReactIcon>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                fontWeight: isActive ? 600: 500,
                color: isActive ? "white" : COLORS.textColorMedium,
              }}
            >
              {tab.label}
            </Typography.Text>
          </Flex>
          {categoryScore ? (
            <GradientBar
              value={getCategoryScore(categoryScore)}
              showBadgeOnly
            ></GradientBar>
          ) : null}
        </Flex>
      ),
      children:
        tab.key === HIGHLIGHTS_TAB_KEY ? (
          <div style={{ padding: "0 8px" }}>
            <Brick360Highlights lvnzyProject={lvnzyProject} vertical />
          </div>
        ) : PILLAR_KEYS.includes(tab.key) ? (
          <Brick360Pillar
            lvnzyProject={lvnzyProject}
            categoryKey={tab.key}
            ref={scoreParamTourRef}
            onMapConfigChange={onMapConfigChange}
          />
        ) : tab.key === "units" ? (
          <UnitsTab lvnzyProject={lvnzyProject} />
        ) : (
          <TimelineTabV2 lvnzyProject={lvnzyProject} />
        ),
    };
  });

  // Up to 10 preview images shown as a horizontal strip right below the
  // header - "See All" opens the full MediaTab (same media/filtering logic)
  // in a modal instead of media having its own top-level tab.
  const previewImages = (lvnzyProject?.originalProjectId?.media || [])
    .filter((m: any) => m.type === "image" && m.image?.url)
    .slice(0, 10);

  return (
    <Flex
      vertical
      style={{
        margin: "auto",
        overflowX: "hidden",
        width: "100%",
        border: `0px solid ${COLORS.borderColor}`,
        backgroundColor: COLORS.bgColor,
        borderRadius: 12,
        padding: "24px 8px",
        opacity: isClosing ? 0 : 1,
        transition: `opacity ${CLOSE_FADE_MS}ms ease`,
        position: "relative"
      }}
    >
      <Flex justify="flex-end" style={{position: "absolute", right: 0, top: 0}}>
        <Button
          type="text"
          icon={
            <DynamicReactIcon
              iconName="IoCloseCircle"
              iconSet="io5"
              size={24}
              color={COLORS.textColorMedium}
            ></DynamicReactIcon>
          }
          onClick={handleClose}
        />
      </Flex>

      <ProjectHeader ref={pmtPlanTourRef} lvnzyProject={lvnzyProject} />

      {previewImages.length ? (
        <div style={{ margin: "8px 0", padding: "0 8px 0", position: "relative" }}>
          <Flex
            gap={8}
            style={{
              width: "100%",
              height: 125,
              overflowX: "scroll",
              scrollbarWidth: "none",
            }}
             onClick={() => setMediaModalOpen(true)}
          >
            {previewImages.map((m: any, i: number) => (
              <img
                key={m._id || m.image.url || i}
                src={m.image.url}
                alt={m.image.tags?.[0] || "project media"}
                style={{
                  height: "100%",
                  width: "auto",
                  flexShrink: 0,
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            ))}
          </Flex>
          <Button
            size="small"
            onClick={() => setMediaModalOpen(true)}
            style={{
              position: "absolute",
              bottom: 8,
              right: 16,
              borderRadius: 8,
              height: 24
            }}
            type="primary"
          >
            <Typography.Text style={{fontSize: FONT_SIZE.SUB_TEXT, fontWeight: 800, color: "white"}}>
            See All
            </Typography.Text>
          </Button>
        </div>
      ) : null}

      <Tabs
        activeKey={selectedTabKey}
        onChange={handleTabChange}
        items={tabItems}
        destroyOnHidden
        className={styles.tabsNoNavBorder}
        style={{ padding: "0 8px", marginTop: 16 }}
      />

      <Modal
        open={mediaModalOpen}
        onCancel={() => setMediaModalOpen(false)}
        footer={null}
        title="Media"
        width={900}
        destroyOnHidden
        styles={{ mask: { backgroundColor: "transparent" } }}
      >
        <MediaTab lvnzyProject={lvnzyProject} />
      </Modal>

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
