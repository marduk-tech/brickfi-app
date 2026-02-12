import { getAllGlossaryTerms } from "@/queries/marketing";
import { getAllDevelopers } from "@/queries/real-estate-developer";
import { MetadataRoute } from "next";

function logSitemapGeneration(routes: MetadataRoute.Sitemap) {
  // Categorize routes by URL pattern
  const staticRoutes = routes.filter(
    (r) =>
      (!r.url.includes("/real-estate-developer/") &&
        !r.url.includes("/glossary/")) ||
      r.url.endsWith("/glossary"),
  );
  const developerRoutes = routes.filter((r) =>
    r.url.includes("/real-estate-developer/"),
  );
  const glossaryRoutes = routes.filter(
    (r) => r.url.includes("/glossary/") && !r.url.endsWith("/glossary"),
  );

  // Log summary with visual formatting
  console.log("\n" + "=".repeat(50));
  console.log("📋 SITEMAP GENERATION SUMMARY");
  console.log("=".repeat(50) + "\n");

  console.log(`Total URLs: ${routes.length}\n`);
  console.log("Route Breakdown:");
  console.log(`  • Static routes: ${staticRoutes.length}`);
  console.log(`  • Developer pages: ${developerRoutes.length}`);
  console.log(`  • Glossary articles: ${glossaryRoutes.length}\n`);

  console.log("Generated Sitemap URLs:");
  console.log("-".repeat(50));

  // Log each route with category and metadata
  staticRoutes.forEach((route) => {
    console.log(
      `[STATIC] ${route.url} (priority: ${route.priority}, ${route.changeFrequency})`,
    );
  });

  developerRoutes.forEach((route) => {
    console.log(
      `[DEVELOPER] ${route.url} (priority: ${route.priority}, ${route.changeFrequency})`,
    );
  });

  glossaryRoutes.forEach((route) => {
    console.log(
      `[GLOSSARY] ${route.url} (priority: ${route.priority}, ${route.changeFrequency})`,
    );
  });

  console.log("=".repeat(50) + "\n");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://brickfi.in";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/aboutus`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/brickassist`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/requestreport`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/real-estate-developer`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  let allRoutes = [...staticRoutes];

  // Add developer pages with slug URLs
  try {
    const developers = await getAllDevelopers();
    const developerRoutes: MetadataRoute.Sitemap = developers
      .filter((dev: any) => dev.slug && dev.info && dev.info.oneLiner)
      .map((dev: any) => ({
        url: `${baseUrl}/real-estate-developer/${dev.slug}`,
        lastModified: new Date(dev.updatedAt || dev.createdAt || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    allRoutes = [...allRoutes, ...developerRoutes];
  } catch (error) {
    console.error("Error generating sitemap for developers:", error);
  }

  // glossary
  try {
    const glossaryTerms = await getAllGlossaryTerms();

    // glossary terms with pageLink
    const glossaryTermRoutes: MetadataRoute.Sitemap = glossaryTerms
      .filter((term: any) => term.content?.pageLink)
      .map((term: any) => ({
        url: `${baseUrl}/glossary/${term.content.pageLink}`,
        lastModified: new Date(term.updatedAt || term.createdAt || new Date()),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));

    allRoutes = [...allRoutes, ...glossaryTermRoutes];
  } catch (error) {
    console.error("Error generating sitemap for glossary articles:", error);
  }

  // Log generated sitemap
  logSitemapGeneration(allRoutes);

  return allRoutes;
}
