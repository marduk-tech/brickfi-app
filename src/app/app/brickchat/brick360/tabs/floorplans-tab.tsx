"use client";

// Floorplans tab of brick360-inline.tsx - copied from
// components/brick-360/units-tab.tsx (still used as-is by the standalone
// brick360-v2/v3 pages).
import { useBrick360FontSize } from "../use-font-size";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { Alert, Flex, Image, Modal, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDevice } from "@/hooks/use-device";
import { fetchPmtPlan, rupeeAmountFormat } from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { computeProjectStatus, PROJECT_STATUS } from "@/libs/project-status";

interface FloorplansTabProps {
  lvnzyProject: any;
}

const CATEGORY_ORDER = [
  "Apartment",
  "Villa",
  "Villament",
  "Rowhouse",
  "Plot",
  "Penthouse",
  "Farmland",
  "Other",
];

// Normalizes freeform unit `type`/`config` text (e.g. "2BHK", "2 BHK", "2 BHK Apartment")
// into a home-type category and a deduped sub-type label ("2 BHK").
const normalizeUnitType = (c: any): { category: string; label: string } => {
  const raw = (c.type || c.config || "").toString().trim();
  const lower = raw.toLowerCase();

  let category = "Other";
  if (lower.includes("villament")) category = "Villament";
  else if (lower.includes("villa")) category = "Villa";
  else if (lower.includes("rowhouse") || lower.includes("row house"))
    category = "Rowhouse";
  else if (lower.includes("penthouse")) category = "Penthouse";
  else if (lower.includes("farmland")) category = "Farmland";
  else if (lower.includes("plot")) category = "Plot";
  else if (lower.includes("bhk") || lower.includes("apartment") || lower.includes("studio"))
    category = "Apartment";

  const bhkMatch = lower.match(/(\d+(?:\.\d+)?)\s*bhk/);
  let label = raw;
  if (bhkMatch) {
    label = `${parseInt(bhkMatch[1])} BHK`;
  } else if (lower.includes("studio")) {
    label = "1 BHK";
  } else if (raw.includes("-")) {
    label = raw.split("-")[0].trim();
  }

  return { category, label: label || category };
};

// The single combined filter a unit falls under - its sub-type label plus
// its (singular) category, e.g. "2 BHK Apartment" / "4 BHK Rowhouse". The
// category is left off when the label already names it (a bare "Rowhouse"
// stays "Rowhouse", not "Rowhouse Rowhouse") or when it's just "Other".
const unitFilterLabel = (c: any): string => {
  const { category, label } = normalizeUnitType(c);
  if (category === "Other") return label;
  const labelLower = label.toLowerCase();
  // "row house" also counts as already naming "Rowhouse"
  const namesCategory =
    labelLower.includes(category.toLowerCase()) ||
    (category === "Rowhouse" && labelLower.includes("row house"));
  return namesCategory ? label : `${label} ${category}`;
};

// category order first (Apartment before Rowhouse...), then BHK count, then
// alphabetical - e.g. 1/2/3 BHK Apartment, then 4 BHK Rowhouse
const compareUnitFilters = (a: any, b: any) => {
  const ca = CATEGORY_ORDER.indexOf(normalizeUnitType(a).category);
  const cb = CATEGORY_ORDER.indexOf(normalizeUnitType(b).category);
  if (ca !== cb) return ca - cb;
  const la = normalizeUnitType(a).label;
  const lb = normalizeUnitType(b).label;
  const na = parseInt(la);
  const nb = parseInt(lb);
  if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
  return unitFilterLabel(a).localeCompare(unitFilterLabel(b));
};

export const FloorplansTab = ({ lvnzyProject }: FloorplansTabProps) => {
  const { isMobile } = useDevice();
  const fs = useBrick360FontSize();
  const isPreLaunch =
    computeProjectStatus(lvnzyProject) === PROJECT_STATUS.PRE_LAUNCH;
  const [configFilters, setConfigFilters] = useState<string[]>([]);
  const [selectedConfigFilter, setSelectedConfigFilter] = useState<string>();
  const [isPmtPlanModalOpen, setIsPmtPlanModalOpen] = useState(false);
  const [pmtPlan, setPmtPlan] = useState();
  useEffect(() => {
    if (lvnzyProject && lvnzyProject.originalProjectId?.info?.financialPlan) {
      setPmtPlan(
        fetchPmtPlan(lvnzyProject.originalProjectId.info.financialPlan)
      );
    }
  }, [lvnzyProject]);

  // One combined filter row ("2 BHK Apartment", "4 BHK Rowhouse", ...)
  // instead of a separate category row plus a per-category sub-type row.
  // Shown when the project spans several categories, or has enough units
  // (5+) that at least one filter groups more than one of them.
  useEffect(() => {
    const configs = lvnzyProject?.originalProjectId.info.unitConfigWithPricing;
    if (!configs || !configs.length) {
      setConfigFilters([]);
      setSelectedConfigFilter(undefined);
      return;
    }
    const filters: string[] = [];
    [...configs].sort(compareUnitFilters).forEach((c: any) => {
      const filter = unitFilterLabel(c);
      if (!filters.includes(filter)) filters.push(filter);
    });
    const categoryCount = new Set(
      configs.map((c: any) => normalizeUnitType(c).category),
    ).size;
    const showFilters =
      categoryCount > 1 ||
      (configs.length >= 5 && filters.length < configs.length);
    setConfigFilters(showFilters ? filters : []);
    setSelectedConfigFilter(showFilters ? filters[0] : undefined);
  }, [lvnzyProject]);

  return (
    <>
      <Flex
        vertical
        style={{
          margin: "8px",
          marginBottom: 8,
        }}
      >
        <Flex vertical style={{ marginBottom: 8, paddingBottom: 80 }}>
          {lvnzyProject?.property.layout.totalPhases &&
          lvnzyProject?.property.layout.totalPhases > 1 ? (
            <Flex
              style={{
                width: "100",
                display: "inline",
                marginTop: 16,
              }}
            >
              <Tag
                style={{
                  lineHeight: "120%",
                  padding: "4px 8px",
                  borderRadius: 8,
                  color: COLORS.textColorDark,
                  fontSize: FONT_SIZE.PARA,
                  width: "100",
                  textWrap: "initial",
                }}
                color="processing"
              >
                The project has {lvnzyProject?.property.layout.totalPhases}{" "}
                different phases. Unit availability as well as pricing might
                vary with each phase.
              </Tag>
            </Flex>
          ) : null}

          {configFilters && configFilters.length > 1 ? (
            <Flex
              gap={4}
              style={{
                marginTop: 16,
                width: "100%",
                overflowX: "scroll",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
              }}
            >
              {configFilters?.map((filter: string) => {
                return (
                  <Tag
                    key={`filter-${filter}`}
                    color={
                      filter == selectedConfigFilter
                        ? COLORS.primaryColor
                        : "default"
                    }
                    style={{
                      fontSize: fs.HEADING_2,
                      padding: "4px 8px",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedConfigFilter(filter);
                    }}
                  >
                    {filter}
                  </Tag>
                );
              })}
            </Flex>
          ) : null}

          {isPreLaunch ? (
            <Alert
              type="warning"
              showIcon
              icon={<ExclamationCircleFilled style={{ fontSize: 18 }} />}
              message={
                <>
                  Limited property and layout details available as the
                  project remains in pre-launch stage.{" "}<br></br>
                  <a
                    href="https://www.brickfi.in/callback-request?srcIntent=brick360-report"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Reach out to a Brickfi advisor
                  </a>{" "}
                  for real time details.
                </>
              }
              style={{
                fontSize: FONT_SIZE.PARA,
                marginTop: 16,
                maxWidth: 700,
                lineHeight: "120%",
                alignItems: "flex-start",
              }}
            />
          ) : null}

          <Flex
            vertical={isMobile}
            gap={16}
            style={{
              width: "100%",
              overflowX: "scroll",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
            }}
          >
            <Image.PreviewGroup preview={true}>
              {lvnzyProject?.originalProjectId.info.unitConfigWithPricing
                .filter(
                  (c: any) =>
                    !(configFilters && configFilters.length > 1) ||
                    unitFilterLabel(c) === selectedConfigFilter,
                )
                .sort((a: any, b: any) => a.price - b.price)
                .map((c: any, index: number) => {
                  return (
                    <Flex
                      key={`config-${index}`}
                      vertical
                      style={{
                        marginTop: 16,
                        padding: 8,
                        paddingBottom: isMobile ? 24 : 0,
                        paddingRight: isMobile ? 0 : 24,

                        borderRight: isMobile
                          ? "none"
                          : `2px solid ${COLORS.borderColor}`,
                        borderBottom: isMobile
                          ? `2px solid ${COLORS.borderColor}`
                          : "none",
                      }}
                    >
                      {c.sizeBuiltup ? (
                        <Flex vertical style={{ marginBottom: 8 }}>
                          <Typography.Text
                            style={{
                              fontSize: fs.HEADING_2,
                              fontWeight: 500,
                              color: COLORS.primaryColor,
                              
                            }}
                          >
                            {c.type}
                          </Typography.Text>
                          <Typography.Text
                            style={{
                              fontSize: fs.HEADING_3,
                              color: COLORS.textColorMedium,
                            }}
                          >
                            {lvnzyProject?.originalProjectId.info.homeType.includes(
                              "plot"
                            ) && !c.type.toLowerCase().includes("bhk")
                              ? "Plot "
                              : "Builtup "}
                            Area: {c.sizeBuiltup} sq.ft
                          </Typography.Text>
                          {c.sizeCarpet ? (
                            <Typography.Text
                              style={{
                                fontSize: fs.HEADING_3,
                                color: COLORS.textColorMedium,
                              }}
                            >
                              Carpet Area: {c.sizeCarpet} sq.ft
                            </Typography.Text>
                          ) : null}
                          {c.sizePlot ? (
                            <Typography.Text
                              style={{
                                fontSize: fs.HEADING_3,
                                color: COLORS.textColorMedium,
                              }}
                            >
                              Plot Area: {c.sizePlot} sq.ft
                            </Typography.Text>
                          ) : null}
                        </Flex>
                      ) : (
                        <Flex>
                          <Typography.Text
                            style={{
                              fontSize: fs.HEADING_4,
                              textTransform: "uppercase",
                              color: COLORS.primaryColor,
                            }}
                          >
                            {c.config}
                          </Typography.Text>
                        </Flex>
                      )}

                      <Typography.Text
                        style={{ fontSize: fs.HEADING_2, fontWeight: 500 }}
                      >
                        ₹{rupeeAmountFormat(c.price)}
                      </Typography.Text>
                      {c.floorplans &&
                      c.floorplans.filter((f: string) => !!f).length > 0 ? (
                        <Flex
                          style={{
                            overflowX: "auto",
                            marginTop: 16,
                            scrollbarWidth: "none",
                            maxWidth: isMobile ? "100%" : 300,
                          }}
                          gap={24}
                        >
                          {c.floorplans.map((fp: any, i: number) => {
                            console.log(fp);

                            return (
                              <Image
                                key={`fp-${i}`}
                                src={fp}
                                alt={`Floorplan ${i + 1}`}
                                preview={{
                                  mask: null,
                                }}
                                style={{
                                  height: 125,
                                  minWidth:100,
                                  width: "auto",
                                  border: `2px solid ${COLORS.borderColorMedium}`,
                                  borderRadius: 8,
                                }}
                              />
                            );
                          })}
                        </Flex>
                      ) : null}
                    </Flex>
                  );
                })}
            </Image.PreviewGroup>
          </Flex>
        </Flex>
      </Flex>
     
    </>
  );
};
