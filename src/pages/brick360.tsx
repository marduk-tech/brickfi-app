import {
  Alert,
  Button,
  Divider,
  Drawer,
  Flex,
  List,
  Modal,
  Progress,
  Space,
  Tag,
  Typography,
} from "antd";
import moment from "moment";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import GradientBar from "../components/common/grading-bar";
import { Loader } from "../components/common/loader";
import RatingBar from "../components/common/rating-bar";
import MapViewV2 from "../components/map-view/map-view-v2";
import ProjectGallery from "../components/project-gallery";
import { useDevice } from "../hooks/use-device";
import { useFetchLvnzyProjectById } from "../hooks/use-lvnzy-project";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DataSources } from "../components/common/data-sources";
import {
  BRICK360_CATEGORY,
  Brick360CategoryInfo,
  Brick360DataPoints,
} from "../libs/constants";
import {
  capitalize,
  getCategoryScore,
  rupeeAmountFormat,
} from "../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { ISurroundingElement } from "../types/Project";
const FAKE_TIMER_SECS = 1000;
const { Paragraph, Text } = Typography;

export function Brick360() {
  const { lvnzyProjectId } = useParams();

  const { isMobile } = useDevice();

  const { data: lvnzyProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectById(lvnzyProjectId!);

  const dataSets = [
    "RERA",
    "Open Street",
    "BBMP",
    "BIAPPA",
    "Google Maps",
    "Open City",
    "Online Listings",
  ];

  const chatRef = useRef<{ clearChatData: () => void } | null>(null);

  const [scoreParams, setScoreParams] = useState<any[]>([]);
  const [quickSnapshotDialogOpen, setQuickSnapshotDialogOpen] = useState(false);

  const [pmtDetailsModalContent, setPmtDetailsModalContent] = useState<
    ReactNode | undefined
  >();

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedDataPointCategory, setSelectedDataPointCategory] =
    useState<any>();
  const [selectedDataPointSubCategory, setSelectedDataPointSubCategory] =
    useState<any>();

  const [selectedDriverTypes, setSelectedDriverTypes] = useState<any>();

  const [mapVisible, setMapVisible] = useState<boolean>(false);

  const [mapDrivers, setMapDrivers] = useState<any[]>([]);
  const [surroundingElements, setSurroundingElements] =
    useState<ISurroundingElement[]>();
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>();
  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [selectedDataPointTitle, setSelectedDataPointTitle] = useState("");

  const [isConfigurationsModalOpen, setIsConfigurationsModalOpen] =
    useState(false);

  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

  // Renders the drawer close button
  const renderDrawerCloseBtn = () => {
    return (
      <Flex
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 99999,
        }}
        onClick={() => {
          setDetailsModalOpen(false);
          if (!isMapFullScreen) {
            chatRef.current?.clearChatData();
          }
        }}
      >
        <DynamicReactIcon
          iconName="IoCloseCircle"
          iconSet="io5"
          size={32}
        ></DynamicReactIcon>
      </Flex>
    );
  };

  // Get data category icon
  const getDataCategoryIcon = (iconName: string, iconSet: any) => {
    return (
      <DynamicReactIcon
        iconName={iconName}
        iconSet={iconSet}
        color={COLORS.textColorDark}
      ></DynamicReactIcon>
    );
  };

  const getTotalFloors = (lvnzyProject: any) => {
    const minFloors = Math.min(
      ...lvnzyProject?.meta.projectConfigurations.towers.map(
        (t: any) => t.totalFloors
      )
    );
    const maxFloors = Math.max(
      ...lvnzyProject?.meta.projectConfigurations.towers.map(
        (t: any) => t.totalFloors
      )
    );
    if (minFloors == maxFloors) {
      return `${minFloors}`;
    } else {
      return `${minFloors} -
                ${maxFloors}`;
    }
  };

  const getStatusLabel = (projectTimelines: any[]) => {
    const completionDate =
      projectTimelines[projectTimelines.length - 1]["completionDate"];
    const [day, month, year] = completionDate.split("-");
    const date = new Date(`${year}-${month}-${day}`);
    const diff = Math.ceil(
      (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff > 365 * 1) {
      return "Ready To Move";
    } else if (diff < 365 && diff > 0) {
      return "Recently Completed";
    } else if (diff < 0) {
      return "Under Construction";
    }
    return "";
  };
  // Fake timeout and progress
  useEffect(() => {
    const interval = setInterval(() => {
      setFakeTimeoutProgress((prevFakeTimeoutProgress: any) => {
        if (prevFakeTimeoutProgress >= 130) {
          // Stop at 10
          clearInterval(interval);
          return prevFakeTimeoutProgress;
        }
        return prevFakeTimeoutProgress + 10;
      });
    }, FAKE_TIMER_SECS);
  });

  useEffect(() => {
    if (!lvnzyProject) {
      return;
    }
    setMapDrivers(
      [
        ...(lvnzyProject as any)["neighborhood"].drivers,
        ...(lvnzyProject as any)["connectivity"].drivers,
      ].filter((d) => !!d.driverId && !!d.driverId._id)
    );
  }, [lvnzyProject]);

  // Setting map drivers based on selected data point
  useEffect(() => {
    if (
      lvnzyProject &&
      selectedDataPointSubCategory &&
      selectedDataPointCategory
    ) {
      let surrElements;

      const updateMapState = () => {
        // reset states first
        setSelectedDriverTypes([]);
        setSurroundingElements([]);
        setMapVisible(false);

        if (selectedDataPointCategory === "areaConnectivity") {
          setMapVisible(true);

          switch (selectedDataPointSubCategory) {
            case "schoolsOffices":
              setSelectedDriverTypes([
                "school",
                "industrial-hitech",
                "industrial-general",
              ]);
              break;
            case "conveniences":
              setSelectedDriverTypes(["food", "hospital"]);
              break;
            case "transport":
              setSelectedDriverTypes(["transit", "highway"]);
              break;
          }
        } else if (selectedDataPointCategory === "financials") {
          setMapVisible(true);
          setSelectedDriverTypes([
            "industrial-hitech",
            "industrial-general",
            "highway",
          ]);
        } else if (
          selectedDataPointCategory === "property" &&
          selectedDataPointSubCategory === "surroundings"
        ) {
          surrElements = (lvnzyProject as any)["property"].surroundings;
          if (
            surrElements?.length &&
            surrElements.filter((e: any) => !!e.geometry).length
          ) {
            setSurroundingElements(surrElements);
            setMapVisible(true);
          }
        }
      };

      setTimeout(updateMapState, 0);
    }
  }, [selectedDataPointCategory, selectedDataPointSubCategory, lvnzyProject]);

  // Setting main data points category
  useEffect(() => {
    if (lvnzyProject) {
      const params = [];

      for (const key in BRICK360_CATEGORY) {
        const cat = BRICK360_CATEGORY[key as keyof typeof BRICK360_CATEGORY];
        const catInfo = Brick360CategoryInfo[cat];
        if (!catInfo.disabled) {
          params.push({
            title: catInfo.title,
            key: key,
            icon: getDataCategoryIcon(catInfo.iconName, catInfo.iconSet),
            dataPoints: lvnzyProject.score?.[cat]
              ? Object.entries(lvnzyProject.score[cat])
              : [],
          });
        }
      }
      setScoreParams(params);
    }
  }, [lvnzyProject]);

  const progressWidth = isMobile ? window.innerWidth : 800;

  if (lvnzyProjectIsLoading) {
    return <Loader></Loader>;
  }

  // Fake progress bar
  if (fakeTimeoutProgress < 130) {
    return (
      <Flex
        vertical
        style={{
          padding: 16,
          width: progressWidth,
          position: "fixed",
          top: "20%",
          left: `calc(50% - ${progressWidth / 2}px)`,
        }}
      >
        <Flex vertical>
          <DataSources disableDetailsDialog={true}></DataSources>
        </Flex>
        {/* <ProjectGallery ></ProjectGallery> */}
        <Typography.Title
          level={2}
          style={{
            margin: 0,
            padding: 8,
          }}
        >
          {lvnzyProject?.meta.projectName}
        </Typography.Title>
        <Flex vertical style={{ marginTop: 16 }}>
          {" "}
          <Typography.Text style={{ padding: "0 8px" }}>
            {fakeTimeoutProgress < 20
              ? "Starting up"
              : fakeTimeoutProgress < 80
              ? "Collecting Data"
              : "Finishing up"}
          </Typography.Text>
          <Progress percent={fakeTimeoutProgress} style={{ padding: 8 }} />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      vertical
      style={{
        width: "100%",
        paddingBottom: 75,
        margin: "auto",
        maxWidth: 900,
        overflowX: "hidden",
      }}
    >
      {/* Main project upfront score card including metadata */}
      <Flex vertical style={{ padding: 0 }}>
        {/* Project Gallery */}
        <ProjectGallery
          media={lvnzyProject?.originalProjectId.media}
        ></ProjectGallery>
        {/* Name */}{" "}
        <Flex
          vertical
          style={{
            alignItems: "flex-start",
            margin: "8px 0",
            padding: "0 8px",
          }}
          gap={8}
        >
          <Flex>
            <Tag
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                padding: "4px 8px",
                borderRadius: 8,
                fontWeight: 500,
              }}
            >
              {lvnzyProject?.originalProjectId?.info?.developerId?.name || "Developer"}
            </Tag>
            <Tag
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                padding: "4px 8px",
                borderRadius: 8,
                fontWeight: 500,
              }}
            >
              {getStatusLabel(lvnzyProject?.meta.projectTimelines)}
            </Tag>
          </Flex>
          <Typography.Title
            level={2}
            style={{ margin: "0", lineHeight: "100%" }}
          >
            {lvnzyProject?.meta.projectName}
          </Typography.Title>
        </Flex>
      </Flex>

      {/* One liner & timeline */}
      <Flex vertical style={{ padding: "0 8px" }}>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.PARA,
            margin: 0,
            color: COLORS.textColorLight,
          }}
        >
          {lvnzyProject?.meta.oneLiner}
        </Typography.Text>
        {lvnzyProject?.meta.projectTimelines &&
        lvnzyProject?.meta.projectTimelines.length ? (
          <Flex>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.PARA,
                color: COLORS.textColorLight,
              }}
            >
              Launched:{" "}
              {moment(
                lvnzyProject?.meta.projectTimelines[0].startDate,
                "DD-MM-YYYY"
              ).format("MMM YYYY")}{" "}
              |
            </Typography.Text>

            <Typography.Text
              style={{
                fontSize: FONT_SIZE.PARA,
                color: COLORS.textColorLight,
                marginLeft: 4,
              }}
            >
              Completion:{" "}
              {moment(
                lvnzyProject?.meta.projectTimelines[0].completionDate,
                "DD-MM-YYYY"
              ).format("MMM YYYY")}
            </Typography.Text>
          </Flex>
        ) : null}
      </Flex>
      <Divider style={{ margin: "16px 16px 0 16px" }}></Divider>

      {/* Configurations and costing */}
      <Flex
        vertical
        style={{
          margin: "16px 8px",
          marginBottom: 8,
        }}
      >
        <Flex vertical style={{ marginBottom: 8 }}>
          {/* Sqft & Configs */}
          <Typography.Text
            style={{
              borderRadius: 8,
              color: "white",
            }}
          >
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                marginRight: 8,
                color: COLORS.textColorLight,
              }}
            >
              Per Sqft:
            </Typography.Text>
            <Typography.Text
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.HEADING_4,
                fontWeight: 500,
              }}
            >
              {rupeeAmountFormat(
                `₹${Math.round(
                  lvnzyProject?.meta.costingDetails.minimumUnitCost /
                    lvnzyProject?.meta.costingDetails.minimumUnitSize
                )}`
              )}{" "}
            </Typography.Text>
            {/* 
            <Typography.Text
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.HEADING_4,
                fontWeight: 500,
              }}
            >
              | {lvnzyProject!.meta.costingDetails.configurations.length} Unit
              Types
            </Typography.Text> */}
          </Typography.Text>
          <Flex vertical={isMobile}>
            <Typography.Text
              onClick={() => {
                setIsConfigurationsModalOpen(true);
              }}
            >
              {lvnzyProject!.meta.costingDetails.configurations
                .slice(0, 1)
                .map((c: any) => `${c.config} | ₹${rupeeAmountFormat(c.cost)}`)
                .join("\n")}
            </Typography.Text>
            <Typography.Text
              onClick={() => {
                setIsConfigurationsModalOpen(true);
              }}
              style={{
                color: COLORS.primaryColor,
                marginLeft: 8,
                cursor: "pointer",
              }}
            >
              ...See all
            </Typography.Text>
          </Flex>
          {/* Payment plan and price point */}
          <Flex style={{ marginTop: 8, marginBottom: 8 }}>
            {lvnzyProject?.originalProjectId?.info?.financialPlan ? (
              <Flex
                style={{ marginTop: 8 }}
                onClick={() => {
                  setPmtDetailsModalContent(
                    <Flex vertical style={{ width: "100%" }}>
                      <Typography.Title
                        level={3}
                        style={{ margin: 0, marginTop: 16 }}
                      >
                        Payment Plans
                      </Typography.Title>
                      <Typography.Text
                        style={{
                          fontSize: FONT_SIZE.PARA,
                          color: COLORS.textColorLight,
                          lineHeight: "120%",
                          marginBottom: 24,
                        }}
                      >
                        Payment structure including construction linked and
                        other incentives.
                      </Typography.Text>
                      <Markdown
                        remarkPlugins={[remarkGfm]}
                        className="liviq-content"
                      >
                        {lvnzyProject?.originalProjectId?.info?.financialPlan || 'No financial plan available'}
                      </Markdown>
                    </Flex>
                  );
                }}
              >
                <Tag
                  color="white"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  <DynamicReactIcon
                    iconName="MdPayments"
                    color={COLORS.textColorDark}
                    iconSet="md"
                  ></DynamicReactIcon>
                  <Typography.Text
                    style={{
                      marginLeft: 8,
                      fontWeight: 500,
                      padding: "0 4px",
                      color: COLORS.textColorDark,
                    }}
                  >
                    Payment Plans
                  </Typography.Text>
                </Tag>
              </Flex>
            ) : null}
            {lvnzyProject?.investment &&
            lvnzyProject?.investment.corridorPricing &&
            !!lvnzyProject?.investment.corridorPricing.filter(
              (c: any) => !!c.projectLocation
            ).length ? (
              <Flex
                style={{ marginTop: 8 }}
                onClick={() => {
                  setPmtDetailsModalContent(
                    <Flex vertical style={{ width: "100%" }}>
                      <Typography.Title
                        level={3}
                        style={{ margin: 0, marginTop: 16 }}
                      >
                        Price Point
                      </Typography.Title>
                      <Typography.Text
                        style={{
                          fontSize: FONT_SIZE.PARA,
                          color: COLORS.textColorLight,
                          marginBottom: 16,
                        }}
                      >
                        Per sqft comparison with other nearby projects.
                      </Typography.Text>
                      <MapViewV2
                        projectId={lvnzyProject?.originalProjectId._id}
                        fullSize={true}
                        projectSqftPricing={Math.round(
                          lvnzyProject?.meta.costingDetails.minimumUnitCost /
                            lvnzyProject?.meta.costingDetails.minimumUnitSize
                        )}
                        projectsNearby={lvnzyProject?.investment.corridorPricing.filter(
                          (p: any) => !!p.sqftCost
                        )}
                      ></MapViewV2>
                    </Flex>
                  );
                }}
              >
                <Tag
                  color="white"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  {" "}
                  <DynamicReactIcon
                    iconName="HiOutlineCurrencyRupee"
                    color={COLORS.textColorDark}
                    iconSet="hi"
                  ></DynamicReactIcon>
                  <Typography.Text
                    style={{
                      marginLeft: 4,
                      fontWeight: 500,
                      color: COLORS.textColorDark,
                      padding: "0 4px",
                    }}
                  >
                    Price Point
                  </Typography.Text>
                </Tag>
              </Flex>
            ) : null}
          </Flex>
        </Flex>
      </Flex>

      <Divider style={{ margin: "0 8px 16px 8px" }}></Divider>
      <Flex style={{ padding: "0 4px" }}>
        <DataSources></DataSources>
      </Flex>
      {lvnzyProject?.score.summary && (
        <Flex
          style={{
            margin: "0 8px",
            borderRadius: 8,
            cursor: "pointer",
            padding: "8px 0",
            backgroundColor: "white",
          }}
          onClick={() => {
            setQuickSnapshotDialogOpen(true);
          }}
        >
          <Flex
            style={{
              width: "100%",
              marginLeft: 0,
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            <Flex align="center" gap={4}>
              <DynamicReactIcon
                iconName="IoMdListBox"
                iconSet="io"
                size={22}
                color={COLORS.textColorDark}
              ></DynamicReactIcon>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                }}
              >
                360 Snapshot
              </Typography.Text>
            </Flex>
            <Flex
              style={{
                height: 24,
                marginLeft: "auto",
              }}
            >
              {lvnzyProject?.score.summary.pros.length ? (
                <Tag
                  color={COLORS.greenIdentifier}
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    marginRight: 0,
                  }}
                >
                  {lvnzyProject?.score.summary.pros.length} pros
                </Tag>
              ) : null}
              {lvnzyProject?.score.summary.cons.length ? (
                <Tag
                  color={COLORS.redIdentifier}
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    marginLeft: 4,
                    marginRight: 0,
                  }}
                >
                  {lvnzyProject?.score.summary.cons.length} cons
                </Tag>
              ) : null}
            </Flex>
          </Flex>
        </Flex>
      )}

      {/* <Alert
        message="Click each rating to see more details"
        type="info"
        showIcon
        closable
        style={{ margin: 16 }}
      /> */}
      {/* All the data points */}
      <Flex vertical gap={32} style={{ padding: "16px 8px" }}>
        {scoreParams &&
          scoreParams.map((sc) => {
            return (
              <Flex vertical>
                <Flex gap={8} align="center" style={{ marginBottom: 8 }}>
                  {sc.icon ? sc.icon : null}
                  <Typography.Title
                    level={4}
                    style={{ margin: 0, marginBottom: 0 }}
                  >
                    {sc.title}
                  </Typography.Title>
                  {lvnzyProject!.score?.[sc.key] ? (
                    <GradientBar
                      value={getCategoryScore(lvnzyProject!.score[sc.key])}
                      showBadgeOnly={true}
                    ></GradientBar>
                  ) : null}
                </Flex>

                {sc.dataPoints &&
                sc.dataPoints.filter(
                  (dp: any[]) => !["_id", "openAreaRating"].includes(dp[0])
                ).length ? (
                  <List
                    size="large"
                    style={{ borderRadius: 16, cursor: "pointer" }}
                    dataSource={Object.keys((Brick360DataPoints as any)[sc.key])
                      .map((d) => {
                        return sc.dataPoints.find((dp: any) => dp[0] == d);
                      })
                      .filter((d) => !!d)}
                    renderItem={(item, index) => (
                      <List.Item
                        key={`p-${index}`}
                        style={{
                          padding: "8px",
                          borderBottom: "1px solid",
                          borderBottomColor: COLORS.borderColor,
                          backgroundColor: "white",
                          borderTopLeftRadius: index == 0 ? 8 : 0,
                          borderTopRightRadius: index == 0 ? 8 : 0,
                          borderBottomLeftRadius:
                            index ==
                            Object.keys((Brick360DataPoints as any)[sc.key])
                              .length -
                              1
                              ? 8
                              : 0,
                          borderBottomRightRadius:
                            index ==
                            Object.keys((Brick360DataPoints as any)[sc.key])
                              .length -
                              1
                              ? 8
                              : 0,
                        }}
                        onClick={() => {
                          setDetailsModalOpen(true);
                          setSelectedDataPointCategory(sc.key);
                          setSelectedDataPointSubCategory((item as any)[0]);
                          setSelectedDataPoint((item as any)[1]);
                          setSelectedDataPointTitle(
                            `${sc.title} > ${
                              (Brick360DataPoints as any)[sc.key][
                                (item as any)[0]
                              ]["label"]
                            }`
                          );
                        }}
                      >
                        <Flex align="center" style={{ width: "100%" }}>
                          <Typography.Text
                            style={{
                              fontSize: FONT_SIZE.HEADING_4,
                              width: "60%",
                              color:
                                (item as any)[1].rating > 0
                                  ? COLORS.textColorDark
                                  : COLORS.textColorLight,
                            }}
                          >
                            {capitalize(
                              (Brick360DataPoints as any)[sc.key][
                                (item as any)[0]["label"]
                              ]
                            )}
                          </Typography.Text>
                          <Flex
                            style={{
                              width: "40%",
                              height: 24,
                              justifyContent: "flex-end",
                            }}
                          >
                            <RatingBar
                              value={(item as any)[1].rating}
                            ></RatingBar>
                          </Flex>
                        </Flex>
                      </List.Item>
                    )}
                  />
                ) : (
                  <Alert
                    message="There are no other projects by the developer in the state of Karnataka yet. Please make sure to check track record in other states.   "
                    type="warning"
                  />
                )}
              </Flex>
            );
          })}
      </Flex>

      {/* Full map view modal */}
      <Modal
        title={null}
        open={isMapFullScreen}
        onCancel={() => {
          setIsMapFullScreen(false);
          setDetailsModalOpen(true);
        }}
        forceRender
        footer={null}
        width={isMobile ? "100%" : 900}
        style={{ top: 30 }}
        styles={{
          content: {
            backgroundColor: COLORS.bgColorMedium,
            borderRadius: 8,
            padding: 16,
            overflowY: "hidden",
          },
        }}
      >
        <Flex style={{ height: 650, paddingTop: 40 }} vertical gap={8}>
          <MapViewV2
            fullSize={true}
            surroundingElements={surroundingElements}
            projectId={lvnzyProject?.originalProjectId._id}
            drivers={mapDrivers.map((d) => {
              return {
                id: d.driverId._id,
                duration: d.durationMins
                  ? d.durationMins
                  : Math.round(d.mapsDurationSeconds / 60),
              };
            })}
          />
        </Flex>
      </Modal>

      {/* Pros/Cons Modal */}
      {lvnzyProject?.score.summary && (
        <Modal
          footer={null}
          height={600}
          open={quickSnapshotDialogOpen}
          closable={true}
          style={{ top: 40 }}
          onCancel={() => {
            setQuickSnapshotDialogOpen(false);
          }}
          onClose={() => {
            setQuickSnapshotDialogOpen(false);
          }}
        >
          <Flex
            vertical
            style={{ overflowY: "scroll", height: 600, scrollbarWidth: "none" }}
          >
            <Typography.Title level={3} style={{ margin: 0, marginBottom: 0 }}>
              360 Snapshot
            </Typography.Title>
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.PARA,
                marginBottom: 16,
                color: COLORS.textColorLight,
                lineHeight: "120%",
              }}
            >
              Brief summary including highlights for this project.
            </Typography.Text>
            <Flex gap={8} vertical>
              <Flex>
                <Tag color={COLORS.greenIdentifier}>PROS</Tag>
              </Flex>
              {lvnzyProject?.score.summary.pros.map((pro: string) => {
                return (
                  <Flex
                    style={{
                      maxWidth: 500,
                      backgroundColor: COLORS.bgColorMedium,
                      borderRadius: 8,
                      borderColor: COLORS.borderColorMedium,
                      padding: 8,
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: pro }}
                      className="reasoning"
                      style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
                    ></div>
                  </Flex>
                );
              })}
              <Flex style={{ marginTop: 24 }}>
                <Tag color={COLORS.redIdentifier}>CONS</Tag>
              </Flex>
              {lvnzyProject?.score.summary.cons.map((pro: string) => {
                return (
                  <Flex
                    style={{
                      maxWidth: 500,
                      backgroundColor: COLORS.bgColorMedium,
                      borderRadius: 8,
                      borderColor: COLORS.borderColorMedium,
                      padding: 8,
                    }}
                  >
                    <div
                      dangerouslySetInnerHTML={{ __html: pro }}
                      className="reasoning"
                      style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
                    ></div>
                  </Flex>
                );
              })}
            </Flex>
          </Flex>
        </Modal>
      )}

      {/* Price point & payment modal */}
      <Modal
        footer={null}
        height={600}
        open={!!pmtDetailsModalContent}
        closable={true}
        style={{ top: 40 }}
        styles={{
          content: {
            padding: 16,
          },
        }}
        onCancel={() => {
          setPmtDetailsModalContent(undefined);
        }}
        onClose={() => {
          setPmtDetailsModalContent(undefined);
        }}
      >
        <Flex
          style={{ height: 600, overflowY: "scroll", scrollbarWidth: "none" }}
        >
          {pmtDetailsModalContent}
        </Flex>
      </Modal>

      {/* Bottom drawer to show a selected data point */}
      <Drawer
        title={null}
        placement="bottom"
        styles={{
          body: {
            padding: 0,
          },
          header: {
            padding: 16,
          },
        }}
        rootStyle={{
          maxWidth: 900,
          marginLeft: isMobile ? 0 : "calc(50% - 450px)",
        }}
        extra={
          <Space>
            <Button
              onClick={() => {
                setDetailsModalOpen(false);
                if (!isMapFullScreen) {
                  chatRef.current?.clearChatData();
                }
              }}
            >
              Close
            </Button>
          </Space>
        }
        closable={false}
        height={Math.min(700, window.innerHeight * 0.8)}
        onClose={() => {
          setDetailsModalOpen(false);
          if (!isMapFullScreen) {
            chatRef.current?.clearChatData();
          }
        }}
        open={detailsModalOpen}
      >
        <Flex
          vertical
          style={{
            position: "relative",
            overflowY: "scroll",
            paddingBottom: 64,
          }}
        >
          {/* Map view including expand button and drawer close icon button */}
          {mapVisible ? (
            <Flex vertical style={{ position: "relative" }}>
              {renderDrawerCloseBtn()}
              <Flex
                style={{
                  position: "absolute",
                  bottom: 16,
                  right: 16,
                  zIndex: 9999,
                }}
              >
                <Button
                  size="small"
                  icon={
                    <DynamicReactIcon
                      iconName="FaExpand"
                      color="white"
                      iconSet="fa"
                      size={16}
                    />
                  }
                  style={{
                    marginLeft: "auto",
                    marginBottom: 8,
                    borderRadius: 8,
                    cursor: "pointer",
                    backgroundColor: COLORS.textColorDark,
                    color: "white",
                    fontSize: FONT_SIZE.SUB_TEXT,
                    height: 28,
                  }}
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setIsMapFullScreen(true);
                  }}
                >
                  Expand
                </Button>
              </Flex>
              <Flex
                style={{
                  height: isMobile ? 200 : 300,
                  width: "100%",
                  borderRadius: 16,
                }}
              >
                <MapViewV2
                  projectId={lvnzyProject?.originalProjectId._id}
                  surroundingElements={surroundingElements}
                  drivers={mapDrivers.map((d) => {
                    return {
                      id: d.driverId._id,
                      duration: d.durationMins
                        ? d.durationMins
                        : Math.round(d.mapsDurationSeconds / 60),
                    };
                  })}
                  fullSize={false}
                />
              </Flex>
            </Flex>
          ) : null}

          {/* Close button when map view is absent */}
          {!mapDrivers || !mapDrivers.length ? renderDrawerCloseBtn() : null}

          {/* Rest of the content including title, markdown content and chatbox */}
          <Flex vertical style={{ padding: 16 }}>
            <Typography.Title level={4} style={{ margin: "8px 0" }}>
              {selectedDataPointTitle}
            </Typography.Title>
            {selectedDataPointCategory == "developer" && (
              <Typography.Title level={5} style={{ margin: "8px 0" }}>
                {lvnzyProject?.originalProjectId?.info?.developerId?.name || "Developer"}
              </Typography.Title>
            )}
            <Flex vertical gap={16}>
              {selectedDataPoint
                ? selectedDataPoint.reasoning.map((r: string) => {
                    return (
                      <Flex
                        style={{
                          maxWidth: 500,
                          backgroundColor: COLORS.bgColorMedium,
                          borderRadius: 8,
                          borderColor: COLORS.borderColorMedium,
                          padding: 8,
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: r }}
                          className="reasoning"
                          style={{ fontSize: FONT_SIZE.HEADING_4, margin: 0 }}
                        ></div>
                      </Flex>
                    );
                  })
                : ""}
            </Flex>

            <Divider></Divider>

            {/* <Flex style={{ width: "100%" }}>
              <Brick360Chat
                ref={chatRef}
                dataPointCategory={selectedDataPointCategory}
                dataPoint={selectedDataPointTitle}
                lvnzyProjectId={lvnzyProjectId!}
              ></Brick360Chat>
            </Flex> */}
          </Flex>
        </Flex>
      </Drawer>

      {/* Configurations List */}
      <Modal
        title={null}
        closable={true}
        footer={null}
        open={isConfigurationsModalOpen}
        onOk={() => {
          setIsConfigurationsModalOpen(false);
        }}
        onCancel={() => {
          setIsConfigurationsModalOpen(false);
        }}
      >
        <Typography.Title style={{ margin: 0, marginBottom: 16 }} level={3}>
          Configurations/Pricing
        </Typography.Title>
        {lvnzyProject?.meta.projectConfigurations && (
          <Flex>
            {/* {lvnzyProject?.meta.projectConfigurations.unitsBreakup && (
              <>
                <Tag>
                  {lvnzyProject?.meta.projectConfigurations.towers.length}{" "}
                  Towers
                </Tag>
                <Tag> {getTotalFloors(lvnzyProject)} Floors</Tag>
              </>
            )} */}
            {lvnzyProject?.meta.projectConfigurations.unitsBreakup && (
              <Tag>{lvnzyProject?.property.layout.totalUnits} Units</Tag>
            )}
            {lvnzyProject?.property.layout.totalLandArea && (
              <Tag>
                {Math.round(
                  lvnzyProject?.property.layout.totalLandArea / 4046.8564
                )}{" "}
                Acre
              </Tag>
            )}
          </Flex>
        )}
        <Flex
          vertical
          style={{
            marginTop: 16,
            maxHeight: 400,
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
          gap={16}
        >
          {lvnzyProject!.meta.costingDetails.configurations.map((c: any) => {
            return (
              <Flex
                vertical
                style={{
                  borderLeft: "1px solid",
                  paddingLeft: 8,
                  borderLeftColor: COLORS.borderColorMedium,
                }}
              >
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
                  ₹{rupeeAmountFormat(c.cost)}
                </Typography.Text>
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3 }}>
                  {c.config}
                </Typography.Text>
              </Flex>
            );
          })}
        </Flex>
      </Modal>
    </Flex>
  );
}
