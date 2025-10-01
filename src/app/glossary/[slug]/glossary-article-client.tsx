"use client";

import LandingFooter from "@/custom-pages/landing/footer";
import LandingHeader from "@/custom-pages/landing/header";
import { useDevice } from "@/hooks/use-device";
import { CustomError } from "@/libs/error-handler";
import { getGlossaryArticleBySlugQuery } from "@/queries/marketing";
import { COLORS, FONT_SIZE, MAX_WIDTH } from "@/theme/style-constants";
import { useQuery } from "@tanstack/react-query";
import { Flex, Spin, Typography } from "antd";
import React from "react";

interface GlossaryArticleClientProps {
  slug: string;
}

export default function GlossaryArticleClient({
  slug,
}: GlossaryArticleClientProps) {
  const {
    data: article,
    isLoading,
    isError,
  } = useQuery({ ...getGlossaryArticleBySlugQuery(slug), retry: 3 });

  const { isMobile } = useDevice();

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

  if (isError || !article) {
    throw new CustomError({
      status: 404,
      title: "Article Not Found",
      description: "The requested glossary article could not be found.",
    });
  }

  return (
    <>
      <LandingHeader
        bgColor="white"
        logo={"/images/brickfi-logo.png"}
        color={COLORS.textColorDark}
      />

      <Flex
        vertical
        style={{
          maxWidth: MAX_WIDTH,
          paddingTop: 100,
          paddingBottom: 100,
          margin: isMobile ? 8 : "auto",
          paddingLeft: isMobile ? 16 : 24,
          paddingRight: isMobile ? 16 : 24,
        }}
      >
        <Typography.Text style={{ color: COLORS.textColorMedium }}>
          Glossary &gt; {article.title}
        </Typography.Text>

        {article.feature_image && (
          <img
            src={article.feature_image}
            alt={article.title}
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
              borderRadius: 8,
              marginTop: 16,
              marginBottom: 24,
            }}
          />
        )}

        <Typography.Title
          level={1}
          style={{
            fontSize: FONT_SIZE.HEADING_1,
            fontWeight: "bold",
            marginBottom: 24,
          }}
        >
          {article.title}
        </Typography.Title>

        {article.published_at && (
          <Typography.Text
            style={{
              color: COLORS.textColorMedium,
              marginBottom: 32,
              display: "block",
            }}
          >
            Published on {new Date(article.published_at).toLocaleDateString()}
          </Typography.Text>
        )}

        <div
          className="glossary-article-content"
          style={{
            fontSize: FONT_SIZE.PARA,
            lineHeight: 1.8,
            color: COLORS.textColorDark,
          }}
          dangerouslySetInnerHTML={{ __html: article.html }}
        />
      </Flex>

      <LandingFooter />

      <style jsx global>{`
        .glossary-article-content h2 {
          font-size: ${FONT_SIZE.HEADING_2};
          font-weight: 600;
          margin-top: 32px;
          margin-bottom: 16px;
          color: ${COLORS.textColorDark};
        }

        .glossary-article-content h3 {
          font-size: ${FONT_SIZE.HEADING_3};
          font-weight: 600;
          margin-top: 24px;
          margin-bottom: 12px;
          color: ${COLORS.textColorDark};
        }

        .glossary-article-content p {
          margin-bottom: 16px;
        }

        .glossary-article-content ul,
        .glossary-article-content ol {
          margin-left: 24px;
          margin-bottom: 16px;
        }

        .glossary-article-content li {
          margin-bottom: 8px;
        }

        .glossary-article-content a {
          color: ${COLORS.primaryColor};
          text-decoration: none;
        }

        .glossary-article-content a:hover {
          text-decoration: underline;
        }

        .glossary-article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }

        .glossary-article-content blockquote {
          border-left: 4px solid ${COLORS.primaryColor};
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: ${COLORS.textColorMedium};
        }

        .glossary-article-content code {
          background-color: ${COLORS.borderColor};
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }

        .glossary-article-content pre {
          background-color: ${COLORS.borderColor};
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 16px;
        }

        .glossary-article-content pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
    </>
  );
}
