import { Flex, Typography } from "antd";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import Link from "antd/es/typography/Link";
import { LandingConstants } from "../../libs/constants";

export function LandingFooter() {
  const { isMobile } = useDevice();

  return (
    <Flex
      align="center"
      vertical
      style={{
        padding: isMobile ? "64px 16px" : "64px 0",
        textAlign: "center",
        backgroundColor: COLORS.textColorDark,
      }}
    >
      <img
        src="/images/landing/divider.png"
        width={isMobile ? "80%" : "30%"}
      ></img>
      <Flex
        style={{ width: isMobile ? "100%" : "85%", marginTop: 40 }}
        vertical={isMobile}
      >
        <Flex
          vertical
          style={{
            width: isMobile ? "100%" : "80%",
            textAlign: isMobile ? "center" : "left",
          }}
        >
          <Typography.Text
            style={{
              color: COLORS.textColorLight,
              fontSize: FONT_SIZE.HEADING_3,
              fontWeight: 800,
            }}
          >
            brickfi
          </Typography.Text>
          <Typography.Text
            style={{
              color: COLORS.textColorLight,
              fontSize: FONT_SIZE.PARA,
              width: isMobile ? "100%" : "40%",
            }}
          >
            Brickfi is a real estate platform, committed to transparency and
            trust. We offer reliable guidance and verified properties to help
            you make confident decisions.
          </Typography.Text>
        </Flex>

        <Flex
          vertical
          style={{ marginTop: isMobile ? 32 : 0 }}
          align={isMobile ? "center" : "flex-start"}
        >
          <Link
            href="/app"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA }}
          >
            Brickfi App
          </Link>
          <Link
            href={LandingConstants.brickAssistLink}
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA }}
          >
            Consult With Us
          </Link>
          <Link
            href="/aboutus"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA }}
          >
            About Us
          </Link>
          <Link
            href="/aboutus"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA }}
          >
            Help
          </Link>
        </Flex>
        <Flex
          vertical
          style={{
            marginLeft: isMobile ? "0" : "auto",
            marginTop: isMobile ? 24 : 0,
          }}
          align={isMobile ? "center" : "flex-start"}
        >
          <Link
            href="https://blog.brickfi.in"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA }}
          >
            Blog
          </Link>
          <Link
            href={LandingConstants.instaLink}
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA }}
          >
            Instagram
          </Link>
        </Flex>
      </Flex>
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.PARA,
          color: COLORS.textColorLight,
          marginTop: 48,
        }}
      >
        Copyright @Marduk Technologies Private Ltd
      </Typography.Text>
    </Flex>
  );
}
