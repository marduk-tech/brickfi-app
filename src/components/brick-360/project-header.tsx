import { Flex, Typography } from "antd";
import MetaInfo from "./meta-info";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { forwardRef } from "react";

interface ProjectHeaderProps {
  lvnzyProject: any;
}

export const ProjectHeader = forwardRef<any, ProjectHeaderProps>(
  ({ lvnzyProject }, ref) => {
    return (
      <>
        {/* Main project upfront score card including metadata */}
        <Flex vertical style={{ padding: "0 8px" }}>
          <Flex
            vertical
            style={{
              alignItems: "flex-start",
            }}
            gap={8}
          >
            <Typography.Text
              style={{
                margin: "0",
                lineHeight: "100%",
                fontSize: FONT_SIZE.HEADING_3,
                textTransform: "uppercase",
                color: COLORS.textColorMedium,
              }}
            >
              {lvnzyProject?.originalProjectId?.info?.developerId?.name || "Developer"}
            </Typography.Text>
            <Typography.Text
              style={{
                margin: "0",
                lineHeight: "100%",
                fontSize: FONT_SIZE.HEADING_1,
                fontWeight: 500,
              }}
            >
              {lvnzyProject?.meta.projectName}
            </Typography.Text>
          </Flex>
        </Flex>

        {/* One liner & timeline */}
        <Flex vertical style={{ marginBottom: 8, padding: "0 8px" }}>
          <MetaInfo lvnzyProject={lvnzyProject!} ref={ref}></MetaInfo>
        </Flex>
      </>
    );
  }
);
