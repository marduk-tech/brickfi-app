"use client";

import { useMemo, useState } from "react";
import { Flex, Input, Select, Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { SearchOutlined, EyeOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import moment from "moment";
import { useDevice } from "@/hooks/use-device";
import { AdminGuard } from "@/components/auth/admin-guard";
import { useFetchAllLvnzyProjects } from "@/hooks/use-lvnzy-project";
import { useFetchCorridors } from "@/hooks/use-corridors";
import {
  capitalize,
  getMinMaxPrices,
  rupeeAmountFormat,
} from "@/libs/lvnzy-helper";
import { ProjectHomeType } from "@/libs/constants";
import { COLORS } from "@/theme/style-constants";
import { LvnzyProject } from "@/types/LvnzyProject";

const MapViewV2 = dynamic(
  () => import("@/components/map-view-v2/map-view-v2"),
  { ssr: false }
);

const EXCLUDED_STATUSES = [
  "basic-details-ready",
  "data-populated",
  "disabled",
  "new",
];

const COST_RANGES = [
  { label: "Under 50 Lacs", value: "0-5000000" },
  { label: "50 Lacs - 1 Cr", value: "5000000-10000000" },
  { label: "1 Cr - 2 Cr", value: "10000000-20000000" },
  { label: "2 Cr - 5 Cr", value: "20000000-50000000" },
  { label: "5 Cr+", value: "50000000-Infinity" },
];

const HOME_TYPE_OPTIONS = Object.values(ProjectHomeType).map((t) => ({
  label: capitalize(t),
  value: t,
}));

function parseCostRange(val: string): [number, number] {
  const [min, max] = val.split("-");
  return [Number(min), max === "Infinity" ? Infinity : Number(max)];
}

function getProjectMinPrice(project: LvnzyProject): number | null {
  const pricing =
    project.originalProjectId?.info?.unitConfigWithPricing;
  if (Array.isArray(pricing) && pricing.length > 0) {
    const prices = pricing.map((c: any) => c.price).filter((p: any) => p > 0);
    if (prices.length) return Math.min(...prices);
  }
  const minCost = project.originalProjectId?.info?.rate?.minimumUnitCost;
  if (minCost && minCost > 0) return minCost;
  return null;
}

function getProjectMaxPrice(project: LvnzyProject): number | null {
  const pricing =
    project.originalProjectId?.info?.unitConfigWithPricing;
  if (Array.isArray(pricing) && pricing.length > 0) {
    const prices = pricing.map((c: any) => c.price).filter((p: any) => p > 0);
    if (prices.length) return Math.max(...prices);
  }
  return null;
}

function getCompletionYears(project: LvnzyProject): string[] {
  const timelines = project.meta?.projectTimelines;
  if (!Array.isArray(timelines)) return [];
  return timelines
    .map((t: any) => {
      const d = moment(t.completionDate, "DD-MM-YYYY");
      return d.isValid() ? d.format("YYYY") : null;
    })
    .filter(Boolean) as string[];
}

function getNearbyCorridors(project: LvnzyProject): string[] {
  const corridors = project.meta?.projectCorridors;
  if (!Array.isArray(corridors)) return [];
  return corridors
    .filter((c: any) => c.approxDistanceInKms <= 5)
    .map((c: any) => c.corridorName);
}

export default function FindProjectsClient() {
  const { isMobile } = useDevice();
  const [searchText, setSearchText] = useState("");
  const [selectedHomeTypes, setSelectedHomeTypes] = useState<string[]>([]);
  const [selectedCorridors, setSelectedCorridors] = useState<string[]>([]);
  const [costRange, setCostRange] = useState<string | null>(null);
  const [completionYear, setCompletionYear] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(20);

  const { data: allProjects = [], isLoading } =
    useFetchAllLvnzyProjects(true);
  const { data: corridors } = useFetchCorridors();

  const selectedCorridorIds = useMemo(() => {
    if (!corridors || selectedCorridors.length === 0) return undefined;
    return corridors
      .filter((c) => selectedCorridors.includes(c.name))
      .map((c) => c._id);
  }, [corridors, selectedCorridors]);

  // Extract filter options from data
  const corridorOptions = useMemo(() => {
    const names = new Set<string>();
    allProjects.forEach((p) => {
      const corridors = p.meta?.projectCorridors;
      if (Array.isArray(corridors)) {
        corridors.forEach((c: any) => {
          if (c.corridorName) names.add(c.corridorName);
        });
      }
    });
    return Array.from(names)
      .sort()
      .map((n) => ({ label: n, value: n }));
  }, [allProjects]);

  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    allProjects.forEach((p) => {
      getCompletionYears(p).forEach((y) => years.add(y));
    });
    return Array.from(years)
      .sort()
      .map((y) => ({ label: y, value: y }));
  }, [allProjects]);

  // Apply filters
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      // Status filter
      const status = p.originalProjectId?.info?.status;
      if (status && EXCLUDED_STATUSES.includes(status)) return false;

      // Name search
      if (searchText.trim()) {
        const name = (p.meta?.projectName || "").toLowerCase();
        if (!name.includes(searchText.toLowerCase())) return false;
      }

      // Home type filter
      if (selectedHomeTypes.length > 0) {
        const types = p.meta?.projectUnitTypes?.toLowerCase() || "";
        const homeTypeArr = p.originalProjectId?.info?.homeType || [];
        const allTypes = [...homeTypeArr, ...types.split(",").map((t: string) => t.trim().toLowerCase())];
        if (!selectedHomeTypes.some((ht) => allTypes.includes(ht))) return false;
      }

      // Corridor filter
      if (selectedCorridors.length > 0) {
        const corridors = p.meta?.projectCorridors;
        if (!Array.isArray(corridors)) return false;
        const names = corridors.map((c: any) => c.corridorName);
        if (!selectedCorridors.some((sc) => names.includes(sc))) return false;
      }

      // Cost filter
      if (costRange) {
        const [min, max] = parseCostRange(costRange);
        const minPrice = getProjectMinPrice(p);
        if (minPrice === null) return false;
        if (minPrice < min || minPrice >= max) return false;
      }

      // Completion year filter
      if (completionYear) {
        const years = getCompletionYears(p);
        if (!years.includes(completionYear)) return false;
      }

      return true;
    });
  }, [
    allProjects,
    searchText,
    selectedHomeTypes,
    selectedCorridors,
    costRange,
    completionYear,
  ]);

  // Map projects to the format MapViewV2 expects
  const mapProjects = useMemo(() => {
    return filteredProjects
      .filter(
        (p) =>
          p.originalProjectId?.info?.location?.lat &&
          p.originalProjectId?.info?.location?.lng
      )
      .map((p) => ({
        _id: p.originalProjectId?._id || p._id,
        info: {
          ...p.originalProjectId?.info,
          name: p.meta?.projectName || p.originalProjectId?.info?.name,
        },
        media: p.originalProjectId?.media || [],
      }));
  }, [filteredProjects]);

  const columns: ColumnsType<LvnzyProject> = [
    {
      title: "Name",
      key: "name",
      width: "30%",
      render: (_, record) => (
        <a
          href={`/app/brick360/${record.slug || record._id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.primaryColor }}
        >
          {record.meta?.projectName || "Unnamed"}
        </a>
      ),
    },
    {
      title: "Home Types",
      key: "homeTypes",
      width: "20%",
      render: (_, record) => {
        const types = record.meta?.projectUnitTypes;
        if (!types) return "-";
        return types
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
          .map((t: string) => (
            <Tag key={t} style={{ marginBottom: 2 }}>
              {capitalize(t)}
            </Tag>
          ));
      },
    },
    {
      title: "Price",
      key: "price",
      width: "20%",
      render: (_, record) => {
        const pricing =
          record.originalProjectId?.info?.unitConfigWithPricing;
        if (Array.isArray(pricing) && pricing.length > 0) {
          const prices = pricing
            .map((c: any) => c.price)
            .filter((p: any) => p > 0);
          if (prices.length) return getMinMaxPrices(prices);
        }
        const minCost =
          record.originalProjectId?.info?.rate?.minimumUnitCost;
        if (minCost) return rupeeAmountFormat(minCost);
        return "-";
      },
    },
    {
      title: "Corridors",
      key: "corridors",
      width: "20%",
      render: (_, record) => {
        const nearby = getNearbyCorridors(record);
        if (!nearby.length) return "-";
        return nearby.map((name) => (
          <Tag key={name} style={{ marginBottom: 2 }}>
            {name}
          </Tag>
        ));
      },
    },
    {
      title: "",
      key: "view",
      width: "10%",
      render: (_, record) => (
        <a
          href={`/app/brick360/${record.slug || record._id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.textColorMedium }}
        >
          <EyeOutlined style={{ fontSize: 18 }} />
        </a>
      ),
    },
  ];

  return (
    <AdminGuard>
      <Flex vertical gap={16} style={{ padding: isMobile ? 16 : 24 }}>
        <Typography.Title level={3}>Find Projects</Typography.Title>

        {/* Filter bar */}
        <Flex gap={12} wrap="wrap">
          <Input
            placeholder="Search by name..."
            prefix={
              <SearchOutlined style={{ color: COLORS.textColorMedium }} />
            }
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: isMobile ? "100%" : 240 }}
            allowClear
          />
          <Select
            mode="multiple"
            placeholder="Unit Types"
            options={HOME_TYPE_OPTIONS}
            value={selectedHomeTypes}
            onChange={setSelectedHomeTypes}
            style={{ width: isMobile ? "calc(50% - 6px)" : undefined, minWidth: isMobile ? undefined : 160 }}
            allowClear
            maxTagCount="responsive"
          />
          <Select
            mode="multiple"
            placeholder="Corridors"
            options={corridorOptions}
            value={selectedCorridors}
            onChange={setSelectedCorridors}
            style={{ width: isMobile ? "calc(50% - 6px)" : undefined, minWidth: isMobile ? undefined : 160 }}
            allowClear
            maxTagCount="responsive"
          />
          <Select
            placeholder="Completion Year"
            options={yearOptions}
            value={completionYear}
            onChange={setCompletionYear}
            style={{ width: isMobile ? "calc(50% - 6px)" : 150 }}
            allowClear
          />
          <Select
            placeholder="Cost Range"
            options={COST_RANGES}
            value={costRange}
            onChange={setCostRange}
            style={{ width: isMobile ? "calc(50% - 6px)" : 170 }}
            allowClear
          />
        </Flex>

        <Typography.Text style={{ color: COLORS.textColorMedium }}>
          Showing {filteredProjects.length} projects
        </Typography.Text>

        {/* Table + Map */}
        <Flex vertical={isMobile} gap={16} style={{ minHeight: isMobile ? undefined : 600 }}>
          <div style={{ flex: 1, overflow: "auto" }}>
            <Table
              dataSource={filteredProjects}
              columns={columns}
              rowKey="_id"
              loading={isLoading}
              size="small"
              pagination={{
                pageSize,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
                onShowSizeChange: (_, size) => setPageSize(size),
              }}
            />
          </div>
          <div style={{ flex: isMobile ? undefined : 1, height: isMobile ? 400 : undefined, minHeight: isMobile ? undefined : 600 }}>
            <MapViewV2
              projects={mapProjects}
              fullSize={false}
              showLocalities={false}
              hideAllFilters={true}
              minMapZoom={10}
              showCorridors={selectedCorridors.length > 0}
              corridorIds={selectedCorridorIds}
            />
          </div>
        </Flex>
      </Flex>
    </AdminGuard>
  );
}
