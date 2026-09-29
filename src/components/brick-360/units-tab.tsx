import { ExclamationCircleFilled } from "@ant-design/icons";
import { Alert, Flex, Image, Modal, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDevice } from "../../hooks/use-device";
import { fetchPmtPlan, rupeeAmountFormat } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { HOME_TYPE_ICON } from "../../libs/home-type-icons";
import { computeProjectStatus, PROJECT_STATUS } from "../../libs/project-status";

interface UnitsTabProps {
  lvnzyProject: any;
}

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
  const isPreLaunch =
    computeProjectStatus(lvnzyProject) === PROJECT_STATUS.PRE_LAUNCH;
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
                      fontSize: FONT_SIZE.HEADING_4,
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
                          size={FONT_SIZE.HEADING_4}
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
                      fontSize: FONT_SIZE.HEADING_4,
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
                              fontSize: FONT_SIZE.HEADING_4,
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
     
    </>
  );
};
