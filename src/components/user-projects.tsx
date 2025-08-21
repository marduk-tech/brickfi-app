import { Flex, Tooltip, Typography } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import { BRICK360_CATEGORY, Brick360CategoryInfo } from "../libs/constants";
import {
  capitalize,
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
const { Paragraph } = Typography;

export function UserProjects({
  lvnzyProjects,
}: {
  lvnzyProjects: LvnzyProject[];
}) {
  const { user } = useUser();

  const navigate = useNavigate();
  const [selectedCorridor, setSelectedCorridor] = useState<string>("all");
  const { isMobile } = useDevice();

  const filteredProjects = lvnzyProjects.filter(
    (p: any) =>
      !selectedCorridor ||
      selectedCorridor == "all" ||
      p.meta.projectCorridors.split(",").includes(selectedCorridor)
  );

  const renderLvnzyProject = (itemInfo: any) => {
    const oneLinerBreakup = itemInfo.meta.oneLiner
      ? itemInfo.meta.oneLiner.split(" · ")
      : [];

    const imgs =
      itemInfo && itemInfo.originalProjectId && itemInfo.originalProjectId.media
        ? itemInfo.originalProjectId.media.filter((m: any) => m.type == "image")
        : [];
    const previewImage =
      imgs && imgs.length
        ? (imgs.find((i: any) => i.isPreview) || imgs[0]).image.url!
        : "";

    const primaryCorridor = itemInfo.meta.projectCorridors.sort(
      (a: any, b: any) => a.approxDistanceInKms - b.approxDistanceInKms
    )[0].corridorName;
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
            : (window.innerWidth - 40 * 3 - HORIZONTAL_PADDING * 2) / 4,
        }}
        onClick={() => {
          navigate(`/app/brick360/${itemInfo._id}`);
        }}
      >
        <Flex vertical style={{ width: "100%" }}>
          <div
            style={{
              width: "100%",
              height: isMobile ? 200 : 175,
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
              {capitalize(itemInfo.meta.projectUnitTypes.split(",")[0])} · ₹
              {rupeeAmountFormat(
                itemInfo?.originalProjectId.info.rate.minimumUnitCost
              )}
              -{itemInfo?.originalProjectId.info.rate.minimumUnitSize}sq.ft ·{" "}
              {primaryCorridor}
            </Paragraph>

            {pmtPlan ? (
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
            )}
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
                  <Flex vertical style={{ width: "100%" }} justify="flex-start">
                    <Typography.Text
                      style={{
                        fontSize: isMobile
                          ? FONT_SIZE.PARA
                          : FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorMedium,
                      }}
                    >
                      {(Brick360CategoryInfo as any)[item].title}
                    </Typography.Text>
                    <Flex>
                      <GradientBar
                        value={getCategoryScore(itemInfo.score?.[item])}
                        showBadgeOnly={true}
                      ></GradientBar>
                    </Flex>
                  </Flex>
                </Flex>
              ))}
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
      {/* {uniqueCorridors &&
      uniqueCorridors.length > 0 &&
      lvnzyProjects.length > 5 ? (
        <>
          <Flex gap={8} style={{ marginBottom: 16 }}>
            <Select
              style={{ width: 225, height: 42 }}
              placeholder="Select corridor"
              value={selectedCorridor}
              onChange={(value: string) => setSelectedCorridor(value)}
              options={[
                { value: "all", label: "All Corridors" },
                ...uniqueCorridors.map((c) => ({
                  value: c,
                  label: c,
                })),
              ]}
            />
          </Flex>
          <Flex vertical>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {filteredProjects.length} projects
            </Typography.Title>
          </Flex>
        </>
      ) : null} */}

      <Flex
        style={{
          width: "100%",
          flexWrap: "wrap",
          marginTop: 16,
          padding: isMobile ? `0 8px` : 0,
        }}
        gap={32}
      >
        {filteredProjects
          .sort((a: any, b: any) =>
            a.meta.projectName > b.meta.projectName ? 1 : -1
          )
          .map((p: any) => renderLvnzyProject(p))}
      </Flex>
      {/* <BrickfiAssist
        ref={chatRef}
        lvnzyProjectsCollection={selectedCollection.name}
      ></BrickfiAssist> */}
    </Flex>
  );
}
