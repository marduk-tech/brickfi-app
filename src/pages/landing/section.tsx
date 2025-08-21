import { Button, Flex } from "antd";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDevice } from "../../hooks/use-device";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

interface SectionProps {
  id?: string;
  heading?: string | React.ReactNode;
  subHeading?: string | React.ReactNode;
  mainImgUrl?: string;
  mainImgAltText?: string;
  bgColor?: string;
  textColor?: string;
  verticalPadding?: number;
  fullHeight?: boolean;
  primaryImageSize?: string;
  mediaUrl?: string;
  mainImgAlign?: string;
  btn?: {
    link?: string;
    txt: string;
    btnAction?: any;
  };
  imageContainerWidth?: number;
}
const styles = {
  h1: {
    lineHeight: "100%",
    textOverflow: "wrap",
    width: "100%",
    margin: 0,
    color: COLORS.textColorDark,
  },
  h2: {
    lineHeight: "120%",
    textOverflow: "wrap",
    marginTop: 16,
    width: "100%",
    margin: 0,
    fontWeight: "normal",
  },
};

const SectionLeft: React.FC<{ sectionData: SectionProps }> = ({
  sectionData,
}) => {
  const { isMobile } = useDevice();

  const navigate = useNavigate();

  return (
    <Flex
      vertical={isMobile}
      gap={isMobile ? 16 : 0}
      style={{
        width: "100%",
        backgroundColor: sectionData.bgColor || "white",
        padding: sectionData.verticalPadding
          ? `${sectionData.verticalPadding}px 0`
          : sectionData.fullHeight && !isMobile
          ? "40px 0"
          : "72px 0",
      }}
    >
      <Flex
        vertical
        style={{
          width: isMobile
            ? "calc(100% - 32px)"
            : `calc(${sectionData.imageContainerWidth || 40}% - 64px)`,
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          marginLeft: isMobile ? 16 : 64,
        }}
        align={isMobile ? "center" : "flex-end"}
        justify="center"
      >
        {typeof sectionData.heading == "string" ? (
          <h1
            style={{
              ...styles.h1,
              fontSize: isMobile ? 50 : 60,
              color: sectionData.textColor || COLORS.textColorDark,
            }}
          >
            {sectionData.heading}
          </h1>
        ) : (
          <>{sectionData.heading}</>
        )}
        {sectionData.subHeading ? (
          typeof sectionData.subHeading == "string" ? (
            <h2
              style={{
                ...styles.h2,
                color: sectionData.textColor || COLORS.textColorDark,
              }}
            >
              {sectionData.subHeading}
            </h2>
          ) : (
            <>{sectionData.subHeading}</>
          )
        ) : null}
        {sectionData.btn && (
          <Button
            type="primary"
            onClick={() => {
              if (sectionData.btn?.btnAction) {
                sectionData.btn?.btnAction();
              } else {
                window.location.href = sectionData.btn!.link!;
              }
            }}
            style={{
              alignSelf: "flex-start",
              marginTop: 16,
              fontSize: FONT_SIZE.HEADING_2,
            }}
          >
            {sectionData.btn.txt}
          </Button>
        )}
      </Flex>
      <Flex
        style={{
          width: isMobile
            ? "calc(100% - 32px)"
            : `calc(${100 - (sectionData.imageContainerWidth || 40)}% - 64px)`,
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          padding: isMobile ? "0 16px" : "0 32px",
        }}
        align="center"
        justify="center"
      >
        <img
          src={sectionData.mainImgUrl}
          alt={sectionData.mainImgAltText || ""}
          style={{
            width: sectionData.primaryImageSize
              ? sectionData.primaryImageSize
              : "100%",
            maxWidth: 1000,
          }}
        />
      </Flex>
    </Flex>
  );
};

const SectionRight: React.FC<{ sectionData: SectionProps }> = ({
  sectionData,
}) => {
  const { isMobile } = useDevice();

  return (
    <Flex
      vertical={isMobile}
      gap={isMobile ? 16 : 0}
      style={{
        width: "100%",
        backgroundColor: sectionData.bgColor || "white",
        padding: sectionData.verticalPadding
          ? `${sectionData.verticalPadding}px 0`
          : sectionData.fullHeight
          ? 0
          : "72px 0",
      }}
    >
      <Flex
        style={{
          width: isMobile
            ? "calc(100% - 32px)"
            : `calc(${sectionData.imageContainerWidth || 40}% - 64px)`,
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          padding: isMobile ? "0 16px" : "0 32px",
        }}
        align="center"
        justify={sectionData.mainImgAlign || isMobile ? "center" : "flex-end"}
      >
        {sectionData.mainImgUrl ? (
          <img
            src={sectionData.mainImgUrl}
            alt={sectionData.mainImgAltText || ""}
            style={{
              width: sectionData.primaryImageSize || "100%",
              maxWidth: 1000,
            }}
          />
        ) : null}
      </Flex>
      <Flex
        vertical
        style={{
          width: isMobile
            ? "calc(100% - 32px)"
            : `calc(${100 - (sectionData.imageContainerWidth || 40)}% - 64px)`,
          minHeight: isMobile
            ? "auto"
            : sectionData.fullHeight
            ? window.innerHeight
            : "auto",
          marginLeft: isMobile ? 16 : 40,
          marginTop: isMobile ? 32 : 0,
        }}
        align={isMobile ? "center" : "flex-end"}
        justify="center"
        gap={16}
      >
        {typeof sectionData.heading == "string" ? (
          <h1 style={{ ...styles.h1, fontSize: isMobile ? 50 : 60 }}>
            {sectionData.heading}
          </h1>
        ) : (
          <>{sectionData.heading}</>
        )}

        {sectionData.subHeading ? (
          typeof sectionData.subHeading == "string" ? (
            <h2
              style={{
                ...styles.h2,
                fontSize: isMobile ? 20 : 24,
                color: sectionData.textColor || COLORS.textColorDark,
                maxWidth: 600,
                alignSelf: "flex-start",
              }}
            >
              {sectionData.subHeading}
            </h2>
          ) : (
            <div style={{ maxWidth: 600, alignSelf: "flex-start" }}>
              {sectionData.subHeading}
            </div>
          )
        ) : null}
        {sectionData.btn && (
          <Button
            type="primary"
            onClick={() => {
              if (sectionData.btn?.btnAction) {
                sectionData.btn?.btnAction();
              } else {
                window.location.href = sectionData.btn!.link!;
              }
            }}
            style={{
              alignSelf: "flex-start",
              marginTop: 16,
              fontSize: FONT_SIZE.HEADING_2,
            }}
          >
            {sectionData.btn.txt}
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
const SectionCenter: React.FC<{ sectionData: SectionProps }> = ({
  sectionData,
}) => {
  const { isMobile } = useDevice();

  return (
    <Flex
      id={sectionData.id || `${Math.round(Math.random() * 1000)}`}
      vertical
      style={{
        width: "100%",
        backgroundColor: sectionData.bgColor || "white",
        minHeight: "auto",
        padding: sectionData.verticalPadding
          ? `${sectionData.verticalPadding}px 0`
          : "72px 0",
      }}
      gap={16}
    >
      <Flex
        vertical
        style={{
          width: isMobile ? "calc(100% - 32px)" : "100%",
          textAlign: isMobile ? "left" : "center",
          marginLeft: isMobile ? 16 : 0,
        }}
        align="center"
        justify="center"
      >
        <h1
          style={{
            ...styles.h1,
            fontSize: isMobile ? 50 : 60,
            color: sectionData.textColor || COLORS.textColorDark,
            marginBottom: 16,
          }}
        >
          {sectionData.heading}
        </h1>
        {sectionData.subHeading ? (
          typeof sectionData.subHeading == "string" ? (
            <h2
              style={{
                ...styles.h2,
                color: sectionData.textColor || COLORS.textColorDark,
              }}
            >
              {sectionData.subHeading}
            </h2>
          ) : (
            <>{sectionData.subHeading}</>
          )
        ) : null}
        {sectionData.btn && (
          <Button
            type="primary"
            onClick={() => {
              if (sectionData.btn?.btnAction) {
                sectionData.btn?.btnAction();
              } else {
                window.location.href = sectionData.btn!.link!;
              }
            }}
            style={{
              alignSelf: "flex-start",
              marginTop: 16,
              fontWeight: 800,
              fontSize: FONT_SIZE.HEADING_3,
            }}
          >
            {sectionData.btn.txt}
          </Button>
        )}
      </Flex>
      <Flex
        style={{
          width: isMobile ? "calc(100% - 32px)" : "100%",
          padding: isMobile ? "0 16px" : "0",
        }}
        align="center"
        justify={isMobile ? "center" : "flex-start"}
      >
        {sectionData.mainImgUrl ? (
          <img
            alt={sectionData.mainImgAltText || ""}
            src={sectionData.mainImgUrl}
            style={{
              width: sectionData.primaryImageSize
                ? sectionData.primaryImageSize
                : "100%",
              maxWidth: 900,
              margin: "auto",
            }}
          />
        ) : sectionData.mediaUrl ? (
          <video
            autoPlay
            muted
            loop
            height={isMobile ? 500 : 700}
            style={{ margin: "auto" }}
          >
            <source src={sectionData.mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : null}
      </Flex>
    </Flex>
  );
};

export { SectionCenter, SectionLeft, SectionRight };
