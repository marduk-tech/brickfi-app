"use client";

import { Dropdown, Flex, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LandingConstants } from "../../libs/constants";
import DynamicReactIcon from "../../components/common/dynamic-react-icon";
import { useDevice } from "../../hooks/use-device";

const LandingHeader: React.FC<{
  bgColor?: string;
  color?: string;
  logo?: string;
  isMobile?: boolean;
}> = ({ bgColor, color, logo, isMobile: isMobileProp }) => {
  const router = useRouter();
  const { isMobile: isMobileDetected } = useDevice();
  const isMobile = isMobileProp ?? isMobileDetected;
  const navItems = [
    {
      link: "/",
      label: "Brick360 Report",
    },
    {
      link: LandingConstants.brickAssistLink,
      label: "Brickfi Assist",
    },
    {
      link: LandingConstants.blogLink,
      label: "Blog",
    },
    {
      link: LandingConstants.appLink,
      label: "My Account",
    },
  ];

  return (
    <Flex
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        padding: 16,
        backgroundColor: bgColor || "#32495e",
        zIndex: 1000
      }}
      align="center"
    >
      <Flex
        onClick={() => {
          router.push("/");
        }}
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <img src={logo || "/images/brickfi-logo-white.png"} height="20"></img>
      </Flex>
      
      <Flex
        style={{
          marginLeft: "auto",
          marginRight: 32,
          color: color || COLORS.textColorMedium,
        }}
        gap={16}
      >
        {isMobile ? (
          <Dropdown
            menu={{
              items: navItems.map((item) => {
                return {
                  key: item.label,
                  label: (
                    <Link
                      href={item.link}
                      style={{
                        color: COLORS.textColorMedium,
                        fontSize: FONT_SIZE.HEADING_2,
                        textDecoration: 'none'
                      }}
                    >
                      {item.label}
                    </Link>
                  ),
                };
              }),
            }}
          >
            <a onClick={(e) => e.preventDefault()}>
              <DynamicReactIcon
                iconName="RiMenu3Line"
                iconSet="ri"
                size={24}
                color={color || COLORS.textColorDark}
              ></DynamicReactIcon>
            </a>
          </Dropdown>
        ) : (
          navItems.map((item) => {
            return (
              <Link
                key={item.label}
                href={item.link}
                style={{
                  color: color || COLORS.textColorLight,
                  fontSize: FONT_SIZE.PARA,
                  textDecoration: 'none',
                  textShadow: color ? "0.5px 0.5px 0 white" : "none"
                }}
              >
                {item.label}
              </Link>
            );
          })
        )}
      </Flex>
    </Flex>
  );
};

export default LandingHeader;
