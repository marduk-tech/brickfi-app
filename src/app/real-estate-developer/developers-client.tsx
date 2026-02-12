"use client";

import LandingFooter from "@/custom-pages/landing/footer";
import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";
import { CustomError } from "@/libs/error-handler";
import { getAllDevelopersQuery } from "@/queries/real-estate-developer";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Flex, Row, Spin, Typography } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Developer {
  _id: string;
  name: string;
  slug?: string;
  info?: {
    oneLiner?: string;
  };
}

const ALPHABET_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const groupItemsByLetter = (items: Developer[]) => {
  const grouped: Record<string, Developer[]> = {};

  items.forEach((item) => {
    const firstLetter = (item.name || "").charAt(0).toUpperCase();
    if (firstLetter && /[A-Z]/.test(firstLetter)) {
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(item);
    }
  });

  Object.keys(grouped).forEach((letter) => {
    grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
};

const SectionHeader: React.FC<{
  letter: string;
  id: string;
  isMobile: boolean;
}> = ({ letter, id, isMobile }) => (
  <div
    id={id}
    style={{
      marginTop: 40,
      marginBottom: 24,
      scrollMarginTop: 120,
    }}
  >
    <Typography.Title
      level={1}
      style={{
        fontSize: isMobile ? 48 : 64,
        fontWeight: "bold",
        color: COLORS.textColorDark,
        margin: 0,
        lineHeight: 1,
      }}
    >
      {letter}
    </Typography.Title>
  </div>
);

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
};

const DeveloperCard: React.FC<{ developer: Developer }> = ({ developer }) => {
  const handleCardClick = () => {
    if (developer.slug) {
      window.open(`/real-estate-developer/${developer.slug}`, "_blank");
    }
  };

  return (
    <Card
      hoverable={!!developer.slug}
      onClick={handleCardClick}
      style={{
        height: "100%",
        borderRadius: 12,
        border: `1px solid ${COLORS.borderColor}`,
        cursor: developer.slug ? "pointer" : "default",
        transition: "all 0.3s ease",
      }}
      styles={{
        body: { padding: 16 },
      }}
    >
      <Flex vertical justify="space-between" style={{ minHeight: 100 }}>
        <div>
          <Typography.Title
            level={4}
            style={{
              fontSize: FONT_SIZE.HEADING_3,
              fontWeight: 600,
              margin: 0,
              marginBottom: 12,
              color: COLORS.textColorDark,
            }}
          >
            {developer.name}
          </Typography.Title>

          {developer.info?.oneLiner && (
            <Typography.Paragraph
              style={{
                fontSize: FONT_SIZE.PARA,
                color: COLORS.textColorMedium,
                marginBottom: 12,
                lineHeight: 1.6,
              }}
            >
              {truncateText(developer.info.oneLiner, 150)}
            </Typography.Paragraph>
          )}
        </div>

        {developer.slug && (
          <Flex justify="flex-end" style={{ marginTop: 16 }}>
            <Button
              type="text"
              icon={<ArrowRightOutlined />}
              style={{
                color: COLORS.primaryColor,
                border: `1px solid ${COLORS.primaryColor}`,
                borderRadius: "50%",
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </Flex>
        )}
      </Flex>
    </Card>
  );
};

export default function DevelopersClient() {
  const {
    data: developers,
    isLoading,
    isError,
  } = useQuery<Developer[]>({ ...getAllDevelopersQuery(), retry: 3 });

  const { isMobile } = useDevice();

  const [flickerWait, setFlickerWait] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFlickerWait(false);
    }, 1000);
  });

  // Filter to only developers with slug and oneLiner, then group by letter
  const groupedItems = React.useMemo(() => {
    if (!developers || !Array.isArray(developers)) {
      return {};
    }
    const filtered = developers.filter((dev) => dev.slug && dev.info?.oneLiner);
    return groupItemsByLetter(filtered);
  }, [developers]);

  const availableLetters = React.useMemo(() => {
    return ALPHABET_LETTERS.filter(
      (letter) => groupedItems[letter]?.length > 0,
    );
  }, [groupedItems]);

  const handleLetterClick = (letter: string) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (isLoading || flickerWait) {
    return (
      <Flex
        align="center"
        justify="center"
        style={{
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <Spin size="large" />
      </Flex>
    );
  }

  if (isError || !developers) {
    throw new CustomError({
      status: 500,
      title: "Something went wrong",
      description: "Unable to load developers listing. Please try again later.",
    });
  }

  return (
    <>
      <LandingHeader
        bgColor="white"
        logo={"/images/brickfi-logo.png"}
        color={COLORS.textColorDark}
      />

      <div
        style={{
          maxWidth: MAX_WIDTH,
          margin: "auto",
          paddingTop: 100,
          paddingBottom: 100,
          paddingLeft: isMobile ? 16 : 24,
          paddingRight: isMobile ? 16 : 24,
        }}
      >
        {/* Header Section */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: 16,
            padding: isMobile ? 24 : 48,
            marginBottom: 40,
            border: `1px solid ${COLORS.borderColor}`,
            textAlign: "center",
          }}
        >
          <Typography.Title
            level={2}
            style={{
              marginBottom: 16,
              color: COLORS.textColorDark,
            }}
          >
            Real Estate Developers Listed on BrickFi
          </Typography.Title>

          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              color: COLORS.textColorMedium,
              display: "block",
              marginBottom: 16,
              lineHeight: 1.6,
            }}
          >
            Explore developer profiles, track records, and project portfolios to
            make confident property decisions.
          </Typography.Text>

          <Typography.Text
            style={{
              fontSize: FONT_SIZE.PARA,
              color: COLORS.textColorMedium,
              display: "block",
              marginBottom: 24,
            }}
          >
            Want a detailed property analysis? Get a free Brick360 report.
          </Typography.Text>

          <Link href="/">
            <Button
              type="default"
              size="large"
              style={{
                marginBottom: 32,
              }}
            >
              Request a Brick360 Report
            </Button>
          </Link>

          {/* A-Z Navigation */}
          <Flex
            justify={isMobile ? "flex-start" : "center"}
            gap={16}
            style={{
              marginTop: 24,
              overflowX: isMobile ? "auto" : "visible",
              paddingBottom: isMobile ? 8 : 0,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
            className={isMobile ? "hide-scrollbar" : ""}
          >
            {ALPHABET_LETTERS.map((letter) => {
              const hasContent = availableLetters.includes(letter);
              return (
                <Button
                  key={letter}
                  type="text"
                  size="small"
                  onClick={() => hasContent && handleLetterClick(letter)}
                  style={{
                    minWidth: isMobile ? 24 : 28,
                    height: isMobile ? 24 : 28,
                    fontSize: FONT_SIZE.HEADING_3,
                    color: hasContent
                      ? COLORS.primaryColor
                      : COLORS.textColorLight,
                    border: "none",
                    borderRadius: 4,
                    cursor: hasContent ? "pointer" : "default",
                    fontWeight: hasContent ? 500 : 400,
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  {letter}
                </Button>
              );
            })}
          </Flex>
        </div>

        {/* Developer Cards by Letter */}
        {availableLetters.length > 0 ? (
          <div>
            {availableLetters.map((letter) => (
              <div key={letter}>
                <SectionHeader
                  letter={letter}
                  id={`section-${letter}`}
                  isMobile={isMobile}
                />
                <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
                  {groupedItems[letter]?.map((developer) => (
                    <Col key={developer._id} xs={24} sm={12} lg={8} xl={8}>
                      <DeveloperCard developer={developer} />
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: 48,
              backgroundColor: "white",
              borderRadius: 12,
              border: `1px solid ${COLORS.borderColor}`,
            }}
          >
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.PARA,
                color: COLORS.textColorMedium,
              }}
            >
              No developers available at this time.
            </Typography.Text>
          </div>
        )}
      </div>

      <LandingFooter />
    </>
  );
}
