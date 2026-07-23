"use client";

import { Flex } from "antd";
import { useState } from "react";
import DynamicReactIcon from "../../../components/common/dynamic-react-icon";
import { COLORS } from "../../../theme/style-constants";

interface ProjectImageCarouselProps {
  images: string[];
  alt: string;
}

const ArrowButton = ({
  iconName,
  onClick,
  side,
}: {
  iconName: "IoChevronBack" | "IoChevronForward";
  onClick: (e: React.MouseEvent) => void;
  side: "left" | "right";
}) => (
  <Flex
    align="center"
    justify="center"
    onClick={onClick}
    style={{
      position: "absolute",
      top: "50%",
      [side]: 8,
      transform: "translateY(-50%)",
      width: 28,
      height: 28,
      borderRadius: "50%",
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
      cursor: "pointer",
      zIndex: 1,
    }}
  >
    <DynamicReactIcon
      iconName={iconName}
      iconSet="io5"
      size={16}
      color={COLORS.textColorDark}
    />
  </Flex>
);

export default function ProjectImageCarousel({
  images,
  alt,
}: ProjectImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (e: React.MouseEvent, delta: number) => {
    // cards are wrapped in a Link - don't navigate on arrow click
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + delta + images.length) % images.length);
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <img
        src={images[currentIndex]}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {images.length > 1 && (
        <>
          <ArrowButton
            iconName="IoChevronBack"
            side="left"
            onClick={(e) => goTo(e, -1)}
          />
          <ArrowButton
            iconName="IoChevronForward"
            side="right"
            onClick={(e) => goTo(e, 1)}
          />

          <Flex
            justify="center"
            align="center"
            gap={4}
            style={{
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
            }}
          >
            {images.map((_, index) => (
              <div
                key={index}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  backgroundColor:
                    index === currentIndex
                      ? "#fff"
                      : "rgba(255, 255, 255, 0.5)",
                  boxShadow: "0 0 2px rgba(0, 0, 0, 0.4)",
                }}
              />
            ))}
          </Flex>
        </>
      )}
    </div>
  );
}
