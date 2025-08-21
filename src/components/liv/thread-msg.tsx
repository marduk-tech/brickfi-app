import { LoadingOutlined } from "@ant-design/icons";
import { Button, Flex, Modal, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "../../theme/style-constants";
import { Project } from "../../types/Project";
import remarkGfm from "remark-gfm";

import DynamicReactIcon from "../common/dynamic-react-icon";
import { ProjectCard } from "../common/project-card";
import { MapView } from "../map-view/map-old/map-view";
import ProjectsViewV2 from "../projects-view-v2";
import { AICuratedProject, LivAnswer } from "./liv-v3";

const ID_MATCH_REGEX = /([a-f0-9]{24})/;

const ThreadMsg: React.FC<{
  question: string;
  answer: LivAnswer;
  streaming: boolean;
  allProjects: Project[];
  handleProjectClick: any;
}> = ({ question, answer, streaming, allProjects, handleProjectClick }) => {
  const { isMobile } = useDevice();
  const [toggleMapView, setToggleMapView] = useState(false);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [questionToDisplay, setQuestionToDisplay] = useState<string>("");

  const refineProjectList = (
    curatedProjects: (AICuratedProject | Project)[]
  ) => {
    if (
      curatedProjects &&
      curatedProjects.length &&
      curatedProjects[0].relevantDetails
    ) {
      const formattedProjects: any = [];
      (curatedProjects as AICuratedProject[]).forEach((p: AICuratedProject) => {
        if (p.relevancyScore >= 3) {
          formattedProjects.push({
            ...allProjects!.find((op: any) => op._id == p.projectId),
            ...p,
          });
        }
      });
      formattedProjects.sort((a: any, b: any) => {
        return (b.relevancyScore || 0) - (a.relevancyScore || 0);
      });
      return formattedProjects;
    }
    return curatedProjects;
  };

  useEffect(() => {
    if (question) {
      const idMatch = question.match(ID_MATCH_REGEX);
      if (idMatch) {
        const project = allProjects.find((p) => p._id == idMatch[1]);
        setQuestionToDisplay(`more about ${project?.metadata.name}`);
      } else {
        setQuestionToDisplay(question);
      }
    }
  }, [question]);

  const renderMapView = (fullScreen: boolean = false) => {
    const projects = answer.projectId
      ? [allProjects!.find((p: any) => p._id == answer.projectId)!]
      : answer.projects && answer.projects.length
      ? refineProjectList(answer.projects).slice(0, 20)
      : [];

    return (
      <Flex
        style={{
          width: fullScreen ? "95vw" : isMobile ? window.innerWidth : MAX_WIDTH,
          height: fullScreen ? "calc(95vh - 55px)" : 350,
          maxWidth: fullScreen ? "95vw" : undefined,
        }}
      >
        <MapView
          projects={projects}
          drivers={answer.drivers || []}
          onProjectClick={(clickedProjectId: string) => {
            if (!streaming) {
              handleProjectClick(clickedProjectId);
            }
          }}
        />
      </Flex>
    );
  };

  return (
    <Flex vertical style={{ marginBottom: 16, padding: 0 }}>
      <Flex align="center" gap={8} style={{ padding: isMobile ? "0 16px" : 0 }}>
        {streaming && (
          <img
            src="/images/liv-streaming.gif"
            style={{
              height: 28,
              width: 28,
            }}
          />
        )}
        {question && (
          <Typography.Text
            style={{
              backgroundColor: streaming
                ? COLORS.bgColor
                : COLORS.textColorDark,
              padding: "4px 12px",
              borderRadius: 16,
              border: "1px solid",
              color: streaming ? COLORS.textColorLight : "white",
              borderColor: COLORS.borderColorMedium,
              display: "inline",
              alignSelf: "flex-start",
              marginTop: 8,
              marginBottom: 8,
            }}
          >
            {questionToDisplay}
          </Typography.Text>
        )}
      </Flex>
      {answer.details && (
        <Flex style={{ padding: isMobile ? "0 16px" : 0 }} vertical>
          <Markdown remarkPlugins={[remarkGfm]} className="liviq-content">
            {answer.details}
          </Markdown>
        </Flex>
      )}

      {/* Dynamic Content */}
      {answer.projectId ||
      (answer.projects && answer.projects.length) ||
      (answer.drivers && answer.drivers.length) ? (
        <Flex
          vertical
          style={{
            marginBottom: 16,
            borderRadius: isMobile ? 0 : 4,
            marginTop: 16,
            padding: "24px 0",
            borderTop: "1px solid",
            borderTopColor: COLORS.borderColorMedium,
          }}
        >
          {answer.projectId || (answer.projects && answer.projects.length) ? (
            <Flex
              align="flex-start"
              gap={8}
              style={{
                alignItems: "center",
                marginBottom: 16,
                padding: "0 8px",
              }}
            >
              {!answer.projectId ? (
                streaming ? (
                  <Spin indicator={<LoadingOutlined spin />} size="small" />
                ) : answer.projects && answer.projects.length ? (
                  <Typography.Text style={{ color: COLORS.textColorLight }}>
                    Showing {Math.min(answer.projects.length, 20)} projects
                  </Typography.Text>
                ) : null
              ) : null}
              <Flex gap={8} style={{ marginLeft: "auto" }}>
                {toggleMapView && (
                  <Button
                    size="small"
                    icon={
                      <DynamicReactIcon
                        iconName="FaExpand"
                        color="primary"
                        iconSet="fa"
                        size={16}
                      />
                    }
                    style={{
                      borderRadius: 8,
                      cursor: "pointer",
                      fontSize: FONT_SIZE.SUB_TEXT,
                      height: 28,
                    }}
                    onClick={() => setIsMapFullScreen(true)}
                  >
                    Expand
                  </Button>
                )}
                <Button
                  size="small"
                  icon={
                    !toggleMapView ? (
                      <DynamicReactIcon
                        iconName="FaMap"
                        color="primary"
                        iconSet="fa"
                        size={16}
                      />
                    ) : (
                      <DynamicReactIcon
                        iconName="FaRegListAlt"
                        iconSet="fa"
                        size={16}
                        color="primary"
                      />
                    )
                  }
                  style={{
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: FONT_SIZE.SUB_TEXT,
                    height: 28,
                  }}
                  onClick={() => {
                    setToggleMapView(!toggleMapView);
                  }}
                >
                  {toggleMapView
                    ? answer.projectId
                      ? "Gallery"
                      : "List"
                    : "Map"}{" "}
                  View
                </Button>
              </Flex>
            </Flex>
          ) : null}
          {answer.projectId ? (
            !toggleMapView ? (
              <Flex style={{ padding: "0 8px" }}>
                <ProjectCard
                  project={
                    allProjects!.find((p: any) => p._id == answer.projectId)!
                  }
                  showClick={false}
                  fullWidth={true}
                />
              </Flex>
            ) : (
              renderMapView()
            )
          ) : answer.projects && answer.projects.length ? (
            !toggleMapView ? (
              <Flex style={{ padding: "0 8px" }}>
                <ProjectsViewV2
                  projects={refineProjectList(answer.projects).slice(0, 20)}
                  projectClick={(
                    clickedProjectId: string,
                    projectName: string
                  ) => {
                    if (!streaming) {
                      handleProjectClick(clickedProjectId);
                    }
                  }}
                />
              </Flex>
            ) : (
              renderMapView()
            )
          ) : answer.drivers && answer.drivers.length ? (
            renderMapView()
          ) : null}
        </Flex>
      ) : null}

      <Modal
        title="Map View"
        open={isMapFullScreen}
        onCancel={() => setIsMapFullScreen(false)}
        footer={null}
        style={{
          top: 5,
        }}
        styles={{
          body: {
            height: "calc(95vh - 70px)",
            padding: 0,
            overflow: "hidden",
            borderRadius: 10,
          },
        }}
        wrapClassName="full-width-modal"
      >
        {renderMapView(true)}
      </Modal>
    </Flex>
  );
};

export default ThreadMsg;
