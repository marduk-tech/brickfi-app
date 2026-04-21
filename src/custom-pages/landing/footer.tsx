"use client";

import { Flex, Typography } from "antd";
import Link from "next/link";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LandingConstants } from "../../libs/constants";

export default function LandingFooter() {
  const { isMobile } = useDevice();

  return (
    <Flex
      align="center"
      vertical
      style={{
        padding: isMobile ? "32px 16px" : "32px 0",
        textAlign: "center",
        backgroundColor: COLORS.textColorDark,
      }}
    >
      
      <Flex
        style={{ width: isMobile ? "100%" : "95%", marginTop: 16,  }}
        vertical={isMobile}
      >
        <Flex
          vertical
          style={{
            textAlign: "left",
            width: "100%",
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
              maxWidth: isMobile ? "100%" : 500,
            }}
          >
            Brickfi is a real estate platform, committed to transparency and
            trust. We offer reliable guidance and verified properties to help
            you make confident decisions.
          </Typography.Text>
        </Flex>

        <Flex
          gap={isMobile ? 16 : 48}
          style={{
            marginTop: isMobile ? 32 : 0,
            width: isMobile ? "100%" : "45%",
          }}
          align="flex-start"
        >
          <Flex
            vertical
            style={{
              textAlign: "left",
            }}
          >
            <Link
              href="https://www.brickfi.in/real-estate-developer"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              Real Esate Developers
            </Link>
            <Link
              href="https://www.brickfi.in/glossary"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              Real Estate Glossary
            </Link>

            <Link
              href="https://blog.brickfi.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              Brickfi Blog
            </Link>
          </Flex>

          <Flex vertical align="flex-start">
            <Link
              href="/app"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              Brickfi App
            </Link>
            <Link
              href={`${LandingConstants.callbackLink}?srcIntent=footer`}
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              Consult For Free
            </Link>
            <Link
              href="/aboutus"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              About Us
            </Link>
            <Link
              href="/aboutus"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              Help
            </Link>
          </Flex>

          <Flex
            vertical
            style={{
              textAlign: "left",
            }}
            align="flex-start"
          >
            <Link
              href="https://www.linkedin.com/company/brickfi"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              LinkedIn
            </Link>
            <Link
              href={LandingConstants.instaLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              Instagram
            </Link>
            <Link
              href={LandingConstants.twitterLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: COLORS.textColorLight,
                fontSize: FONT_SIZE.PARA,
                textDecoration: "none",
              }}
            >
              X/Twitter
            </Link>
          </Flex>
        </Flex>
        
      </Flex>
      <div style={{borderBottom: "0.2px solid #666", width: isMobile ? "100%":"600px", marginBottom: 32, alignSelf: "flex-start", marginLeft: isMobile ? 0: "2.5%"}}>&nbsp;</div>
      <Flex vertical style={{width: isMobile ? "100%": "95%", marginTop: 0}}>
        <Flex vertical={isMobile} gap={32} style={{ margin: "16px 0" }}>
          <img src="/images/stin.png" height="auto" width={isMobile ? 175: 125}></img>
          <Flex vertical>
            <Typography.Text
              style={{
                color: COLORS.textColorMedium,
                fontSize: FONT_SIZE.SUB_TEXT,
                textAlign: "left"
              }}
            >
              REGISTERED RERA ENTITY
            </Typography.Text>
            <Typography.Text
              style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textAlign: "left" }}
            >
              PRM/KA/RERA/1251/446/AG/240715/004976
            </Typography.Text>
          </Flex>
        </Flex>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorMedium,
            marginTop: 8,
            textAlign: "left"
          }}
        >
          © 2026 | Marduk Technologies Private Ltd
        </Typography.Text>
      </Flex>
    </Flex>
  );
}
