"use client";

import { Brick360Inline } from "@/app/app/brickchat/brick360/brick360-inline";
import type { PillarMapConfig } from "@/app/app/brickchat/brick360/tabs";
import { BrickMapChat } from "@/app/app/brickchat/brick-map-chat";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import LandingFooter from "@/custom-pages/landing/footer";
import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { LvnzyProject } from "@/types/LvnzyProject";
import { Button, Drawer, Flex, Spin, Typography } from "antd";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./brick360-public.module.css";

// LandingHeader is fixed to the top of the viewport at this height (see
// custom-pages/landing/header.tsx) - the page starts below it, and on mobile
// (where the whole page scrolls) the report's section nav sticks just under it.
// 74 = its compact 50px row + 12px padding above and below.
const HEADER_HEIGHT = 74;

export interface BreadcrumbItem {
  name: string;
  href?: string;
}

interface Brick360PublicClientProps {
  slug: string;
  project: LvnzyProject;
  breadcrumbs: BreadcrumbItem[];
}

// Public, server-rendered Brick360 report (/brick360/[slug]): the same
// Brick360Inline view brickchat shows, without the chat - every section is
// in the page HTML. On desktop the report scrolls in its own panel beside the
// map (same height, map loaded in the browser only); on mobile the page
// scrolls and the map opens in a drawer - both driven by the pillars'
// "See on Map" exactly as in brickchat. Questions about the project hand off
// to brickchat at /app/<slug>.
export default function Brick360PublicClient({
  slug,
  project,
  breadcrumbs,
}: Brick360PublicClientProps) {
  const { isMobile } = useDevice();
  const [pillarMapConfig, setPillarMapConfig] =
    useState<PillarMapConfig | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);

  // On mobile the "Ask" box sticks to the bottom of the screen - the floating
  // map button sits just above it, so it needs the box's current height.
  const askBoxRef = useRef<HTMLDivElement>(null);
  const [askBoxHeight, setAskBoxHeight] = useState(0);
  useEffect(() => {
    const box = askBoxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() =>
      setAskBoxHeight(box.offsetHeight)
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const projectName = project?.meta?.projectName || "this project";
  const askHref = `/app/${encodeURIComponent(slug)}`;

  // The map's script loads in the browser only, after the page - until it
  // has drawn, its (fixed-size) space shows a "Loading Maps" indicator. The
  // indicator sits underneath the map layer, so the map simply covers it
  // once it paints: nothing on the page moves.
  const map = (
    <div style={{ position: "relative", flex: 1, height: "100%" }}>
      <Flex
        vertical
        align="center"
        justify="center"
        gap={8}
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          backgroundColor: "#f4f3f0",
        }}
      >
        <Spin size="large" />
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_4,
            color: COLORS.textColorMedium,
          }}
        >
          Loading Maps
        </Typography.Text>
      </Flex>
      <Flex vertical style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        <BrickMapChat
          projects={[]}
          detailedProject={project}
          pillarMapConfig={pillarMapConfig}
        />
      </Flex>
    </div>
  );

  const breadcrumbNav = (
    <nav aria-label="Breadcrumb">
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          listStyle: "none",
          margin: 0,
          padding: "0 4px",
          fontSize: FONT_SIZE.SUB_TEXT,
          color: COLORS.textColorMedium,
        }}
      >
        {breadcrumbs.map((crumb, i) => (
          <li key={crumb.name} style={{ display: "flex", gap: 6 }}>
            {i > 0 ? <span aria-hidden>›</span> : null}
            {crumb.href ? (
              <Link href={crumb.href} style={{ color: COLORS.textColorMedium }}>
                {crumb.name}
              </Link>
            ) : (
              <span aria-current="page">{crumb.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <>
      <LandingHeader
        bgColor="white"
        logo="/images/brickfi-logo.png"
        color={COLORS.textColorDark}
        isMobile={isMobile}
        compact
      />

      {/* Desktop: breadcrumbs across the top, then two equal-height panes
          filling the rest of the viewport - the report (scrolling inside its
          own panel, the "Ask" box pinned under it) and the map. Mobile: one
          column that scrolls with the page. */}
      <main
        style={{
          // border-box: the header offset and padding count towards the
          // 100vh, so the panes end exactly at the bottom of the screen
          // instead of running into the footer
          boxSizing: "border-box",
          paddingTop: HEADER_HEIGHT,
          backgroundColor: "white",
          ...(isMobile ? { minHeight: "100vh" } : { height: "100vh" }),
        }}
      >
        <Flex
          vertical
          gap={isMobile ? 8 : 12}
          style={{
            boxSizing: "border-box",
            maxWidth: 1440,
            height: isMobile ? undefined : "100%",
            margin: "0 auto",
            padding: isMobile ? "8px 8px 32px" : "12px 24px 16px",
          }}
        >
          {/* {breadcrumbNav} */}

          <Flex
            gap={isMobile ? 0 : 24}
            align="stretch"
            style={isMobile ? undefined : { flex: 1, minHeight: 0 }}
          >
            {/* report column */}
            <Flex
              vertical
              gap={16}
              style={{ flex: 1, minWidth: 0, minHeight: 0 }}
            >
              {/* the report's own scroll area on desktop - its section nav
                sticks to the top of this, not under the site header */}
              <div
                className={isMobile ? undefined : styles.reportScroll}
                style={
                  isMobile
                    ? undefined
                    : {
                        flex: 1,
                        minHeight: 0,
                        overflowY: "auto",
                        borderRadius: 12,
                      }
                }
              >
                <Brick360Inline
                  slug={slug}
                  projectData={project}
                  stickyTop={isMobile ? HEADER_HEIGHT : 0}
                  onMapConfigChange={(config) => {
                    setPillarMapConfig(config);
                    // on mobile the map lives in a closed drawer - open it to
                    // actually show what "See on Map" picked
                    if (config && isMobile) setShowMobileMap(true);
                  }}
                />
              </div>

              {/* hand-off to brickchat for anything the report doesn't cover */}
              <Flex
                ref={askBoxRef}
                align={isMobile ? "center" : "center"}
                justify="space-between"
                gap={12}
                style={{
                  flexShrink: 0,
                  border: `1px solid ${COLORS.borderColorMedium}`,
                  borderRadius: 12,
                  padding: isMobile ? 8 : "12px 16px",
                  backgroundColor: "#f9f8f5",
                  // mobile: always in view, 16px above the bottom of the
                  // screen, while the report scrolls under it
                  ...(isMobile
                    ? {
                        position: "sticky",
                        bottom: 16,
                        zIndex: 5,
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                      }
                    : {}),
                }}
              >
                <Flex vertical gap={0}>
                  <Typography.Text
                    style={{ fontSize: FONT_SIZE.HEADING_4, fontWeight: 600 }}
                  >
                    Got a question ?
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.SUB_TEXT,
                      color: COLORS.textColorMedium,
                      lineHeight: "120%",
                    }}
                  >
                    Ask Brickfi AI anything about this project, or compare it
                    with others nearby.
                  </Typography.Text>
                </Flex>
                <Link href={askHref}>
                  <Button type="primary" size="small">
                    Ask Brickfi AI
                  </Button>
                </Link>
              </Flex>
            </Flex>

            {/* map column - desktop only; mobile gets the drawer below */}
            {!isMobile ? (
              <aside
                aria-label="Project map"
                style={{
                  width: "45%",
                  flexShrink: 0,
                  // same height as the report column (the row stretches both)
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `1px solid ${COLORS.borderColorMedium}`,
                  isolation: "isolate",
                }}
              >
                <Flex vertical style={{ position: "relative", height: "100%" }}>
                  {map}
                </Flex>
              </aside>
            ) : null}
          </Flex>
        </Flex>
      </main>

      {isMobile ? (
        <>
          {!showMobileMap ? (
            <Button
              aria-label="Open map"
              onClick={() => setShowMobileMap(true)}
              style={{
                position: "fixed",
                right: 16,
                // just above the sticky "Ask" box
                bottom: 16 + askBoxHeight + 12,
                width: 52,
                height: 52,
                borderRadius: 26,
                zIndex: 1001,
                backgroundColor: COLORS.textColorDark,
                borderColor: COLORS.textColorDark,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
              icon={
                <DynamicReactIcon
                  color="white"
                  iconName="FaMapLocationDot"
                  iconSet="fa6"
                  size={24}
                />
              }
            />
          ) : null}
          <Drawer
            placement="bottom"
            open={showMobileMap}
            onClose={() => setShowMobileMap(false)}
            closable={false}
            height="80vh"
            styles={{
              header: { display: "none" },
              body: { padding: 0, position: "relative", overflow: "hidden" },
              content: { borderTopLeftRadius: 20, borderTopRightRadius: 20 },
            }}
          >
            {/* close, top right of the map - inside the drawer so it slides
                up and down with it */}
            <Button
              aria-label="Close map"
              onClick={() => setShowMobileMap(false)}
              style={{
                position: "absolute",
                top: 16,
                right: 12,
                width: 40,
                height: 40,
                borderRadius: 20,
                touchAction: "manipulation",
                // above the map's own overlays (filter chips are 1000)
                zIndex: 1100,
                backgroundColor: COLORS.textColorDark,
                borderColor: COLORS.textColorDark,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
              icon={
                <DynamicReactIcon
                  color="white"
                  iconName="IoClose"
                  iconSet="io5"
                  size={22}
                />
              }
            />
            <Flex vertical style={{ position: "absolute", inset: 0 }}>
              {showMobileMap ? map : null}
            </Flex>
          </Drawer>
        </>
      ) : null}

      <LandingFooter />
    </>
  );
}
