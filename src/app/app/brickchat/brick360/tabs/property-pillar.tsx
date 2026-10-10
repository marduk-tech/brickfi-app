"use client";

import { Brick360FontSize, useBrick360FontSize } from "../use-font-size";
import { Flex, Image, Typography } from "antd";
import moment from "moment";
import { forwardRef, useState } from "react";
import { BRICK360_CATEGORY, Brick360DataPoints } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { LvnzyProject } from "@/types/LvnzyProject";
import { PillarBase, PillarMapConfig, PillarProps } from "./pillar-base";
import { StatCard, StatCardRow, StatValue } from "./stat-card";

// --- property summary line (land area/units/size/floors/phases) - shown
// above the Property pillar's data points (moved from units-tab.tsx) ---
const getTotalFloors = (lvnzyProject: any, fs: Brick360FontSize) => {
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
          fontSize: fs.HEADING_2,
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

const getMinMaxSize = (configs: any[], fs: Brick360FontSize) => {
  let sizes: number[] = [];
  (configs || []).forEach((c: any) => {
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
          fontSize: fs.HEADING_2,
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

// An upcoming (not yet launched) project gets a different "no data" message
// than an older one that simply has no ratings.
const getNoDataPlaceholder = (lvnzyProject?: LvnzyProject) => {
  const expectedLaunchDate = (lvnzyProject as any)?.originalProjectId?.info
    ?.realTimeStatus?.expectedLaunchDate;
  const isLaunchInFuture =
    !!expectedLaunchDate &&
    moment(expectedLaunchDate).isValid() &&
    moment(expectedLaunchDate).isAfter(moment());
  return isLaunchInFuture
    ? Brick360DataPoints.property.futureProjectNoDataPlaceholder
    : Brick360DataPoints.property.oldProjectNoDataPlaceholder;
};

// Surroundings data point plots the project's surrounding elements (when
// any have geometry); nothing else in this pillar touches the map.
const getMapConfig = (
  dataPointKey: string,
  lvnzyProject: LvnzyProject,
): PillarMapConfig | null => {
  if (dataPointKey !== "surroundings") return null;
  const surrElements = (lvnzyProject as any).property?.surroundings;
  if (surrElements?.length && surrElements.some((e: any) => !!e.geometry)) {
    return { categories: [], drivers: [], surroundingElements: surrElements };
  }
  return null;
};

// height floor for an image card, in case it wraps onto a row of its own
// (it takes its height from the stat cards beside it otherwise)
const IMAGE_CARD_MIN_HEIGHT = 64;
// room under the row for the image cards' captions, which hang below the
// cards (outside the row's height) - see TaggedImageCard
const IMAGE_CARD_CAPTION_SPACE = 22;
const IMAGE_CARD_WIDTH = 150;

// Image cards shown alongside the stat cards - each covers every media image
// with its tag, previewed via antd's image preview.
const TAGGED_IMAGE_CARDS = [
  { tag: "layout", caption: "Masterplan" },
  { tag: "amenities", caption: "Amenities" },
];

const getTaggedImageUrls = (lvnzyProject: LvnzyProject, tag: string) =>
  (lvnzyProject.originalProjectId?.media || [])
    .filter(
      (m: any) =>
        m.type === "image" && m.image?.url && m.image?.tags?.includes(tag),
    )
    .map((m: any) => m.image.url as string);

// A stat-card-height image card showing the first of `urls`; clicking it
// opens antd's image preview over all of them (next/previous step through
// the rest). Stretched to the row's height so it matches the stat cards
// exactly - the image is absolutely positioned (its own size can't make the
// row taller), and the caption hangs just below the card, outside the row's
// height (the row reserves room - bottomSpace={IMAGE_CARD_CAPTION_SPACE}).
const TaggedImageCard = ({
  urls,
  caption,
}: {
  urls: string[];
  caption: string;
}) => {
  const fs = useBrick360FontSize();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  return (
    <div
      style={{
        position: "relative",
        alignSelf: "stretch",
        width: IMAGE_CARD_WIDTH,
        minHeight: IMAGE_CARD_MIN_HEIGHT,
        flexShrink: 0,
      }}
    >
      <div
        onClick={() => {
          setPreviewIndex(0);
          setPreviewOpen(true);
        }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 8,
          overflow: "hidden",
          border: `1px solid ${COLORS.borderColor}`,
          cursor: "pointer",
        }}
      >
        <img
          src={urls[0]}
          alt={caption}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
      <Flex
        align="center"
        gap={4}
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          marginTop: 2,
          whiteSpace: "nowrap",
        }}
      >
        <Typography.Text
          style={{
            fontSize: fs.HEADING_4,
            color: COLORS.textColorMedium,
          }}
        >
          {caption}
        </Typography.Text>
        {/* how many images the preview steps through */}
        <Flex
          align="center"
          justify="center"
          style={{
            minWidth: 18,
            height: 18,
            padding: "0 4px",
            borderRadius: 9,
            backgroundColor: COLORS.textColorMedium,
            color: "white",
            fontSize: FONT_SIZE.SUB_TEXT,
            fontWeight: 500,
            lineHeight: 1,
          }}
        >
          {urls.length}
        </Flex>
      </Flex>
      {/* items-only group: renders no thumbnails, just the preview overlay */}
      <Image.PreviewGroup
        items={urls}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          current: previewIndex,
          onChange: (current) => setPreviewIndex(current),
        }}
      />
    </div>
  );
};

const PropertyStats = ({ lvnzyProject }: { lvnzyProject?: LvnzyProject }) => {
  const fs = useBrick360FontSize();
  if (!lvnzyProject) return null;

  const imageCards = TAGGED_IMAGE_CARDS.map((c) => ({
    ...c,
    urls: getTaggedImageUrls(lvnzyProject, c.tag),
  })).filter((c) => c.urls.length);

  const unitSizesContent = getMinMaxSize(
    lvnzyProject.originalProjectId?.info.unitConfigWithPricing,
    fs,
  );
  const floorsContent =
    lvnzyProject.originalProjectId?.info.unitConfigWithPricing &&
    (lvnzyProject as any)?.meta.projectConfigurations.unitsBreakup
      ? getTotalFloors(lvnzyProject, fs)
      : null;
  const totalUnits = (lvnzyProject as any)?.property.layout.totalUnits;
  const totalPhases = (lvnzyProject as any)?.property.layout.totalPhases;

  return (
    <StatCardRow bottomSpace={imageCards.length ? IMAGE_CARD_CAPTION_SPACE : 0}>
      <StatCard label="SCALE">
        <StatValue>
          {Math.round(
            (lvnzyProject as any)?.property.layout.totalLandArea / 404.68564,
          ) / 10}{" "}
          Acre
        </StatValue>
        {totalUnits && <StatValue>· {totalUnits} Units</StatValue>}
        {totalPhases > 1 && <StatValue>· {totalPhases} Phases</StatValue>}
      </StatCard>

      {unitSizesContent && (
        <StatCard label="UNIT SIZES">
          <StatValue>{unitSizesContent}</StatValue>
        </StatCard>
      )}

      {floorsContent && (
        <StatCard label="FLOORS">
          <StatValue>{floorsContent}</StatValue>
        </StatCard>
      )}

      {imageCards.map((c) => (
        <TaggedImageCard key={c.tag} urls={c.urls} caption={c.caption} />
      ))}
    </StatCardRow>
  );
};

export const PropertyPillar = forwardRef<any, PillarProps>((props, ref) => (
  <PillarBase
    {...props}
    ref={ref}
    categoryKey={BRICK360_CATEGORY.property}
    header={<PropertyStats lvnzyProject={props.lvnzyProject} />}
    getMapConfig={getMapConfig}
    noDataPlaceholder={getNoDataPlaceholder(props.lvnzyProject)}
  />
));
PropertyPillar.displayName = "PropertyPillar";
