import { getAllDevelopers } from "@/queries/real-estate-developer";
import { MetadataRoute } from "next";

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
  ];

  // Add developer pages with slug URLs
  try {
    const developers = await getAllDevelopers();
    const developerRoutes: MetadataRoute.Sitemap = developers
      .filter((dev: any) => dev.slug) // Only include developers with slugs
      .map((dev: any) => ({
        url: `${baseUrl}/real-estate-developer/${dev.slug}`,
        lastModified: new Date(dev.updatedAt || dev.createdAt || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));

    return [...staticRoutes, ...developerRoutes];
  } catch (error) {
    console.error("Error generating sitemap for developers:", error);
    return staticRoutes;
  }
}
