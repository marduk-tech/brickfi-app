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
        style={{ width: isMobile ? "100%" : "95%", marginTop: 40 }}
        vertical={isMobile}
      >
        <Flex
          vertical
          style={{
            textAlign: "left",
            width:"100%"
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
              maxWidth: isMobile ? "100%" : 500
            }}
          >
            Brickfi is a real estate platform, committed to transparency and
            trust. We offer reliable guidance and verified properties to help
            you make confident decisions.
          </Typography.Text>
        </Flex>
        
        <Flex gap={isMobile ? 16: 48} style={{marginTop: isMobile? 32: 0, width: isMobile ? "100%": "45%"}} align="flex-start" >
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
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
          >
           Real Esate Developers
          </Link>
          <Link
            href="https://www.brickfi.in/glossary"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
        >
            Real Estate Glossary
          </Link>
          
           <Link
            href="https://blog.brickfi.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
          >
            Brickfi Blog
          </Link>
        </Flex>

        <Flex
          vertical
         
          align="flex-start"
        >
          <Link
            href="/app"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
          >
            Brickfi App
          </Link>
          <Link
            href={LandingConstants.brickAssistLink}
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
          >
            Consult With Us
          </Link>
          <Link
            href="/aboutus"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
          >
            About Us
          </Link>
          <Link
            href="/aboutus"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
          >
            Help
          </Link>
        </Flex>
        
        
        <Flex
          vertical
          style={{
            textAlign: "left"
          }}
          align="flex-start"
        >
         <Link
            href="https://www.linkedin.com/company/brickfi"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
          >
            LinkedIn
          </Link>
          <Link
            href={LandingConstants.instaLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
        >
            Instagram
          </Link>
          <Link
            href={LandingConstants.twitterLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: COLORS.textColorLight, fontSize: FONT_SIZE.PARA, textDecoration: 'none' }}
          >
            X/Twitter
          </Link>
        </Flex>
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
