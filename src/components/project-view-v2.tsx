import { Flex, Typography } from "antd";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDevice } from "../hooks/use-device";
import { useFetchProjectById } from "../hooks/use-project";
import { captureAnalyticsEvent, rupeeAmountFormat } from "../libs/lvnzy-helper";
import { sortedMedia } from "../libs/utils";
import "../theme/scroll-bar.css";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { Project } from "../types/Project";
import { Loader } from "./common/loader";
import ProjectGallery from "./project-gallery";

const CostSnapshot: React.FC<{ project: Project }> = ({ project }) => {
  const costingDetails = project.ui.costingDetails;
  const { isMobile } = useDevice();
  const { projectId } = useParams();

  return (
    <Flex vertical>
      <Flex align="flex-end">
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.HEADING_2,
            lineHeight: "100%",
          }}
        >
          ₹{rupeeAmountFormat(costingDetails.singleUnitCost)}
        </Typography.Text>

        <Typography.Text
          style={{
            margin: "0 8px",
            lineHeight: "100%",
            fontSize: FONT_SIZE.HEADING_3,
          }}
        >
          /
        </Typography.Text>

        <Typography.Text
          style={{
            margin: 0,
            lineHeight: "100%",
            fontSize: FONT_SIZE.HEADING_3,
          }}
        >
          {costingDetails.singleUnitSize} sqft
        </Typography.Text>
      </Flex>
      {costingDetails.sqftRate ? (
        <Typography.Text style={{ color: COLORS.textColorLight }}>
          Priced at ₹{costingDetails.sqftRate} per sqft.{" "}
          {costingDetails.details ? costingDetails.details : ""}
        </Typography.Text>
      ) : null}
    </Flex>
  );
};

const ProjectViewV2: React.FC<{
  projectId: string;
}> = ({ projectId }) => {
  const { data: projectData, isLoading: projectDataLoading } =
    useFetchProjectById(projectId!);

  const [toggleMapView, setToggleMapView] = useState(false);

  if (!projectData) {
    return <Loader></Loader>;
  }

  const sortedMediaArray = sortedMedia({
    media: projectData.media.filter((m) => m.type == "image"),
    setPreviewInFirstPlace: false,
  });

  const videoMedia = projectData.media.filter(
    (media) => media.type === "video"
  );

  console.log(projectData.media);
  console.log("Sorted Media:", sortedMediaArray);
  console.log("Video Media:", videoMedia);

  const allMedia = [...sortedMediaArray, ...videoMedia];
  console.log("All Media:", allMedia);

  captureAnalyticsEvent("app-projectpage-open", { projectId: projectData._id });

  return (
    <>
      <Flex
        vertical
        className="fade-in-style"
        style={{
          width: "100%",
        }}
      >
        <ProjectGallery media={allMedia} />
        <Flex align="flex-start" style={{ marginTop: 16 }}>
          <Flex vertical>
            <Flex>
              <Typography.Text
                style={{ margin: 0, fontSize: FONT_SIZE.HEADING_1 }}
              >
                {projectData.metadata.name}
              </Typography.Text>
            </Flex>

            <Typography.Text
              style={{
                margin: 0,
                fontSize: FONT_SIZE.HEADING_4,
                color: COLORS.textColorLight,
              }}
            >
              {projectData.ui.oneLiner}
            </Typography.Text>
          </Flex>
        </Flex>

        <CostSnapshot project={projectData} />
      </Flex>
    </>
  );
};

export default ProjectViewV2;
