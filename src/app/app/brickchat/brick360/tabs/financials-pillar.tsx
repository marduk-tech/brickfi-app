"use client";

import { Flex, Modal, Typography } from "antd";
import dynamic from "next/dynamic";
import { forwardRef, useState } from "react";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { BRICK360_CATEGORY } from "@/libs/constants";
import { thsndFormat } from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { LvnzyProject } from "@/types/LvnzyProject";
import {
  PillarBase,
  PillarMapConfig,
  PillarProps,
  driversOfCategories,
} from "./pillar-base";
import {
  STAT_CARD_NOTE_SPACE,
  StatCard,
  StatCardRow,
  StatValue,
} from "./stat-card";

const ColumnChart = dynamic(
  () => import("@ant-design/plots").then((m) => m.Column),
  { ssr: false },
);

// --- price quartile chart, opened from the Typical Price Range stat card ---
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
    height: 225,
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
        style={{ fontSize: 11, color: "#8c8c8c", marginBottom: 4 }}
      >
        Price Point Distribution
      </Typography.Text>
      <ColumnChart {...(config as any)} />
    </Flex>
  );
}

const corridorPricing = (lvnzyProject?: LvnzyProject) =>
  (lvnzyProject?.investment?.corridorPricing || []).filter(
    (p: any) => !!p.sqftCost,
  );

// Growth Potential plots growth drivers; Price Point plots nearby projects'
// pricing - nothing else in this pillar touches the map.
const getMapConfig = (
  dataPointKey: string,
  lvnzyProject: LvnzyProject,
): PillarMapConfig | null => {
  if (dataPointKey === "growthPotential") {
    const categories = ["growth potential"];
    return {
      categories,
      drivers: driversOfCategories(lvnzyProject, categories),
    };
  }
  if (dataPointKey === "pricePoint") {
    return {
      categories: [],
      drivers: [],
      projectsNearby: corridorPricing(lvnzyProject),
    };
  }
  return null;
};

// Typical (interquartile, 25th-75th percentile) price per sq.ft across the
// nearby projects in corridorPricing - the same band PriceQuartileChart
// highlights. Needs at least 2 projects, like the chart itself.
const getTypicalPriceRange = (lvnzyProject?: LvnzyProject) => {
  const costs = corridorPricing(lvnzyProject)
    .map((p: any) => p.sqftCost)
    .sort((a: number, b: number) => a - b);
  if (costs.length < 2) return null;
  const roundTo25 = (v: number) => Math.round(v / 25) * 25;
  return {
    low: roundTo25(getPercentile(costs, 25)),
    high: roundTo25(getPercentile(costs, 75)),
  };
};

const RupeeIcon = () => (
  <DynamicReactIcon
    iconName="FaIndianRupeeSign"
    iconSet="fa6"
    size={18}
    color={COLORS.textColorMedium}
  ></DynamicReactIcon>
);

const FinancialStats = ({ lvnzyProject }: { lvnzyProject?: LvnzyProject }) => {
  const [chartOpen, setChartOpen] = useState(false);
  const typicalRange = getTypicalPriceRange(lvnzyProject);

  return (
    <>
      <StatCardRow bottomSpace={typicalRange ? STAT_CARD_NOTE_SPACE : 0}>
        <StatCard label="AVG. SQUARE FOOT PRICE">
          {lvnzyProject?.meta.costingDetails && (
            <Flex gap={1} align="center">
              <RupeeIcon />
              <StatValue>
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
              </StatValue>
            </Flex>
          )}
        </StatCard>

        {typicalRange && (
          <StatCard
            label="CORRIDOR PRICE RANGE"
            note="Click to see chart*"
            onClick={() => setChartOpen(true)}
          >
            <RupeeIcon />
            <StatValue>
              {thsndFormat(`${typicalRange.low}`)} -{" "}
              {thsndFormat(`${typicalRange.high}`)}
            </StatValue>
            <DynamicReactIcon color={COLORS.textColorMedium} size={24} iconName="MdBarChart" iconSet="md"></DynamicReactIcon>
          </StatCard>
        )}
      </StatCardRow>

      <Modal
        open={chartOpen}
        onCancel={() => setChartOpen(false)}
        footer={null}
        title="Corridor Price Point Distribution"
        width={760}
        destroyOnHidden
      >
        <PriceQuartileChart pricingData={corridorPricing(lvnzyProject)} />
      </Modal>
    </>
  );
};

export const FinancialsPillar = forwardRef<any, PillarProps>((props, ref) => (
  <PillarBase
    {...props}
    ref={ref}
    categoryKey={BRICK360_CATEGORY.financials}
    header={<FinancialStats lvnzyProject={props.lvnzyProject} />}
    getMapConfig={getMapConfig}
  />
));
FinancialsPillar.displayName = "FinancialsPillar";
