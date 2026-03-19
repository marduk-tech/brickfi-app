"use client";

import { AdminGuard } from "@/components/auth/admin-guard";
import { useFetchCorridors } from "@/hooks/use-corridors";
import { useDevice } from "@/hooks/use-device";
import { useFetchAllLvnzyProjects } from "@/hooks/use-lvnzy-project";
import { useFetchProjects } from "@/hooks/use-project";
import { ProjectHomeType } from "@/libs/constants";
import {
  capitalize,
  getMinMaxPrices,
  rupeeAmountFormat,
} from "@/libs/lvnzy-helper";
import { COLORS } from "@/theme/style-constants";
import { Project } from "@/types/Project";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Flex, Input, Select, Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

const MapViewV2 = dynamic(
  () => import("@/components/map-view-v2/map-view-v2"),
  { ssr: false },
);

const STATUS_FILTER = "data-verified,report-ready,report-verified";

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

function getProjectMinPrice(project: Project): number | null {
  const pricing = project.info?.unitConfigWithPricing;
  if (Array.isArray(pricing) && pricing.length > 0) {
    const prices = pricing.map((c: any) => c.price).filter((p: any) => p > 0);
    if (prices.length) return Math.min(...prices);
  }
  const minCost = project.info?.rate?.minimumUnitCost;
  if (minCost && minCost > 0) return minCost;
  return null;
}

function getProjectMaxPrice(project: Project): number | null {
  const pricing = project.info?.unitConfigWithPricing;
  if (Array.isArray(pricing) && pricing.length > 0) {
    const prices = pricing.map((c: any) => c.price).filter((p: any) => p > 0);
    if (prices.length) return Math.max(...prices);
  }
  return null;
}

// Resolve corridor names from IDs using corridors lookup
function getNearbyCorridors(
  project: Project,
  corridorMap: Map<string, string>,
): string[] {
  const corridors = project.info?.corridors;
  if (!Array.isArray(corridors)) return [];
  return corridors
    .filter((c) => c.haversineDistance <= 5)
    .map((c) => corridorMap.get(c.corridorId))
    .filter(Boolean) as string[];
}

export default function FindProjectsClient() {
  const { isMobile } = useDevice();
  const [searchText, setSearchText] = useState("");
  const [selectedHomeType, setSelectedHomeType] = useState<string>("apartment");
  const [selectedCorridors, setSelectedCorridors] = useState<string[]>([]);
  const [costRange, setCostRange] = useState<string | null>(null);
  const [completionYear, setCompletionYear] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(20);

  const { data: allProjects = [], isLoading } = useFetchProjects({
    homeType: selectedHomeType,
    statusFilter: STATUS_FILTER,
    searchKeyword: searchText.trim() || undefined,
  });
  const { data: corridors } = useFetchCorridors();
  const { data: allLvnzyProjects = [] } = useFetchAllLvnzyProjects(true);

  // Map corridorId coridorName for quick lookup
  const corridorMap = useMemo(() => {
    const map = new Map<string, string>();
    if (corridors) {
      corridors.forEach((c) => map.set(c._id, c.name));
    }
    return map;
  }, [corridors]);

  const selectedCorridorIds = useMemo(() => {
    if (!corridors || selectedCorridors.length === 0) return undefined;
    return corridors
      .filter((c) => selectedCorridors.includes(c.name))
      .map((c) => c._id);
  }, [corridors, selectedCorridors]);

  // Build corridor options from projects' corridor IDs joined with corridors data
  const corridorOptions = useMemo(() => {
    const names = new Set<string>();
    allProjects.forEach((p) => {
      const projCorridors = p.info?.corridors;
      if (Array.isArray(projCorridors)) {
        projCorridors.forEach((c) => {
          const name = corridorMap.get(c.corridorId);
          if (name) names.add(name);
        });
      }
    });
    return Array.from(names)
      .sort()
      .map((n) => ({ label: n, value: n }));
  }, [allProjects, corridorMap]);

  // map projectId to completion years from LvnzyProject data
  const completionYearMap = useMemo(() => {
    const map = new Map<string, string[]>();
    allLvnzyProjects.forEach((lp: any) => {
      const projectId = lp.originalProjectId?._id;
      if (!projectId) return;

      const phasesExtensions = (lp.developer?.reraOtherPhases || []).flatMap(
        (p: any) => p.projectDetails?.listOfRegistrationsExtensions || [],
      );
      const extensions =
        phasesExtensions.length > 0
          ? phasesExtensions
          : (lp.meta?.projectTimelines as any[]) || [];

      const years = extensions
        .map((ext: any) => moment(ext.completionDate, "DD-MM-YYYY"))
        .filter((d: any) => d.isValid())
        .map((d: any) => d.format("YYYY"));

      if (years.length > 0) map.set(projectId, [...(new Set(years) as any)]);
    });
    return map;
  }, [allLvnzyProjects]);

  const yearOptions = useMemo(() => {
    const allYears = new Set<string>();
    completionYearMap.forEach((years) => years.forEach((y) => allYears.add(y)));
    return Array.from(allYears)
      .sort()
      .map((y) => ({ label: y, value: y }));
  }, [completionYearMap]);

  // Apply filters
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      // Corridor filter
      if (selectedCorridors.length > 0) {
        const nearby = getNearbyCorridors(p, corridorMap);
        if (!selectedCorridors.some((sc) => nearby.includes(sc))) return false;
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
        const years = completionYearMap.get(p._id) || [];
        if (!years.includes(completionYear)) return false;
      }

      return true;
    });
  }, [
    allProjects,
    selectedCorridors,
    corridorMap,
    costRange,
    completionYear,
    completionYearMap,
  ]);

  // Map projects format
  const mapProjects = useMemo(() => {
    return filteredProjects
      .filter((p) => p.info?.location?.lat && p.info?.location?.lng)
      .map((p) => ({
        _id: p._id,
        info: {
          ...p.info,
          name: p.info?.name || p.metadata?.name,
        },
        media: p.media || [],
      }));
  }, [filteredProjects]);

  const columns: ColumnsType<Project> = [
    {
      title: "Name",
      key: "name",
      width: "30%",
      render: (_, record) => (
        <a
          href={`https://admin-livinzy.netlify.app/projects/${record._id}/edit`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: COLORS.primaryColor }}
        >
          {record.info?.name || record.metadata?.name || "Unnamed"}
        </a>
      ),
    },
    {
      title: "Home Types",
      key: "homeTypes",
      width: "20%",
      render: (_, record) => {
        const types = record.info?.homeType;
        if (Array.isArray(types) && types.length > 0) {
          return types.map((t: string) => (
            <Tag key={t} style={{ marginBottom: 2 }}>
              {capitalize(t)}
            </Tag>
          ));
        }
        const metaType = record.metadata?.homeType;
        if (metaType) {
          return <Tag style={{ marginBottom: 2 }}>{capitalize(metaType)}</Tag>;
        }
        return "-";
      },
    },
    {
      title: "Price",
      key: "price",
      width: "20%",
      render: (_, record) => {
        const pricing = record.info?.unitConfigWithPricing;
        if (Array.isArray(pricing) && pricing.length > 0) {
          const prices = pricing
            .map((c: any) => c.price)
            .filter((p: any) => p > 0);
          if (prices.length) return getMinMaxPrices(prices);
        }
        const minCost = record.info?.rate?.minimumUnitCost;
        if (minCost) return rupeeAmountFormat(minCost);
        return "-";
      },
    },
    {
      title: "Corridors",
      key: "corridors",
      width: "20%",
      render: (_, record) => {
        const nearby = getNearbyCorridors(record, corridorMap);
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
          href={`https://admin-livinzy.netlify.app/projects/${record._id}/edit`}
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
            placeholder="Home Type"
            options={HOME_TYPE_OPTIONS}
            value={selectedHomeType}
            onChange={setSelectedHomeType}
            style={{
              width: isMobile ? "calc(50% - 6px)" : undefined,
              minWidth: isMobile ? undefined : 160,
            }}
          />
          <Select
            placeholder="Completion Year"
            options={yearOptions}
            value={completionYear}
            onChange={setCompletionYear}
            style={{
              width: isMobile ? "calc(50% - 6px)" : undefined,
              minWidth: isMobile ? undefined : 160,
            }}
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
          <Select
            mode="multiple"
            placeholder="Corridors"
            options={corridorOptions}
            value={selectedCorridors}
            onChange={setSelectedCorridors}
            style={{
              width: isMobile ? "calc(50% - 6px)" : undefined,
              minWidth: isMobile ? undefined : 220,
            }}
            allowClear
            maxTagCount="responsive"
          />
        </Flex>

        <Typography.Text style={{ color: COLORS.textColorMedium }}>
          Showing {filteredProjects.length} projects
        </Typography.Text>

        {/* Table + Map */}
        <Flex
          vertical={isMobile}
          gap={16}
          style={{ minHeight: isMobile ? undefined : 600 }}
        >
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
          <div
            style={{
              flex: isMobile ? undefined : 1,
              height: isMobile ? 400 : undefined,
              minHeight: isMobile ? undefined : 600,
            }}
          >
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
