import { Flex, Image, Modal, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDevice } from "../../hooks/use-device";
import { fetchPmtPlan, rupeeAmountFormat, thsndFormat } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { HOME_TYPE_ICON } from "../../libs/home-type-icons";
import { ScrollableContainer } from "../scrollable-container";

interface UnitsTabProps {
  lvnzyProject: any;
}

const getTotalFloors = (lvnzyProject: any) => {
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
    let totalFloors = "";
    if (minFloors == maxFloors) {
      totalFloors = `${minFloors}`;
    } else {
      totalFloors = `${minFloors}-${maxFloors}`;
    }
    return (
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_4,
          marginLeft: 4,
          color: COLORS.textColorMedium,
        }}
      >
        · {totalFloors} Floors
      </Typography.Text>
    );
  }

  return null;
};

const getMinMaxSize = (configs: any[]) => {
  let sizes: number[] = [];
  configs.forEach((c: any) => {
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
        style={{ fontSize: FONT_SIZE.HEADING_4, color: COLORS.textColorMedium }}
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

const CATEGORY_ORDER = [
  "Apartments",
  "Villas",
  "Villaments",
  "Rowhouses",
  "Plots",
  "Penthouses",
  "Farmlands",
  "Other",
];

const CATEGORY_HOME_TYPE_KEY: Record<string, string> = {
  Apartments: "apartment",
  Villas: "villa",
  Villaments: "villament",
  Rowhouses: "rowhouse",
  Plots: "plot",
  Penthouses: "penthouse",
};

// Normalizes freeform unit `type`/`config` text (e.g. "2BHK", "2 BHK", "2 BHK Apartment")
// into a home-type category and a deduped sub-type label ("2 BHK").
const normalizeUnitType = (c: any): { category: string; label: string } => {
  const raw = (c.type || c.config || "").toString().trim();
  const lower = raw.toLowerCase();

  let category = "Other";
  if (lower.includes("villament")) category = "Villaments";
  else if (lower.includes("villa")) category = "Villas";
  else if (lower.includes("rowhouse") || lower.includes("row house"))
    category = "Rowhouses";
  else if (lower.includes("penthouse")) category = "Penthouses";
  else if (lower.includes("farmland")) category = "Farmlands";
  else if (lower.includes("plot")) category = "Plots";
  else if (lower.includes("bhk") || lower.includes("apartment") || lower.includes("studio"))
    category = "Apartments";

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

export const UnitsTab = ({ lvnzyProject }: UnitsTabProps) => {
  const { isMobile } = useDevice();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>();
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

  useEffect(() => {
    const configs = lvnzyProject?.originalProjectId.info.unitConfigWithPricing;
    if (!configs || !configs.length) {
      return;
    }
    const categorySet = new Set<string>();
    configs.forEach((c: any) => {
      categorySet.add(normalizeUnitType(c).category);
    });
    const sortedCategories = CATEGORY_ORDER.filter((cat) =>
      categorySet.has(cat)
    );
    setCategories(sortedCategories);
    setSelectedCategory(sortedCategories[0]);
  }, [lvnzyProject]);

  useEffect(() => {
    const configs = lvnzyProject?.originalProjectId.info.unitConfigWithPricing;
    if (
      !configs ||
      !configs.length ||
      configs.length < 5 ||
      selectedCategory === "Plots"
    ) {
      setConfigFilters([]);
      setSelectedConfigFilter(undefined);
      return;
    }
    const inCategory = selectedCategory
      ? configs.filter(
          (c: any) => normalizeUnitType(c).category === selectedCategory
        )
      : configs;
    let filters: string[] = [];
    inCategory.forEach((c: any) => {
      const { label } = normalizeUnitType(c);
      if (!filters.includes(label)) {
        filters.push(label);
      }
    });
    // Skip filters entirely if every filter would only have a single entry
    if (filters.length === inCategory.length) {
      filters = [];
    }
    filters = filters.sort((a: string, b: string) => {
      const na = parseInt(a);
      const nb = parseInt(b);
      if (!isNaN(na) && !isNaN(nb) && na !== nb) {
        return na - nb;
      }
      return a.localeCompare(b);
    });
    setConfigFilters(filters);
    setSelectedConfigFilter(filters[0]);
  }, [lvnzyProject, selectedCategory]);

  return (
    <ScrollableContainer>
      <Flex
        vertical
        style={{
          margin: "8px",
          marginBottom: 8,
        }}
      >
        <Flex vertical style={{ marginBottom: 8, paddingBottom: 80 }}>
          {/* Sqft & Configs */}

          <Flex gap={8} align="center">
            <Flex align="flex-start">
              {lvnzyProject?.meta.costingDetails && (
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_1 }}>
                  ₹
                  {thsndFormat(
                    `${Math.round(
                      (lvnzyProject?.originalProjectId.info.rate
                        .minimumUnitCost /
                        lvnzyProject?.originalProjectId.info.rate
                          .minimumUnitSize) / 25
                    ) * 25}`
                  )}{" "}
                </Typography.Text>
              )}
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  color: COLORS.textColorDark,
                  marginTop: 4,
                  marginLeft: 2,
                }}
              >
                per sq.ft
              </Typography.Text>
            </Flex>
            {pmtPlan ? (
              <Flex
                align="center"
                style={{
                  padding: "2px 8px",
                  borderRadius: 8,
                  backgroundColor: COLORS.textColorDark,
                  border: `1px solid ${COLORS.textColorDark}`,
                }}
                gap={2}
              >
                <DynamicReactIcon
                  iconName="RiDiscountPercentFill"
                  iconSet="ri"
                  size={20}
                  color="white"
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,

                    color: "white",
                  }}
                  onClick={() => {
                    setIsPmtPlanModalOpen(true);
                  }}
                >
                  {pmtPlan}
                </Typography.Text>
              </Flex>
            ) : null}
          </Flex>
          <Flex
            gap={4}
            style={{
              color: COLORS.textColorMedium,
              overflowX: "scroll",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
            }}
          >
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                color: COLORS.textColorMedium,
              }}
            >
              {Math.round(
                lvnzyProject?.property.layout.totalLandArea / 404.68564
              ) / 10}{" "}
              Acre
            </Typography.Text>{" "}
            ·
            {lvnzyProject?.property.layout.totalUnits && (
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  marginRight: 4,
                  color: COLORS.textColorMedium,
                }}
              >
                {lvnzyProject?.property.layout.totalUnits} Units
              </Typography.Text>
            )}{" "}
            ·
            {getMinMaxSize(
              lvnzyProject?.originalProjectId.info.unitConfigWithPricing
            )}
            {lvnzyProject?.originalProjectId.info.unitConfigWithPricing &&
            lvnzyProject!.meta.projectConfigurations.unitsBreakup
              ? getTotalFloors(lvnzyProject)
              : null}
            {lvnzyProject?.property.layout.totalPhases &&
            lvnzyProject?.property.layout.totalPhases > 1 ? (
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  color: COLORS.textColorMedium,
                  marginLeft: 4,
                }}
              >
                · {lvnzyProject?.property.layout.totalPhases} Phases
              </Typography.Text>
            ) : null}
          </Flex>
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

          {categories && categories.length > 1 ? (
            <Flex
              gap={4}
              style={{
                marginTop: 24,
                width: "100%",
                overflowX: "scroll",
                whiteSpace: "nowrap",
                scrollbarWidth: "none",
                marginBottom: 16
              }}
            >
              {categories.map((category: string) => {
                const isSelected = selectedCategory === category;
                const tagColor = isSelected
                  ? COLORS.primaryColor
                  : COLORS.textColorMedium;
                const icon = HOME_TYPE_ICON[CATEGORY_HOME_TYPE_KEY[category]];
                return (
                  <Tag
                    key={`category-${category}`}
                    style={{
                      fontSize: FONT_SIZE.HEADING_3,
                      padding: "4px 8px",
                      color: tagColor,
                      borderRadius: 0,
                      cursor: "pointer",
                      border: 0,
                      borderBottomStyle: "solid",
                      borderBottomWidth: isSelected ? 1 : 0,
                      backgroundColor: "transparent",
                      borderBottomColor: isSelected
                        ? COLORS.primaryColor
                        : "transparent",
                    }}
                    onClick={() => {
                      setSelectedCategory(category);
                    }}
                  >
                    <Flex align="center" gap={4} style={{ display: "inline-flex" }}>
                      {icon ? (
                        <DynamicReactIcon
                          iconSet={icon.set}
                          iconName={icon.name}
                          size={FONT_SIZE.HEADING_3}
                          color={tagColor}
                        />
                      ) : null}
                      {category}
                    </Flex>
                  </Tag>
                );
              })}
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
                      fontSize: FONT_SIZE.HEADING_3,
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
                .filter((c: any) => {
                  const { category, label } = normalizeUnitType(c);
                  if (selectedCategory && category !== selectedCategory) {
                    return false;
                  }
                  if (
                    configFilters &&
                    configFilters.length > 1 &&
                    label !== selectedConfigFilter
                  ) {
                    return false;
                  }
                  return true;
                })
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
                              fontSize: FONT_SIZE.HEADING_3,
                              color: COLORS.primaryColor,
                            }}
                          >
                            {c.type}
                          </Typography.Text>
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.PARA,
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
                                fontSize: FONT_SIZE.PARA,
                                color: COLORS.textColorMedium,
                              }}
                            >
                              Carpet Area: {c.sizeCarpet} sq.ft
                            </Typography.Text>
                          ) : null}
                          {c.sizePlot ? (
                            <Typography.Text
                              style={{
                                fontSize: FONT_SIZE.PARA,
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
                              fontSize: FONT_SIZE.HEADING_4,
                              textTransform: "uppercase",
                              color: COLORS.primaryColor,
                            }}
                          >
                            {c.config}
                          </Typography.Text>
                        </Flex>
                      )}

                      <Typography.Text
                        style={{ fontSize: FONT_SIZE.HEADING_2 }}
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
      <Modal
        open={isPmtPlanModalOpen}
        footer={null}
        closable={true}
        onCancel={() => {
          setIsPmtPlanModalOpen(false);
        }}
      >
        <Flex
          style={{
            height: 600,
            overflowY: "scroll",
            scrollbarWidth: "none",
            paddingTop: 32,
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {lvnzyProject.originalProjectId?.info?.financialPlan ||
              "No financial plan available"}
          </Markdown>
        </Flex>
      </Modal>
    </ScrollableContainer>
  );
};
