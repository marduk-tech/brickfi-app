import { Flex, Progress, Typography } from "antd";
import { useWindowDimensions } from "../../hooks/use-browser-safe";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

interface FakeProgressProps {
  progress: number;
  projectName: string;
}

export const FakeProgress = ({ progress, projectName }: FakeProgressProps) => {
  const { width } = useWindowDimensions();
  const progressWidth = width < 800 ? width : 800;

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
      <Typography.Text
        style={{
          margin: 0,
          padding: 8,
          fontSize: FONT_SIZE.HEADING_1,
          textTransform: "uppercase",
          color: COLORS.primaryColor
        }}
      >
        Brick360 Report
      </Typography.Text>
      <Flex vertical style={{ marginTop: 16 }}>
        {" "}
        <Typography.Text
          style={{ padding: "0 8px", fontSize: FONT_SIZE.HEADING_2, marginBottom: -8, color: COLORS.textColorMedium }}
        >
          {progress < 35
            ? "Loading Report"
            : progress < 70
            ? "Loading Report"
            : "Loading Report"}
        </Typography.Text>
        <Progress
          strokeColor={COLORS.primaryColor}
          percent={progress}
          style={{ padding: 8 }}
        />
      </Flex>
    </Flex>
  );
};
