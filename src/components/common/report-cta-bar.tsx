import { safeWindow } from "@/libs/browser-utils";
import { LandingConstants } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Flex, Typography } from "antd";

type ReportCTABarProps = {
  msg?: string;
};

const ReportCTABar: React.FC<ReportCTABarProps> = ({ msg }) => {
  return (
    <Flex
      align="center"
      gap={16}
      style={{
        cursor: "pointer",
        backgroundColor: COLORS.primaryColor,
        borderRadius: 4,
        margin: "16px 0",
        padding: 8,
        maxWidth: 500,
      }}
      onClick={() => {
        safeWindow.location.assign(LandingConstants.genReportFormLink);
      }}
    >
      <img src="/images/real-estate-dev/report-cta-icon.png" height={60}></img>
      <Flex vertical>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_2, color: "white" }}
        >
          Get a free Brick360 Report.
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.PARA,
            color: "white",
            lineHeight: "110%",
          }}
        >
          {msg || LandingConstants.brick360Descr}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

export default ReportCTABar;