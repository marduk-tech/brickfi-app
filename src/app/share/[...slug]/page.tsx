"use client"

import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getShareContent } from "@/libs/share-content";
import LandingHeader from "@/custom-pages/landing/header";
import { COLORS } from "@/theme/style-constants";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function SharePage({ params }: PageProps) {
  const { slug } = await params;
  const [type, id] = slug;
  if ((type !== "job" && type !== "document") || !id) return notFound();

  const content = getShareContent(type, id);
  if (!content) return notFound();

  return (<>
    <LandingHeader
        bgColor="white"
        logo={"/images/brickfi-logo.png"}
        color={COLORS.textColorDark}
      />
    <main style={{ maxWidth: 720, margin: "32px auto", padding: "40px 24px" }}>
      <h1>{content.title}</h1>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content.markdown}
      </ReactMarkdown>
    </main></>
  );
}
