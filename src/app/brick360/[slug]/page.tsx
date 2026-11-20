import { SEO_CONTENT } from "@/libs/constants";
import { getLvnzyProjectBySlug } from "@/queries/lvnzy-projects";
import { LvnzyProject } from "@/types/LvnzyProject";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Brick360PublicClient, { BreadcrumbItem } from "./brick360-public-client";

const SITE_URL = "https://www.brickfi.in";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// One backend call per request, shared by generateMetadata and the page.
const getProject = cache(
  async (slug: string): Promise<LvnzyProject | null> =>
    getLvnzyProjectBySlug(slug, false, true),
);

// --- facts the metadata, structured data and breadcrumbs are built from ---

const projectName = (p: LvnzyProject): string =>
  p.meta?.projectName || p.originalProjectId?.info?.name || "Project";

const developerOf = (p: LvnzyProject): { name?: string; slug?: string } => {
  const dev = p.originalProjectId?.info?.developerId;
  return dev && typeof dev === "object"
    ? { name: dev.name, slug: dev.slug }
    : {};
};

// the nearest corridor - the project's area, as the report header shows it
const localityOf = (p: LvnzyProject): string | undefined => {
  const corridors = [...(p.meta?.projectCorridors || [])].sort(
    (a: any, b: any) =>
      (a?.approxDistanceInKms ?? Infinity) -
      (b?.approxDistanceInKms ?? Infinity),
  );
  return corridors[0]?.corridorName || undefined;
};

const coverImageOf = (p: LvnzyProject): string | undefined => {
  const images = (p.originalProjectId?.media || []).filter(
    (m: any) => m?.type === "image" && m.image?.url,
  );
  const exterior = images.find((m: any) =>
    (m.image.tags || []).includes("exterior"),
  );
  return (exterior || images[0])?.image?.url;
};

// Only projects with a verified report are indexed - the rest still render,
// but stay out of search until their data is complete.
const isIndexable = (p: LvnzyProject): boolean =>
  p.originalProjectId?.info?.status === "report-verified";

const buildDescription = (p: LvnzyProject): string => {
  const name = projectName(p);
  const developer = developerOf(p).name;
  const locality = localityOf(p);
  const unitTypes = (p.meta?.projectUnitTypes || "").trim();
  const intro = [
    name,
    developer ? `by ${developer}` : null,
    locality ? `in ${locality}, Bangalore` : "in Bangalore",
  ]
    .filter(Boolean)
    .join(" ");
  const text = [
    `${intro}.`,
    unitTypes ? `${unitTypes}.` : null,
    "Brick360 report: property, developer, financials and location scores, floorplans and timeline.",
  ]
    .filter(Boolean)
    .join(" ");
  return text.length > 160 ? `${text.slice(0, 157).trimEnd()}...` : text;
};

const buildBreadcrumbs = (p: LvnzyProject): BreadcrumbItem[] => {
  const developer = developerOf(p);
  return [
    { name: "Home", href: "/" },
    { name: "Developers", href: "/real-estate-developer" },
    ...(developer.name && developer.slug
      ? [
          {
            name: developer.name,
            href: `/real-estate-developer/${developer.slug}`,
          },
        ]
      : []),
    { name: projectName(p) },
  ];
};

const buildJsonLd = (p: LvnzyProject, url: string) => {
  const name = projectName(p);
  const developer = developerOf(p);
  const locality = localityOf(p);
  const location = p.originalProjectId?.info?.location;
  const image = coverImageOf(p);
  const breadcrumbs = buildBreadcrumbs(p);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ApartmentComplex",
        "@id": `${url}#project`,
        name,
        url,
        description: buildDescription(p),
        ...(image ? { image } : {}),
        address: {
          "@type": "PostalAddress",
          ...(locality ? { addressLocality: locality } : {}),
          addressRegion: "Karnataka",
          addressCountry: "IN",
        },
        ...(location?.lat && location?.lng
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: location.lat,
                longitude: location.lng,
              },
            }
          : {}),
        ...(developer.name
          ? {
              additionalProperty: {
                "@type": "PropertyValue",
                name: "Developer",
                value: developer.name,
              },
            }
          : {}),
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: `${name} - Brick360 Report`,
        description: buildDescription(p),
        inLanguage: "en-IN",
        about: { "@id": `${url}#project` },
        publisher: {
          "@type": "Organization",
          name: SEO_CONTENT.companyName,
          url: SEO_CONTENT.companyUrl,
          logo: { "@type": "ImageObject", url: SEO_CONTENT.companyLogo },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: crumb.name,
          ...(crumb.href ? { item: `${SITE_URL}${crumb.href}` } : {}),
        })),
      },
    ],
  };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: "Project Not Found | Brickfi",
      robots: { index: false, follow: true },
    };
  }

  const name = projectName(project);
  const locality = localityOf(project);
  const title = `${name}${locality ? `, ${locality}` : ""} | Brick360 Report - Brickfi`;
  const description = buildDescription(project);
  const url = `${SITE_URL}/brick360/${project.slug || slug}`;
  const image = coverImageOf(project);
  const indexable = isIndexable(project);

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index: indexable,
      follow: true,
      googleBot: {
        index: indexable,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: "Brickfi",
      url,
      title,
      description,
      ...(image ? { images: [{ url: image, alt: name }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function Brick360PublicPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const canonicalSlug = project.slug || slug;
  const url = `${SITE_URL}/brick360/${canonicalSlug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildJsonLd(project, url)).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />
      <Brick360PublicClient
        slug={canonicalSlug}
        project={project}
        breadcrumbs={buildBreadcrumbs(project)}
      />
    </>
  );
}
