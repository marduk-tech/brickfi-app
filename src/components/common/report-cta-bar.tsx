import { safeWindow } from "@/libs/browser-utils";
import { LandingConstants } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex, Typography } from "antd";
import DynamicReactIcon from "./dynamic-react-icon";

type ReportCTABarProps = {
  msg?: string;
  title?: string;
  isMobile?: boolean;
};

const ReportCTABar: React.FC<ReportCTABarProps> = ({ msg, title, isMobile }) => {
  return (
    <Flex
      align="center"
      gap={16}
      style={{
        cursor: "pointer",
        borderRadius: 4,
        margin: "16px 0",
        padding: 8,
        width: "100%"
      }}
      justify="center"
      onClick={() => {
        safeWindow.location.assign(LandingConstants.genReportFormLink);
      }}
    >
      <img src="/images/real-estate-dev/report-cta-icon.png" height={120}></img>
      <Flex vertical>
        <Flex align="center" gap={4}>
          <DynamicReactIcon
            color={COLORS.primaryColor}
            size={16}
            iconName="TbView360Number"
            iconSet="tb"
          ></DynamicReactIcon>
          <Typography.Text
            style={{
              fontSize: 18,
              color: COLORS.primaryColor,
              lineHeight: "100%",
              fontWeight: 500,
            }}
          >
            BRICK360° REPORT
          </Typography.Text>
        </Flex>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500, width: isMobile ? "100%" : 500 }}
        >
          {title || "Get a free Brick360 Report"}
        </Typography.Text>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.PARA,
            lineHeight: "110%",
             width: isMobile ? "100%" : 500 
          }}
        >
          {msg || LandingConstants.brick360Descr}
        </Typography.Text>
        <Button type="default" style={{ width: 150, height: 32, marginTop: 8 }}>
          Get 360 Report
        </Button>
      </Flex>
    </Flex>
  );
};

export default ReportCTABar;
