import { Flex } from "antd";
import { useDevice } from "../../hooks/use-device";
import { useWindowDimensions } from "../../hooks/use-browser-safe";
import { SectionCenter } from "./section";
import { LandingFooter } from "./footer";
import LandingHeader from "./header";

export function FourOFour() {
  const { isMobile } = useDevice();
  const { height } = useWindowDimensions();
  return (
    <Flex
      vertical
      style={{
        height: height,
        overflowY: "scroll",
        position: "relative",
        paddingTop: isMobile ? 60 : 0,
        overflowX: "hidden",
        scrollbarWidth: "none",
      }}
    >
      <LandingHeader bgColor="white"></LandingHeader>
      <SectionCenter
        sectionData={{
          mainImgUrl: "/images/landing/404.png",
          primaryImageSize: "50%",
          verticalPadding: 125,
        }}
      ></SectionCenter>
      <LandingFooter></LandingFooter>
    </Flex>
  );
}
