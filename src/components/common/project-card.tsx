import { Flex, Tag, Tooltip, Typography } from "antd";
import { rupeeAmountFormat } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { IMedia, Project } from "../../types/Project";
import ProjectGallery from "../project-gallery";
const { Paragraph, Text } = Typography;

interface ProjectCardProps {
  project: Project;
  showClick: boolean;
  onProjectClick?: any;
  fullWidth?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  showClick,
  onProjectClick,
  fullWidth,
}) => {
  if (!project || !project.metadata || !project.metadata.name) {
    return;
  }
  let costingDetails;

  let previewImage;
  if (project.media) {
    previewImage = project.media.find((m: IMedia) => m.isPreview);
    previewImage = previewImage || project.media[0];
    previewImage = previewImage?.image?.url;
  }
  return (
    <Flex
      className="fade-in-style"
      vertical
      style={{
        cursor: "pointer",
        width: fullWidth ? "100%" : 185,
        padding: 0,
      }}
    >
      <Flex vertical>
        <Flex
          style={{ width: "100%", marginTop: 8, padding: "0px 4px" }}
          vertical
        >
          <Flex>
            <Tooltip title={project.metadata.name}>
              <Paragraph
                ellipsis={{ rows: 1, expandable: false }}
                style={{
                  margin: 0,
                  fontSize: FONT_SIZE.HEADING_3,
                  lineHeight: "100%",
                  fontWeight: 500,
                }}
              >
                {project.metadata.name}
              </Paragraph>
            </Tooltip>
          </Flex>

          {/* <Flex>
                <Tag
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    padding: "4px 8px",
                    lineHeight: "100%",
                    marginTop: 4,
                    border: "1px solid",
                    color: "white",
                    backgroundColor: COLORS.textColorDark,
                  }}
                >
                  {capitalize(project.metadata.homeType[0])}
                </Tag>
              </Flex> */}
          {project.ui && project.ui.costingDetails ? (
            <Flex>
              <Paragraph
                ellipsis={{ rows: 1, expandable: false }}
                style={{
                  display: "inline",
                  fontSize: fullWidth ? FONT_SIZE.HEADING_3 : FONT_SIZE.PARA,
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {rupeeAmountFormat(project.ui.costingDetails.singleUnitCost)} /{" "}
                {project.ui.costingDetails.singleUnitSize} sqft
              </Paragraph>
            </Flex>
          ) : null}

          {project.ui && project.ui.oneLiner ? (
            <Tooltip title={project.relevantDetails || project.ui.oneLiner}>
              <Paragraph
                ellipsis={{ rows: 2, expandable: false }}
                style={{
                  whiteSpace: "wrap",
                  lineHeight: "110%",
                  marginTop: 4,
                  height: 32,
                  marginBottom: 8,
                  fontSize: fullWidth ? FONT_SIZE.HEADING_3 : FONT_SIZE.PARA,
                  color: COLORS.textColorLight,
                }}
              >
                {project.relevantDetails || project.ui.oneLiner}
              </Paragraph>
            </Tooltip>
          ) : null}
        </Flex>

        {fullWidth ? (
          <ProjectGallery media={project.media}></ProjectGallery>
        ) : (
          <div
            style={{
              borderRadius: 8,
              height: fullWidth ? 225 : 150,
              width: "100%",
              border: "1px solid",
              borderColor: COLORS.borderColor,
              backgroundImage: `url(${
                previewImage || "/images/img-plchlder.png"
              })`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
        )}

        {showClick && (
          <Flex
            style={{ marginTop: 8 }}
            onClick={() => {
              onProjectClick();
            }}
          >
            <Tag>More Details</Tag>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

function DescText({ text }: { text: string }) {
  return (
    <Typography.Text
      style={{
        fontSize: "14px",
      }}
      color={COLORS.textColorLight}
    >
      {text}
    </Typography.Text>
  );
}

function SeparatorDot() {
  return (
    <span
      style={{
        width: 3,
        height: 3,
        backgroundColor: COLORS.textColorLight,
      }}
    ></span>
  );
}
