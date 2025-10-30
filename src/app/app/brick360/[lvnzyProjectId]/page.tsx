import { getQueryClient } from "@/libs/query-client";
import {
  getLvnzyProjectByIdQuery,
  getLvnzyProjectBySlug,
  getLvnzyProjectBySlugQuery,
} from "@/queries/lvnzy-projects";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import Brick360Client from "./brick360-client";

interface PageProps {
  params: Promise<{ lvnzyProjectId: string }>;
}

// export async function generateMetadata({
//   params,
// }: PageProps): Promise<Metadata> {
//   const { lvnzyProjectId: slug } = await params;

//   try {
//     const lvnzyProject = /^[a-f\d]{24}$/i.test(slug) ? await getLvnzyProjectBySlug(slug, false) : await getLvnzyProjectByIdQuery(slug);

//     if (!lvnzyProject) {
//       return {
//         title: "Project Not Found | Brickfi",
//         description:
//           "The requested Brick360 project report could not be found.",
//       };
//     }

//     const projectName = lvnzyProject.meta?.projectName || "Project";
//     const homeType = lvnzyProject.meta?.projectUnitTypes
//       ? lvnzyProject.meta.projectUnitTypes
//           .split(",")[0]
//           .trim()
//           .charAt(0)
//           .toUpperCase() +
//         lvnzyProject.meta.projectUnitTypes.split(",")[0].trim().slice(1)
//       : "Property";

//     let closestCorridor = "";

//     if (
//       lvnzyProject.meta?.projectCorridors &&
//       Array.isArray(lvnzyProject.meta.projectCorridors)
//     ) {
//       const firstCorridor = lvnzyProject.meta.projectCorridors[0];

//       // Check if it's properly structured with corridorName
//       if (
//         firstCorridor &&
//         typeof firstCorridor === "object" &&
//         "corridorName" in firstCorridor
//       ) {
//         const sorted = lvnzyProject.meta.projectCorridors.sort(
//           (a: any, b: any) =>
//             (a.approxDistanceInKms || 0) - (b.approxDistanceInKms || 0)
//         );
//         closestCorridor = sorted[0].corridorName || "";
//       }
//       // malformed data where string is indexed by character
//       else if (firstCorridor && typeof firstCorridor === "object") {
//         // Reconstruct string from indexed object
//         const keys = Object.keys(firstCorridor)
//           .filter((k) => !isNaN(Number(k)))
//           .sort((a, b) => Number(a) - Number(b));
//         const reconstructed = keys.map((k) => firstCorridor[k]).join("");
//         // Extract first corridor from comma-separated list
//         closestCorridor = reconstructed.split(",")[0].trim();
//       }
//     }

//     // Fallback: Extract from oneLiner if corridor still not found
//     if (!closestCorridor && lvnzyProject.meta?.oneLiner) {
//       const match = lvnzyProject.meta.oneLiner.match(/·\s*(.+)$/);
//       if (match) {
//         closestCorridor = match[1].trim();
//       }
//     }

//     const title = `${projectName}, ${homeType}, ${closestCorridor}`;
//     const description = `Brick360 Report for ${projectName}, ${homeType}, ${closestCorridor}`;

//     return {
//       title,
//       description,
//       keywords: [
//         projectName,
//         homeType,
//         closestCorridor,
//         "brick360",
//         "property report",
//         "real estate",
//         "bangalore",
//         "brickfi",
//       ],
//       openGraph: {
//         title,
//         description,
//         type: "website",
//         url: `https://brickfi.in/app/brick360/${slug}`,
//       },
//       twitter: {
//         card: "summary_large_image",
//         title,
//         description,
//       },
//       alternates: {
//         canonical: `https://brickfi.in/app/brick360/${slug}`,
//       },
//     };
//   } catch (error) {
//     return {
//       title: "Brick360 Report | Brickfi",
//       description:
//         "View comprehensive property analysis and insights with Brick360 reports.",
//     };
//   }
// }

const META_DESCR = "Brick360 Report covering property layout, financial assessment, builder credibility and more.";
const META_TITLE = "Brick360 Report Card";
export const metadata: Metadata = {
  title: META_TITLE,
  description:
    META_DESCR,
  keywords: [
    "real estate",
    "property",
    "bangalore",
    "investment",
    "brick360",
    "brickfi",
    "home buying",
    "property analysis",
  ],
  authors: [{ name: "Brickfi" }],
  creator: "Brickfi",
  publisher: "Brickfi",
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL("https://brickfi.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: META_TITLE,
    description:
      META_DESCR,
    url: "https://brickfi.in",
    siteName: "Brickfi",
    images: [
      {
        url: "/images/brick360-preview.png",
        width: 1200,
        height: 630,
        alt: "Brickfi | Get a 360 Report Card across any property in Bangalore",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE,
    description:
      META_DESCR,
    images: ["/images/brick360-preview.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default async function Brick360Page({ params }: PageProps) {
  const { lvnzyProjectId: slug } = await params;
  //TODO: This particular hydration boundary code is causing delay when loading the page, which is also resulting page load fail sometimes.
  // const queryClient = getQueryClient();

  // await queryClient.prefetchQuery(getLvnzyProjectBySlugQuery(slug));

  return (
    // <HydrationBoundary state={dehydrate(queryClient)}>
      <Brick360Client slug={slug} />
    // </HydrationBoundary>
  );
}
