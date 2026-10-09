"use client";

import { Button, Flex, Modal, Tabs, Tour, TourProps, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useFetchLvnzyProjectBySlug } from "@/hooks/use-lvnzy-project";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";

import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  LocalStorageKeys,
} from "@/libs/constants";
import {
  captureAnalyticsEvent,
  getCategoryScore,
} from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { LvnzyProject } from "@/types/LvnzyProject";
import {
  Brick360Highlights,
  Brick360Pillar,
  FloorplansTab,
  PillarMapConfig,
  TimelineTab,
} from "./tabs";
import GradientBar from "@/components/common/grading-bar";
import { MediaTab } from "@/components/brick-360/media-tab";
import { ProjectHeader } from "@/components/brick-360/project-header";
import styles from "./brick360-inline.module.css";
import { useDevice } from "@/hooks/use-device";

// close button fades the container out before actually unmounting it -
// this must match the CSS transition duration below.
const CLOSE_FADE_MS = 220;

// Fixed height of the inline view - its content (header, images, tabs)
// scrolls inside it rather than growing the chat panel. Capped to the
// viewport so it never runs past the screen.
const INLINE_HEIGHT = "min(820px, calc(100vh - 180px))";

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
const UNITS_TAB_KEY = "units";
const TIMELINE_TAB_KEY = "timeline";

// Display order of the tab row - tabs a project has no data for (Highlights,
// Timeline) are simply skipped; a tab key not listed here would go last.
const TAB_ORDER = [
  HIGHLIGHTS_TAB_KEY,
  UNITS_TAB_KEY,
  BRICK360_CATEGORY.property,
  BRICK360_CATEGORY.financials,
  BRICK360_CATEGORY.developer,
  BRICK360_CATEGORY.areaConnectivity,
  TIMELINE_TAB_KEY,
];
const tabOrderIndex = (key: string) => {
  const i = TAB_ORDER.indexOf(key);
  return i === -1 ? TAB_ORDER.length : i;
};


interface Brick360InlineProps {
  slug: string;
  projectData?: LvnzyProject;
  /** Closes this view and returns to the underlying brickchat conversation. */
  onClose: () => void;
  /** Forwarded from the pillar tabs - see tabs/pillar-base.tsx and brick-map-chat.tsx. */
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
  // tag the gallery modal opens on - undefined for "See All" (every image)
  const [mediaInitialTag, setMediaInitialTag] = useState<string>();
  const openGallery = (tag?: string) => {
    setMediaInitialTag(tag);
    setMediaModalOpen(true);
  };
  const { isMobile } = useDevice();

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

  const [selectedTabKey, setSelectedTabKey] =
    useState<string>(HIGHLIGHTS_TAB_KEY);
  const tabKeyInitialized = useRef(false);

  const hasHighlights = !!(
    lvnzyProject?.score?.summary &&
    (lvnzyProject.score.summary.pros || lvnzyProject.score.summary.cons)
  );

  useEffect(() => {
    if (lvnzyProject && !tabKeyInitialized.current) {
      tabKeyInitialized.current = true;
      setSelectedTabKey(
        // no highlights: next tab in TAB_ORDER (Floorplans, always present)
        hasHighlights ? HIGHLIGHTS_TAB_KEY : UNITS_TAB_KEY,
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
    {
      key: UNITS_TAB_KEY,
      label: "Floorplans",
      iconName: "RiLayout2Fill",
      iconSet: "ri",
    },
    ...((lvnzyProject?.meta?.projectTimelines?.length ?? 0) > 0
      ? [
          {
            key: TIMELINE_TAB_KEY,
            label: "Timeline",
            iconName: "LuCalendarRange",
            iconSet: "lu",
          },
        ]
      : []),
  ].sort((a, b) => tabOrderIndex(a.key) - tabOrderIndex(b.key));

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
        <Flex
          align="center"
          gap={10}
          style={{
            backgroundColor: isActive ? COLORS.primaryColor : "transparent",
            borderRadius: 8,
            border: isActive ? `1.5px solid ${COLORS.primaryColor}` : `1px solid ${COLORS.borderColorMedium}`,
            padding: isActive && selectedTabKey !== HIGHLIGHTS_TAB_KEY && categoryScore ? "0px 0 0px 12px" : "2px 12px",
          }}
        >
          <Flex align="center" gap={6} style={{}}>
            <DynamicReactIcon
              iconName={tab.iconName}
              iconSet={tab.iconSet}
              color={isActive ? "white" : COLORS.textColorMedium}
              size={22}
            ></DynamicReactIcon>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_2,
                fontWeight: 500,
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
            onOpenGallery={openGallery}
            lvnzyProject={lvnzyProject}
            categoryKey={tab.key}
            ref={scoreParamTourRef}
            onMapConfigChange={onMapConfigChange}
          />
        ) : tab.key === UNITS_TAB_KEY ? (
          <FloorplansTab lvnzyProject={lvnzyProject} />
        ) : (
          <TimelineTab lvnzyProject={lvnzyProject} />
        ),
    };
  });

  // Up to 10 preview images shown as a horizontal strip right below the
  // header - "See All" opens the full MediaTab (same media/filtering logic)
  // in a modal instead of media having its own top-level tab. Exterior shots
  // first, then amenities, then everything else - stable within each group,
  // so the original media order is kept otherwise.
  const previewImageRank = (m: any) => {
    const tags: string[] = m.image?.tags || [];
    if (tags.includes("exterior")) return 0;
    if (tags.includes("amenities")) return 1;
    return 2;
  };
  const previewImages = (lvnzyProject?.originalProjectId?.media || [])
    .filter((m: any) => m.type === "image" && m.image?.url)
    .sort((a: any, b: any) => previewImageRank(a) - previewImageRank(b))
    .slice(0, 10);

  return (
    <Flex
      vertical
      style={{
        margin: "auto",
        overflow: "hidden",
        width: "100%",
        height: INLINE_HEIGHT,
        border: `2px solid ${COLORS.borderColor}`,
        // mobile: full screen width (see brickchat-client), so no side
        // borders/rounded corners against the screen edges
        ...(isMobile ? { borderLeft: "none", borderRight: "none" } : {}),
        backgroundColor: COLORS.bgColor,
        borderRadius: isMobile ? 0 : 12,
        opacity: isClosing ? 0 : 1,
        transition: `opacity ${CLOSE_FADE_MS}ms ease`,
        position: "relative",
      }}
    >
      {/* outside the scroll area below, so it stays put while content scrolls */}
      <Flex
        justify="flex-end"
        style={{ position: "absolute", right: 0, top: 0, zIndex: 2 }}
      >
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

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          overflowX: "hidden",
          padding: isMobile ? "16px 4px" : "24px 8px",
        }}
      >
      <ProjectHeader ref={pmtPlanTourRef} lvnzyProject={lvnzyProject} />

      {previewImages.length ? (
        <div
          style={{ margin: "8px 0", padding: "0 8px 0", position: "relative" }}
        >
          <Flex
            gap={8}
            style={{
              width: "100%",
              height: 150,
              overflowX: "scroll",
              scrollbarWidth: "none",
            }}
            onClick={() => openGallery()}
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
                  border: `2px solid ${COLORS.borderColor}`,
                }}
              />
            ))}
          </Flex>
          <Button
            size="small"
            onClick={() => openGallery()}
            style={{
              position: "absolute",
              bottom: 8,
              right: 16,
              borderRadius: 8,
              height: 24,
            }}
            type="primary"
          >
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.SUB_TEXT,
                fontWeight: 800,
                color: "white",
              }}
            >
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
        // gap between tab buttons (antd's default is 32px)
        tabBarGutter={24}
        style={{ padding: "0 8px", marginTop: 16, marginLeft: 0 }}
      />

      <Modal
        open={mediaModalOpen}
        onCancel={() => setMediaModalOpen(false)}
        footer={null}
        title=""
        width={900}
        destroyOnHidden
        styles={{
          // capped at 800px, or less on short screens so the modal never
          // runs off the viewport - the media list scrolls inside
          body: {
            maxHeight: "min(700px, calc(100vh - 120px))",
            overflowY: "auto",
            scrollbarWidth: "none",
          },
        }}
      >
        {/* destroyOnHidden remounts this each open, so initialTag applies */}
        <MediaTab lvnzyProject={lvnzyProject} initialTag={mediaInitialTag} />
      </Modal>

      <Tour
        open={tourOpen}
        onClose={() => {
          setTourOpen(false);
          localStorage.setItem(LocalStorageKeys.tour, "tour-done");
        }}
        steps={tourSteps}
      />
      </div>
    </Flex>
  );
}
