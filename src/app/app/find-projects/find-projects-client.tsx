"use client";

import { AdminGuard } from "@/components/auth/admin-guard";
import DynamicReactIcon, {
  IconSetKey,
} from "@/components/common/dynamic-react-icon";
import { Loader } from "@/components/common/loader";
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
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Project } from "@/types/Project";
import { EyeOutlined, SearchOutlined } from "@ant-design/icons";
import { Flex, Input, Select, Table, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import moment from "moment";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { FaRegNewspaper } from "react-icons/fa";
import { TbView360Number } from "react-icons/tb";

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

const HOME_TYPE_ICON: Record<string, { set: IconSetKey; name: string }> = {
  apartment: { set: "pi", name: "PiBuildingApartment" },
  villament: { set: "pi", name: "PiBuildingApartment" },
  penthouse: { set: "pi", name: "PiBuildingApartment" },
  villa: { set: "md", name: "MdOutlineVilla" },
  rowhouse: { set: "md", name: "MdHomeWork" },
  plot: { set: "lu", name: "LuLandPlot" },
};

const HOME_TYPE_OPTIONS = Object.values(ProjectHomeType).map((t) => {
  const icon = HOME_TYPE_ICON[t];
  return {
    value: t,
    label: (
      <Flex align="center" gap={6}>
        {icon && (
          <DynamicReactIcon
            iconSet={icon.set}
            iconName={icon.name}
            size={16}
          />
        )}
        <span>{capitalize(t)}</span>
      </Flex>
    ),
  };
});

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
    .filter((c) => c.haversineDistance <= 14)
    .map((c) => corridorMap.get(c.corridorId))
    .filter(Boolean) as string[];
}

export default function FindProjectsClient() {
  const { isMobile } = useDevice();
  const [searchText, setSearchText] = useState("");
  const [selectedHomeType, setSelectedHomeType] = useState<string[]>([
    "apartment",
  ]);
  const [selectedCorridors, setSelectedCorridors] = useState<string[]>([]);
  const [costRanges, setCostRanges] = useState<string[]>([]);
  const [completionYears, setCompletionYears] = useState<string[]>([]);
  const mapRef = useRef<any>(null);
  const handleMapReady = useCallback((map: any) => {
    mapRef.current = map;
  }, []);
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

  // map projectId to completion years from All Projects data
  const completionYearMap = useMemo(() => {
    const map = new Map<string, string[]>();
    allProjects.forEach((op: any) => {
      const projectId = op._id;
      if (!projectId) return;
      let projectTimelines =
        op.info?.reraProjectId?.projectDetails?.listOfRegistrationsExtensions;

      if (projectTimelines) {
        const years = projectTimelines
          .map((ext: any) => moment(ext.completionDate, "DD-MM-YYYY"))
          .filter((d: any) => d.isValid())
          .map((d: any) => d.format("YYYY"));

        if (years.length > 0) map.set(projectId, [...(new Set(years) as any)]);
      }
    });
    return map;
  }, [allProjects, allLvnzyProjects]);

  // map projectId to lvnzyProject slug for Brick360 links
  const lvnzySlugMap = useMemo(() => {
    const map = new Map<string, string>();
    allLvnzyProjects.forEach((lp: any) => {
      const projectId = lp.originalProjectId?._id;
      if (projectId && lp.slug) map.set(projectId, lp.slug);
    });
    return map;
  }, [allLvnzyProjects]);

  const yearOptions = useMemo(() => {
    // const allYears = new Set<string>();
    // completionYearMap.forEach((years) => years.forEach((y) => allYears.add(y)));
    const yearsAll = [];
    let yr = 2015;
    while (yr <= 2035) {
      yearsAll.push(`${yr}`);
      yr++;
    }
    return yearsAll.sort().map((y) => ({ label: y, value: y }));
  }, []);

  // Apply filters
  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      // Corridor filter
      if (selectedCorridors.length > 0) {
        const nearby = getNearbyCorridors(p, corridorMap);
        if (!selectedCorridors.some((sc) => nearby.includes(sc))) return false;
      }

      // Cost filter (multi-select: match ANY selected range)
      if (costRanges.length > 0) {
        const minPrice = getProjectMinPrice(p);
        if (minPrice === null) return false;
        const matchesAny = costRanges.some((range) => {
          const [min, max] = parseCostRange(range);
          return minPrice >= min && minPrice < max;
        });
        if (!matchesAny) return false;
      }

      // Completion year filter (multi-select: match ANY selected year)
      if (completionYears.length > 0) {
        const years = completionYearMap.get(p._id) || [];
        if (!completionYears.some((y) => years.includes(y))) return false;
      }

      return true;
    });
  }, [
    allProjects,
    selectedCorridors,
    corridorMap,
    costRanges,
    completionYears,
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
        slug: lvnzySlugMap.get(p._id)
      }));
  }, [filteredProjects]);

  const columns: ColumnsType<Project> = [
    {
      title: "Name",
      key: "name",
      width: "30%",
      render: (_, record) => (
        <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
          {record.info?.name || record.metadata?.name || "Unnamed"}
        </Typography.Text>
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
            <Tag
              key={t}
              style={{
                marginBottom: 2,
                fontSize: FONT_SIZE.SUB_TEXT,
                padding: "0 3px",
              }}
            >
              {capitalize(t)}
            </Tag>
          ));
        }
        const metaType = record.metadata?.homeType;
        if (metaType) {
          return (
            <Tag style={{ marginBottom: 2, fontSize: FONT_SIZE.SUB_TEXT }}>
              {capitalize(metaType)}
            </Tag>
          );
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
          if (prices.length)
            return (
              <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
                {getMinMaxPrices(prices)}
              </Typography.Text>
            );
        }
        const minCost = record.info?.rate?.minimumUnitCost;
        if (minCost)
          return (
            <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
              {rupeeAmountFormat(minCost)}
            </Typography.Text>
          );
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
          <Tag
            key={name}
            style={{
              marginBottom: 2,
              fontSize: FONT_SIZE.SUB_TEXT,
              padding: "0px 2px",
            }}
          >
            {name}
          </Tag>
        ));
      },
    },
    {
      title: "",
      key: "actions",
      width: "12%",
      render: (_, record) => {
        const hasLocation =
          record.info?.location?.lat && record.info?.location?.lng;
        const slug = lvnzySlugMap.get(record._id);
        return (
          <Flex gap={8} align="center">
            {hasLocation && (
              <EyeOutlined
                style={{
                  fontSize: 16,
                  color: COLORS.textColorMedium,
                  cursor: "pointer",
                }}
                onClick={() => {
                  const { lat, lng } = record.info!.location!;
                  mapRef.current?.setView([lat, lng], 16);
                }}
              />
            )}
            <a
              href={`https://admin-livinzy.netlify.app/projects/${record._id}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.textColorMedium, display: "flex" }}
            >
              <FaRegNewspaper style={{ fontSize: 16 }} />
            </a>
            {slug && (
              <a
                href={`/app/brick360/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: COLORS.textColorMedium, display: "flex" }}
              >
                <TbView360Number style={{ fontSize: 18 }} />
              </a>
            )}
          </Flex>
        );
      },
    },
  ];

  return (
    <AdminGuard>
      <Flex vertical gap={16} style={{ padding: 8 }}>
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
            placeholder="Home Type"
            options={HOME_TYPE_OPTIONS}
            value={selectedHomeType}
            onChange={setSelectedHomeType}
            allowClear
            maxTagCount="responsive"
            style={{
              width: isMobile ? "calc(50% - 6px)" : undefined,
              minWidth: isMobile ? undefined : 160,
            }}
          />
          <Select
            mode="multiple"
            placeholder="Completion Year"
            options={yearOptions}
            value={completionYears}
            onChange={setCompletionYears}
            style={{
              width: isMobile ? "calc(50% - 6px)" : undefined,
              minWidth: isMobile ? undefined : 160,
            }}
            allowClear
            maxTagCount="responsive"
          />
          <Select
            mode="multiple"
            placeholder="Cost Range"
            options={COST_RANGES}
            value={costRanges}
            onChange={setCostRanges}
            style={{ width: isMobile ? "calc(50% - 6px)" : 170 }}
            allowClear
            maxTagCount="responsive"
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

        <Typography.Text
          style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA }}
        >
          {filteredProjects && filteredProjects.length
            ? `Showing ${filteredProjects.length} projects`
            : `Loading projects...`}
        </Typography.Text>

        {/* Table + Map */}
        <Flex
          vertical={isMobile}
          gap={16}
          style={{ minHeight: isMobile ? undefined : 550 }}
        >
          <Flex
            style={{
              height: isMobile ? 450 : 550,
              overflowY: "scroll",
              width: "48%",
            }}
            justify="center"
          >
            {isLoading ? (
              <Loader size="small"></Loader>
            ) : !filteredProjects.length ? (
              <Typography.Text
                style={{
                  marginTop: 100,
                  height: 24,
                  width: 300,
                  textAlign: "center",
                  borderRadius: 8,
                  lineHeight: "24px",
                  backgroundColor: COLORS.bgColorMedium,
                }}
              >
                No matching projects
              </Typography.Text>
            ) : (
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
            )}
          </Flex>
          <Flex
            style={{
              flex: isMobile ? undefined : 1,
              height: isMobile ? 450 : 550,
              overflowY: "scroll",
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
              onMapReady={handleMapReady}
            />
          </Flex>
        </Flex>
      </Flex>
    </AdminGuard>
  );
}
