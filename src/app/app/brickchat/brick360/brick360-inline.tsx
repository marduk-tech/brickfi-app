"use client";

import { useBrick360FontSize } from "./use-font-size";
import { Button, Flex, Modal, Typography } from "antd";
import { useEffect, useRef, useState } from "react";
import { useFetchLvnzyProjectBySlug } from "@/hooks/use-lvnzy-project";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";

import { BRICK360_CATEGORY, Brick360CategoryInfo } from "@/libs/constants";
import { getCategoryScore } from "@/libs/lvnzy-helper";
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
  /**
   * Closes this view and returns to the underlying brickchat conversation.
   * Omitted on the standalone brick360 page (see brick360-v2.tsx), which
   * has nothing to close back to - the close button is hidden then.
   */
  onClose?: () => void;
  /** Forwarded from the pillar tabs - see tabs/pillar-base.tsx and brick-map-chat.tsx. */
  onMapConfigChange?: (config: PillarMapConfig | null) => void;
  /**
   * Distance from the top of the scroll area at which the section nav sticks
   * - the height of anything fixed above it (e.g. the site header on the
   * public /brick360/[slug] page). 0 inside brickchat's chat list.
   */
  stickyTop?: number;
}

// Inline, brickchat-embedded variant of Brick360v2 (see
// components/brick-360/brick360-v2.tsx) - same tabs/data, two differences:
// - every tab's content is rendered at once, stacked vertically as titled
//   sections (so the whole report is in the HTML - see the public
//   /brick360/[slug] page). The tab row is a sticky section nav: a click
//   scrolls its section into view, and scrolling highlights the section
//   currently under the bar.
// - the Map tab is dropped entirely. Map-view duties are handled by
//   BrickMapChat, which brickchat-client already keeps mounted alongside
//   this component and re-initializes with this same project's connectivity
//   data instead of spinning up a second map instance.
export function Brick360Inline({
  slug,
  projectData,
  onClose,
  onMapConfigChange,
  stickyTop = 0,
}: Brick360InlineProps) {
  const [isClosing, setIsClosing] = useState(false);
  const handleClose = () => {
    if (!onClose) return;
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
  const fs = useBrick360FontSize();

  const { data: fetchedProject } = useFetchLvnzyProjectBySlug(
    slug,
    !projectData,
  );
  const lvnzyProject = projectData || fetchedProject;


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

  // The tab bar is our own natively scrolling row (antd's tab bar scrolls by
  // a transform it recalculates on every change, only ever just far enough
  // to reveal a tab, so it can't centre one). Whenever the selected tab
  // changes - a click, or the initial pick once the project loads - scroll
  // it to the middle of the bar.
  const tabBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const bar = tabBarRef.current;
    const tab = bar?.querySelector<HTMLElement>(
      `[data-tab-key="${selectedTabKey}"]`,
    );
    if (!bar || !tab) return;
    // offsetLeft is relative to the bar (it's position: relative), and
    // scrollTo clamps to the ends, so the first/last tabs just sit at the edge
    bar.scrollTo({
      left: tab.offsetLeft - (bar.clientWidth - tab.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [selectedTabKey]);

  // --- section nav: click to scroll, scroll to highlight ---
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  // the sticky bar's height - sections keep this much clear (scroll-margin)
  // so their titles don't land underneath it
  const [tabBarHeight, setTabBarHeight] = useState(0);
  useEffect(() => {
    const bar = tabBarRef.current;
    if (!bar) return;
    const observer = new ResizeObserver(() =>
      setTabBarHeight(bar.offsetHeight),
    );
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  // While a click's smooth scroll is running, the scroll-spy below would
  // highlight every section it passes - so it's paused until scrolling has
  // been idle for SPY_RESUME_MS (or SPY_MAX_PAUSE_MS, if the section was
  // already in view and nothing scrolled at all).
  const spyPaused = useRef(false);
  const spyResumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const SPY_RESUME_MS = 150;
  const SPY_MAX_PAUSE_MS = 1500;

  const sectionKeys = tabButtons.map((t) => t.key).join(",");
  useEffect(() => {
    if (!lvnzyProject) return;
    const keys = sectionKeys.split(",");
    let frame = 0;
    // the active section = the last one whose top has reached the bar's
    // bottom edge. Listens in the capture phase on document, since the
    // element that actually scrolls is an ancestor (brickchat's chat list,
    // or the page) and scroll events don't bubble.
    const updateActive = () => {
      frame = 0;
      const bar = tabBarRef.current;
      if (!bar) return;
      const line = bar.getBoundingClientRect().bottom + 8;
      let active = keys[0];
      for (const key of keys) {
        const el = sectionRefs.current[key];
        if (el && el.getBoundingClientRect().top <= line) active = key;
      }
      setSelectedTabKey(active);
    };
    const onScroll = () => {
      if (spyPaused.current) {
        clearTimeout(spyResumeTimer.current);
        spyResumeTimer.current = setTimeout(() => {
          spyPaused.current = false;
        }, SPY_RESUME_MS);
        return;
      }
      if (!frame) frame = requestAnimationFrame(updateActive);
    };
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKeys, !!lvnzyProject]);

  useEffect(() => () => clearTimeout(spyResumeTimer.current), []);

  const handleTabChange = (key: string) => {
    setSelectedTabKey(key);
    spyPaused.current = true;
    clearTimeout(spyResumeTimer.current);
    spyResumeTimer.current = setTimeout(() => {
      spyPaused.current = false;
    }, SPY_MAX_PAUSE_MS);
    sectionRefs.current[key]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const tabItems = tabButtons.map((tab) => {
    const isActive = selectedTabKey === tab.key;
    const categoryScore = PILLAR_KEYS.includes(tab.key)
      ? (lvnzyProject?.score as any)?.[tab.key]
      : undefined;
    return {
      key: tab.key,
      title: tab.label,
      iconName: tab.iconName,
      iconSet: tab.iconSet,
      categoryScore,
      label: (
        <Flex
          align="center"
          gap={4}
          style={{
            padding:
              isActive && selectedTabKey !== HIGHLIGHTS_TAB_KEY && categoryScore
                ? "0px 0 0px 8px"
                : "2px 8px",
          }}
          vertical
        >
          <Flex align="center" gap={6} style={{}}>
            <Flex style={{backgroundColor: isActive ? COLORS.primaryColor: 'transparent',border: isActive ? `1px solid ${isActive ? COLORS.primaryColor: COLORS.textColorDark}`: 0, padding: 6, borderRadius: "12px"}}>
            <DynamicReactIcon
              iconName={tab.iconName}
              iconSet={tab.iconSet}
              color={isActive? "white": COLORS.textColorDark}
              size={isMobile ? 24: 24}
            ></DynamicReactIcon>
            </Flex>
          </Flex>
          <Flex align="center" gap={4}>
            <Typography.Text
              style={{
                // the selected tab's label is bolder and 10% larger
                fontSize: isActive ? fs.HEADING_4 * 1.25 : fs.HEADING_4 * 1.2,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? COLORS.primaryColor : COLORS.textColorMedium,
              }}
            >
              {tab.label}
            </Typography.Text>
            {categoryScore ? (
              <GradientBar
                value={getCategoryScore(categoryScore)}
                showBadgeOnly
              ></GradientBar>
            ) : null}
          </Flex>
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
        // clip, not hidden: overflow hidden would make this box a scroll
        // container and break the sticky tab bar below
        overflowX: "clip",
        width: "100%",
        border: `1.5px solid ${COLORS.LANDING.MEDIUM_PINK}`,
        backgroundColor:"#f9f8f5",
        borderRadius: 12,
        padding: isMobile ? "8px 4px" : "8px 4px",
        opacity: isClosing ? 0 : 1,
        transition: `opacity ${CLOSE_FADE_MS}ms ease`,
        position: "relative",
        minHeight: 500
      }}
    >
      {onClose ? (
        <Flex
          justify="flex-end"
          style={{ position: "absolute", right: 0, top: 0 }}
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
      ) : null}
   {previewImages.length ? (
        <div
          style={{
            // 36px clears the close button (top right) when there is one;
            // without it the strip starts at the container's 8px padding
            margin: onClose ? "36px 0 16px 0" : "0 0 16px 0",
            padding: "0 8px 0",
            position: "relative",
          }}
        >
          <Flex
            gap={8}
            style={{
              width: "100%",
              height: isMobile ? 150: 150,
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
                  border: `1px solid ${COLORS.borderColorMedium}`,
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
      <ProjectHeader lvnzyProject={lvnzyProject} />

   

      {/* section nav - sticky at the top of whatever scrolls this view; see
          tabBarRef above for why it isn't antd's tab bar */}
      <nav
        ref={tabBarRef}
        aria-label="Report sections"
        className={styles.tabBar}
        style={{
          top: stickyTop,
          // shadow along the bottom edge, fading upwards into the bar
          boxShadow: "inset 0 -4px 4px -4px rgba(0, 0, 0, 0.15)",
          marginBottom: 16,
          marginTop: 16,
        }}
      >
        {tabItems.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-current={item.key === selectedTabKey ? "true" : undefined}
            aria-controls={`brick360-section-${item.key}`}
            data-tab-key={item.key}
            className={styles.tabButton}
            onClick={() => handleTabChange(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* every tab's content, stacked - each under its own title */}
      <Flex vertical gap={40} style={{ padding: "0 8px" }}>
        {tabItems.map((item) => (
          <section
            key={item.key}
            id={`brick360-section-${item.key}`}
            data-section-key={item.key}
            ref={(el) => {
              sectionRefs.current[item.key] = el;
            }}
            style={{ scrollMarginTop: stickyTop + tabBarHeight + 8 }}
          >
            <Flex
              align="center"
              gap={8}
              className={styles.sectionHeader}
            >
              {/* <DynamicReactIcon
                iconName={item.iconName}
                iconSet={item.iconSet}
                color={COLORS.primaryColor}
                size={22}
              ></DynamicReactIcon> */}
              <Typography.Title
                level={2}
                style={{
                  margin: 0,
                  fontSize: isMobile ? FONT_SIZE.HEADING_1 * .8: FONT_SIZE.HEADING_1 * .8,
                  fontWeight: 300,
                  color: COLORS.textColorDark,
                }}
              >
                {item.title}
              </Typography.Title>
              {item.categoryScore ? (
                <GradientBar
                  value={getCategoryScore(item.categoryScore)}
                  showSmileyOnly
                  smileySize={isMobile ? 24: 28}
                ></GradientBar>
              ) : null}
            </Flex>
            {item.children}
          </section>
        ))}
      </Flex>

      <Modal
        open={mediaModalOpen}
        onCancel={() => setMediaModalOpen(false)}
        footer={null}
        title=""
        width={900}
        // 50px from the top of the viewport (antd's default is 100px)
        style={{ top: 50 }}
        destroyOnHidden
        styles={{
          // capped at 800px, or less on short screens so the modal never
          // runs off the viewport - the media list scrolls inside
          body: {
            maxHeight: "min(600px, calc(100vh - 125px))",
            overflowY: "auto",
            scrollbarWidth: "none",
          },
        }}
      >
        {/* destroyOnHidden remounts this each open, so initialTag applies */}
        <MediaTab lvnzyProject={lvnzyProject} initialTag={mediaInitialTag} />
      </Modal>
    </Flex>
  );
}
