"use server";

import { baseApiUrl, sitemapApiKey } from "@/libs/constants";
import { cache } from "react";
import { DeveloperActionResult, RealEstateDeveloper } from "./types";

// Server action for generateMetadata - uses sitemapApiKey since it runs on server
export const getDeveloperData = cache(
  async (developerId: string): Promise<DeveloperActionResult> => {
    try {
      const response = await fetch(
        `${baseApiUrl}real-estate-developer/${developerId}`,
        {
          cache: "no-store",
          headers: {
            "x-api-key": sitemapApiKey || "",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: "Developer not found",
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: RealEstateDeveloper = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("Error fetching developer data:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch developer information",
      };
    }
  }
);

export async function revalidateDeveloperData(_developerId: string) {
  "use server";

  // This could be used for future cache revalidation
  // revalidateTag(`developer-${developerId}`);
}
