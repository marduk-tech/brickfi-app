"use client";

import LandingFooter from "@/custom-pages/landing/footer";
import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";
import { CustomError } from "@/libs/error-handler";
import { getGlossaryQuery } from "@/queries/marketing";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Flex, Row, Spin, Typography } from "antd";
import Link from "next/link";
import React from "react";

interface GlossaryItem {
  title?: string;
  description?: string;
  content?: string;
  pageLink?: string;
}

interface GlossaryData {
  content: GlossaryItem[];
}

const ALPHABET_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

// group glossary items by first letter
const groupItemsByLetter = (items: GlossaryItem[]) => {
  const grouped: Record<string, GlossaryItem[]> = {};

  items.forEach((item) => {
    const firstLetter = (item.title || "").charAt(0).toUpperCase();
    if (firstLetter && /[A-Z]/.test(firstLetter)) {
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(item);
    }
  });

  // Sort items within each group
  Object.keys(grouped).forEach((letter) => {
    grouped[letter].sort((a, b) =>
      (a.title || "").localeCompare(b.title || "")
    );
  });

  return grouped;
};

// Section header component
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

const GlossaryCard: React.FC<{ item: GlossaryItem }> = ({ item }) => {
  const handleCardClick = () => {
    if (item.pageLink) {
      window.open(item.pageLink, "_blank");
    }
  };

  return (
    <Card
      hoverable={!!item.pageLink}
      onClick={handleCardClick}
      style={{
        height: "100%",
        borderRadius: 12,
        border: `1px solid ${COLORS.borderColor}`,
        cursor: item.pageLink ? "pointer" : "default",
        transition: "all 0.3s ease",
      }}
      styles={{
        body: { padding: 24 },
      }}
    >
      <Flex vertical justify="space-between" style={{ minHeight: 180 }}>
        <div>
          {item.title && (
            <Typography.Title
              level={4}
              style={{
                fontSize: FONT_SIZE.HEADING_3,
                fontWeight: 600,
                marginBottom: 12,
                color: COLORS.textColorDark,
              }}
            >
              {item.title}
            </Typography.Title>
          )}

          {item.description && (
            <Typography.Paragraph
              style={{
                fontSize: FONT_SIZE.PARA,
                color: COLORS.textColorMedium,
                marginBottom: 12,
                lineHeight: 1.6,
              }}
            >
              {item.description}
            </Typography.Paragraph>
          )}

          {item.content && (
            <Typography.Paragraph
              style={{
                fontSize: FONT_SIZE.PARA,
                color: COLORS.textColorDark,
                lineHeight: 1.6,
              }}
            >
              {item.content}
            </Typography.Paragraph>
          )}
        </div>

        {item.pageLink && (
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

export default function GlossaryClient() {
  const {
    data: glossary,
    isLoading,
    isError,
  } = useQuery<GlossaryData>({ ...getGlossaryQuery(), retry: 3 });

  const { isMobile } = useDevice();

  // Group glossary items by letter
  const groupedItems = React.useMemo(() => {
    if (!glossary?.content || !Array.isArray(glossary.content)) {
      return {};
    }
    return groupItemsByLetter(glossary.content);
  }, [glossary?.content]);

  // Get available letters that have content
  const availableLetters = React.useMemo(() => {
    return ALPHABET_LETTERS.filter(
      (letter) => groupedItems[letter]?.length > 0
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

  if (isLoading) {
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

  if (isError || !glossary) {
    throw new CustomError({
      status: 500,
      title: "Something went wrong",
      description: "Unable to load glossary content. Please try again later.",
    });
  }

  return (
    <>
      <LandingHeader
        bgColor="white"
        logo={"/images/brickfi-logo.png"}
        color={COLORS.textColorDark}
      />

      {/* Main Content Container */}
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
            Real Estate Terms: A Comprehensive Glossary by BrickFi
          </Typography.Title>

          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              color: COLORS.textColorMedium,
              display: "block",
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            With clear definitions and helpful examples, BrickFi&apos;s real
            estate terms glossary has everything you need to know to succeed in
            real estate.
          </Typography.Text>

          <Typography.Text
            style={{
              fontSize: FONT_SIZE.PARA,
              color: COLORS.textColorMedium,
              display: "block",
              marginBottom: 24,
            }}
          >
            Need help with property analysis? Looking to grow your portfolio?
            Let BrickFi help out, for free.
          </Typography.Text>

          <Link href={"/"}>
            <Button
              type="primary"
              size="large"
              style={{
                marginBottom: 32,
              }}
            >
              Get started now →
            </Button>
          </Link>

          {/* Alphabetical Navigation */}
          <Flex
            justify="center"
            gap={isMobile ? 4 : 8}
            style={{
              marginTop: 24,
              overflowX: isMobile ? "auto" : "visible",
              paddingBottom: isMobile ? 8 : 0,
            }}
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
                    fontSize: isMobile ? FONT_SIZE.SUB_TEXT : FONT_SIZE.PARA,
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

        {/* Content Organized by Letters */}
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
                  {groupedItems[letter]?.map((item, index) => (
                    <Col
                      key={`${letter}-${index}`}
                      xs={24}
                      sm={12}
                      lg={8}
                      xl={8}
                    >
                      <GlossaryCard item={item} />
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </div>
        ) : (
          // Fallback for non-array content or empty content
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
              {!Array.isArray(glossary?.content) && glossary
                ? typeof glossary.content === "string"
                  ? glossary.content
                  : JSON.stringify(glossary)
                : "No glossary content available at this time."}
            </Typography.Text>
          </div>
        )}
      </div>

      <LandingFooter />
    </>
  );
}
