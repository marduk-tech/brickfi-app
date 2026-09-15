import { Flex, Typography } from "antd";
import dynamic from "next/dynamic";
import { getPercentile } from "../../libs/stats";
import { COLORS } from "../../theme/style-constants";

const ColumnChart = dynamic(
  () => import("@ant-design/plots").then((m) => m.Column),
  { ssr: false },
);

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

interface QuartileHistogramProps {
  values: { value: number; label: string }[];
  step: number;
  formatBucket: (bucket: number) => string;
  title: string;

  unitNoun: string;
}

export function QuartileHistogram({
  values,
  step,
  formatBucket,
  title,
  unitNoun,
}: QuartileHistogramProps) {
  if (values.length < 2) return null;

  const sorted = values.map((v) => v.value).sort((a, b) => a - b);
  const q1 = getPercentile(sorted, 25);
  const q3 = getPercentile(sorted, 75);

  const bucketMap = new Map<number, { count: number; labels: string[] }>();
  values.forEach((v) => {
    const bucket = Math.round(v.value / step) * step;
    const existing = bucketMap.get(bucket) || { count: 0, labels: [] };
    bucketMap.set(bucket, {
      count: existing.count + 1,
      labels: [...existing.labels, v.label],
    });
  });

  const data = Array.from(bucketMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucket, { count, labels }]) => ({
      label: formatBucket(bucket),
      count,
      labels,
      inRange: bucket <= q3 && bucket + step > q1,
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
          name: unitNoun,
          value: datum.count,
          marker: false,
          labels: datum.labels,
          count: datum.count,
        }),
      ],
    },
    interaction: {
      tooltip: {
        render: (_event: any, { items, title }: any) => {
          const item = items?.[0];
          if (!item) return "";
          const names: string[] = item.labels || [];
          const tagStyle =
            "display:inline-block;padding:0 7px;font-size:11px;line-height:20px;" +
            "border:1px solid #d9d9d9;border-radius:4px;background:rgba(0,0,0,0.02);margin:2px 2px 0 0";
          const tagsHtml = names
            .slice(0, 5)
            .map((n) => `<span style="${tagStyle}">${escapeHtml(n)}</span>`)
            .join("");
          const moreHtml =
            names.length > 5
              ? `<span style="${tagStyle}">+${names.length - 5} more</span>`
              : "";
          return `<div style="padding:8px 12px;min-width:160px">
          <div style="margin-bottom:6px;font-weight:500; font-size: 24px;">${title}</div>
            <div style="margin-bottom:6px;font-weight:500;color:#999;"> ${item.count} ${unitNoun}${item.count !== 1 ? "s" : ""}</div>
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
        {title}
      </Typography.Text>
      <ColumnChart {...(config as any)} />
    </Flex>
  );
}
