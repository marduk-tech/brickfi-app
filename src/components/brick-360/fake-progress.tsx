import { Flex, Progress, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

interface FakeProgressProps {
  progress: number;
  projectName: string;
}

export const FakeProgress = ({ progress, projectName }: FakeProgressProps) => {
  const progressWidth = window.innerWidth < 800 ? window.innerWidth : 800;

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
        }}
      >
        Loading Brick360 Report
      </Typography.Text>
      <Flex vertical style={{ marginTop: 16 }}>
        {" "}
        <Typography.Text
          style={{ padding: "0 8px", fontSize: FONT_SIZE.HEADING_2 }}
        >
          {progress < 35
            ? "Fetching Data"
            : progress < 70
            ? "Analysing"
            : "Finishing up"}
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
