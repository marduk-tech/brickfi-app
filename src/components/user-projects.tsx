"use client";

import { Button, Flex, Tooltip, Typography } from "antd";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useDevice } from "../hooks/use-device";
import { useWindowDimensions } from "../hooks/use-browser-safe";
import { useUser } from "../hooks/use-user";
import { BRICK360_CATEGORY, Brick360CategoryInfo } from "../libs/constants";
import {
  capitalize,
  captureAnalyticsEvent,
  fetchPmtPlan,
  getCategoryScore,
  rupeeAmountFormat,
} from "../libs/lvnzy-helper";
import {
  COLORS,
  FONT_SIZE,
  HORIZONTAL_PADDING,
} from "../theme/style-constants";
import { LvnzyProject } from "../types/LvnzyProject";
import DynamicReactIcon from "./common/dynamic-react-icon";
import GradientBar from "./common/grading-bar";
import { Loader } from "./common/loader";
import Brick360Chat from "./brick-360/brick360-chat";
import { BrickMapCustomer } from "./map-view-v2/brick-map/brick-map-customer";
const { Paragraph } = Typography;

export function UserProjects({
  lvnzyProjects,
}: {
  lvnzyProjects: LvnzyProject[];
}) {
  const { user } = useUser();
  const { width } = useWindowDimensions();
  const [selectedViewType, setSelectedViewType] = useState<string>("list");
  const brick360ChatRef = useRef<{
    expandChat: () => void;
  } | null>(null);

  const { isMobile } = useDevice();

  useEffect(() => {
    if (user && user.mobile) {
      captureAnalyticsEvent("account-view", {});
    }
  }, [user]);
  const renderLvnzyProject = (itemInfo: any) => {
    if (itemInfo.reraNumber || itemInfo.reraId) {
      return (
        <Flex
          style={{
            marginBottom: 8,
            cursor: "pointer",
            backgroundColor: "white",
            minHeight: 130,
            border: `1px solid ${COLORS.borderColor}`,
            borderRadius: 8,
            width: isMobile
              ? "100%"
              : (width - 50 * 3 - HORIZONTAL_PADDING * 2) / 4,
          }}
          vertical
        >
          <div
            style={{
              width: "100%",
              height: isMobile ? 200 : 175,
              borderRadius: 12,
              backgroundImage: `url(images/placeholder-pending-report.png)`,
              backgroundSize: "auto 90%",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
          <Flex vertical style={{ padding: "8px 16px" }}>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_2,
                color: COLORS.textColorLight,
              }}
            >
              {itemInfo.projectName}
            </Typography.Text>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                color: COLORS.textColorLight,
              }}
            >
              Report Pending
            </Typography.Text>
          </Flex>
        </Flex>
      );
    }
    const imgs = itemInfo?.originalProjectId?.media
      ? itemInfo.originalProjectId.media.filter((m: any) => m.type == "image")
      : [];
    let previewImage =
      imgs && imgs.length
        ? imgs.find((i: any) => i.isPreview) ||
          imgs.find(
            (i: any) =>
              i.image && i.image.tags && i.image.tags.includes("exterior")
          ) ||
          imgs.find(
            (i: any) => i.image && i.image.tags && !i.image.tags.includes("na")
          )
        : null;
    if (previewImage && previewImage.image) {
      previewImage = previewImage.image.url;
    }

    const primaryCorridor =
      Array.isArray(itemInfo.meta.projectCorridors) &&
      itemInfo.meta.projectCorridors.length
        ? itemInfo.meta.projectCorridors.sort(
            (a: any, b: any) => a.approxDistanceInKms - b.approxDistanceInKms
          )[0]?.corridorName || "Unknown"
        : "Unknown";
    const pmtPlan = fetchPmtPlan(
      itemInfo.originalProjectId?.info?.financialPlan
    );
    return (
      <Flex
        style={{
          marginBottom: 8,
          cursor: "pointer",
          backgroundColor: "white",
          width: isMobile
            ? "100%"
            : (width - 50 * 3 - HORIZONTAL_PADDING * 2) / 4,
        }}
      >
        
          <Flex vertical style={{ width: "100%" }}>
            <div
              style={{
                width: "100%",
                height: isMobile ? 175 : 150,
                borderRadius: 12,
                backgroundImage: `url(${previewImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            ></div>
            {/* <ProjectGallery
            media={itemInfo.originalProjectId.media}
          ></ProjectGallery> */}

            <Tooltip title={itemInfo.meta.projectName}>
              <Paragraph
                style={{
                  fontSize: FONT_SIZE.HEADING_2,
                  width: "100%",
                  padding: "4px",
                  paddingBottom: 0,
                  marginBottom: 0,
                  fontWeight: 500,
                }}
                ellipsis={{
                  rows: 1,
                  expandable: false,
                  symbol: "..",
                }}
              >
                {itemInfo.meta.projectName}
              </Paragraph>
            </Tooltip>
            <Flex vertical style={{ marginTop: "auto", padding: "0 4px" }}>
              <Paragraph
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  color: COLORS.textColorMedium,
                  marginBottom: 0,
                }}
                ellipsis={{
                  rows: 1,
                  expandable: false,
                  symbol: "..",
                }}
              >
                {capitalize(itemInfo.meta.projectUnitTypes?.split(",")[0] || "Property")} · ₹
                {rupeeAmountFormat(
                  itemInfo?.originalProjectId?.info?.rate?.minimumUnitCost || 0
                )}
                -{itemInfo?.originalProjectId?.info?.rate?.minimumUnitSize || 0}
                sq.ft · {primaryCorridor}
              </Paragraph>
            

              {/* {pmtPlan ? (
              <Flex
                style={{
                  width: "fit-content",
                  borderRadius: 4,
                  marginTop: 8,
                }}
                align="center"
                gap={4}
              >
                <DynamicReactIcon
                  iconName="RiDiscountPercentFill"
                  iconSet="ri"
                  size={18}
                  color={COLORS.primaryColor}
                ></DynamicReactIcon>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_4,
                    color: COLORS.primaryColor,
                  }}
                >
                  {pmtPlan}
                </Typography.Text>{" "}
              </Flex>
            ) : (
              <Typography.Text>&nbsp;</Typography.Text>
            )} */}
              <Flex
                style={{
                  paddingTop: 8,
                  borderTopColor: COLORS.borderColor,
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {Object.keys(BRICK360_CATEGORY).map((item, index) => (
                  <Flex
                    style={{
                      borderColor: COLORS.borderColor,
                      borderRadius: 8,
                    }}
                  >
                    <Flex
                      vertical
                      style={{ width: "100%" }}
                      justify="flex-start"
                    >
                      <Flex justify="center" align="center">
                        <GradientBar
                          value={getCategoryScore(itemInfo.score?.[item])}
                          showBadgeOnly={true}
                        ></GradientBar>
                      </Flex>
                      <Typography.Text
                        style={{
                          fontSize: isMobile
                            ? FONT_SIZE.PARA
                            : FONT_SIZE.SUB_TEXT,
                          color: COLORS.textColorLight,
                          textAlign: "center",
                        }}
                      >
                        {(Brick360CategoryInfo as any)[item].title}
                      </Typography.Text>
                    </Flex>
                  </Flex>
                ))}
              </Flex>
                <Flex style={{width: "100%", marginTop: 8}}>
                <Link
                  href={`/app/brick360/${itemInfo.slug || itemInfo._id}`}
                  prefetch={false}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    width: "100%",
                    border: `1px solid ${COLORS.primaryColor}`,
                    borderRadius: 8,
                    textAlign: "center"
                  }}
                >
                  <Typography.Text
                    style={{ fontSize: FONT_SIZE.PARA, color: COLORS.primaryColor,  width: "100%" }}
                  >
                    View 360 Report
                  </Typography.Text>
                </Link>
              </Flex>
            </Flex>
          </Flex>
      </Flex>
    );
  };

  if (!user) {
    return <Loader></Loader>;
  }

  if (!lvnzyProjects || !lvnzyProjects.length) {
    return (
      <Flex
        style={{ width: "100%", padding: 16 }}
        justify="center"
        align="center"
      >
        <Typography.Text>No saved projects found</Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex
      style={{
        width: "100%",
        padding: 0,
        paddingBottom: 100,
        border: 0,
      }}
      vertical
    >
      <Flex
        style={{
          padding: isMobile ? `0 8px` : `0 ${HORIZONTAL_PADDING}px`,
          marginLeft: "auto",
        }}
      >
        <Flex
          style={{
            backgroundColor: "white",
            borderRadius: 8,
            marginTop: 8,
            border: `1px solid ${COLORS.borderColorMedium}`,
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          <Flex
            style={{
              backgroundColor:
                selectedViewType == "list" ? COLORS.textColorDark : "white",
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              padding: "8px 16px",
              cursor: "pointer",
            }}
            onClick={() => {
              setSelectedViewType("list");
            }}
          >
            <DynamicReactIcon
              iconName="FaRegListAlt"
              iconSet="fa"
              size={16}
              color={
                selectedViewType == "list" ? "white" : COLORS.textColorDark
              }
            ></DynamicReactIcon>
          </Flex>
          <Flex
            style={{
              backgroundColor:
                selectedViewType == "map" ? COLORS.textColorDark : "white",
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
              padding: "8px 16px",
            }}
            onClick={() => {
              setSelectedViewType("map");
            }}
          >
            <DynamicReactIcon
              iconName="FaMapMarked"
              iconSet="fa"
              size={16}
              color={selectedViewType == "map" ? "white" : COLORS.textColorDark}
            ></DynamicReactIcon>
          </Flex>
        </Flex>
      </Flex>

      {selectedViewType == "list" ? (
        <Flex
          style={{
            width: "100%",
            flexWrap: "wrap",
            marginTop: 16,
            padding: isMobile ? `0 16px` : `0 ${HORIZONTAL_PADDING}px`,
          }}
          gap={32}
        >
          {lvnzyProjects
            .sort((a: any, b: any) =>
              a.meta && b.meta
                ? a.meta.projectName > b.meta.projectName
                  ? 1
                  : -1
                : 0
            )
            .map((p: any) => renderLvnzyProject(p))}
        </Flex>
      ) : null}

      {selectedViewType == "map" ? (
        <Flex
          style={{
            padding: isMobile ? `0 8px` : `0 ${HORIZONTAL_PADDING}px`,
          }}
        >
          <BrickMapCustomer
            projectIds={lvnzyProjects.map((p) => p.originalProjectId?._id)}
            excludeMapCategories={[
              "surroundings",
              "conveniences",
              "growth potential",
            ]}
          ></BrickMapCustomer>
        </Flex>
      ) : null}
      {/* <Brick360Chat
        userProjects={lvnzyProjects.map((p) => {
          return {
            name: p.meta.projectName as string,
            id: p._id as string,
          };
        })}
        ref={brick360ChatRef}
      /> */}
    </Flex>
  );
}
