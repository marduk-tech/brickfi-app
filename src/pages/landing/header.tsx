import { Dropdown, Flex } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import Link from "antd/es/typography/Link";
import { useDevice } from "../../hooks/use-device";
import { LandingConstants } from "../../libs/constants";
import DynamicReactIcon from "../../components/common/dynamic-react-icon";

const LandingHeader: React.FC<{
  bgColor?: string;
  color?: string;
  logo?: string;
}> = ({ bgColor, color, logo }) => {
  const { isMobile } = useDevice();
  const navItems = [
    {
      link: LandingConstants.genReportLink,
      label: "Brick360 Report",
    },
    {
      link: LandingConstants.blogLink,
      label: "Blog",
    },
    {
      link: LandingConstants.brickAssistLink,
      label: "Brickfi Assist",
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
        backgroundColor: bgColor || "#fdf7f6",
      }}
      align="center"
    >
      <Flex
        onClick={() => {
          window.location.assign("/");
        }}
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <img src={logo || "/images/brickfi-logo.png"} height="20"></img>
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
                href={item.link}
                style={{
                  color: color || COLORS.textColorMedium,
                  fontSize: FONT_SIZE.PARA,
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
