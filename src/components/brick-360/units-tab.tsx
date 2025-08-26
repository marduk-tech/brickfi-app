import { Flex, Image, Tag, Typography } from "antd";
import { rupeeAmountFormat } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { ScrollableContainer } from "../scrollable-container";
import { useDevice } from "../../hooks/use-device";
import { useEffect, useState } from "react";

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

  let totalFloors = "";
  if (minFloors == maxFloors) {
    totalFloors = `${minFloors}`;
  } else {
    totalFloors = `${minFloors} - ${maxFloors}`;
  }
  return (
    <Typography.Text
      style={{
        fontSize: FONT_SIZE.HEADING_4,
        marginLeft: 4,
        color: COLORS.textColorMedium,
      }}
    >
      {totalFloors} Floors
    </Typography.Text>
  );
};

const getMinMaxSize = (configs: any[]) => {
  let sizes: number[] = [];
  configs.forEach((c: any) => {
    const split = c.config.split("-");
    if (split.length > 1) {
      sizes.push(parseInt(split[1]));
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

const getBhkType = (config: string) => {
  const splits = config.split("-");
  if (
    splits &&
    splits.length > 1 &&
    splits[0].toLowerCase().indexOf("bhk") > -1
  ) {
    return `${parseInt(splits[0])} BHK`;
  }
  return "";
};

export const UnitsTab = ({ lvnzyProject }: UnitsTabProps) => {
  const { isMobile } = useDevice();
  const [configFilters, setConfigFilters] = useState<string[]>([]);
  const [selectedConfigFilter, setSelectedConfigFilter] = useState<string>();

  useEffect(() => {
    if (
      !lvnzyProject?.originalProjectId.info.unitConfigWithPricing ||
      lvnzyProject?.originalProjectId.info.unitConfigWithPricing.length < 5
    ) {
      return;
    }
    let filters: string[] = [];
    lvnzyProject?.originalProjectId.info.unitConfigWithPricing.forEach(
      (unitConfig: any) => {
        const bhkType = getBhkType(unitConfig.config);
        if (!filters.includes(bhkType)) {
          filters.push(bhkType);
        }
      }
    );
    filters = filters.sort((a: string, b: string) => parseInt(a) - parseInt(b));
    setConfigFilters(filters);
    setSelectedConfigFilter(filters[0]);
  }, [lvnzyProject]);

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

          <Flex align="flex-start">
            {lvnzyProject?.meta.costingDetails && (
              <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_1 }}>
                ₹
                {rupeeAmountFormat(
                  `${Math.round(
                    lvnzyProject?.originalProjectId.info.rate.minimumUnitCost /
                      lvnzyProject?.originalProjectId.info.rate.minimumUnitSize
                  )}`
                )}{" "}
              </Typography.Text>
            )}
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_3,
                color: COLORS.textColorDark,
                marginTop: 4,
                marginLeft: 2,
              }}
            >
              per sq.ft
            </Typography.Text>
          </Flex>
          <Flex gap={4} style={{ color: COLORS.textColorMedium }}>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                color: COLORS.textColorMedium,
              }}
            >
              {Math.round(
                lvnzyProject?.property.layout.totalLandArea / 4046.8564
              )}{" "}
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
            )}{" "}
            ·
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

          <Flex style={{ marginTop: 24 }}>
            {configFilters?.map((filter: string) => {
              return (
                <Tag
                  color={
                    filter == selectedConfigFilter
                      ? COLORS.primaryColor
                      : "default"
                  }
                  style={{
                    fontSize: FONT_SIZE.HEADING_3,
                    padding: "4px 8px",
                    borderRadius: 8,
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
            {lvnzyProject?.originalProjectId.info.unitConfigWithPricing
              .filter(
                (c: any) =>
                  !configFilters ||
                  !configFilters.length ||
                  getBhkType(c.config) == selectedConfigFilter
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
                      paddingBottom: 16,
                      borderRadius: 8,
                      border: `2px solid ${COLORS.borderColor}`,
                    }}
                  >
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.HEADING_4,
                        textTransform: "uppercase",
                        color: COLORS.primaryColor,
                      }}
                    >
                      {c.config}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_2 }}>
                      ₹{rupeeAmountFormat(c.price)}
                    </Typography.Text>
                    {c.floorplans && c.floorplans.length > 0 && (
                      <Flex
                        style={{
                          overflowX: "auto",
                          marginTop: 16,
                          scrollbarWidth: "none",
                        }}
                        gap={32}
                      >
                        {c.floorplans.map((fp: any, i: number) => {
                          console.log(fp);

                          return (
                            <Image
                              key={`fp-${i}`}
                              src={fp}
                              style={{
                                height: 125,
                                width: "auto",
                              }}
                            />
                          );
                        })}
                      </Flex>
                    )}
                  </Flex>
                );
              })}
          </Flex>
        </Flex>
      </Flex>
    </ScrollableContainer>
  );
};
