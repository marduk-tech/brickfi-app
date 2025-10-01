import jwt from "jsonwebtoken";
import { GlossaryArticle } from "@/types/Common";

const GHOST_URL = process.env.GHOST_URL || "https://learn.brickfi.in";
const GHOST_CONTENT_KEY = process.env.NEXT_PUBLIC_GHOST_CONTENT_API_KEY || "";
const GHOST_ADMIN_KEY = process.env.GHOST_ADMIN_API_KEY || "";

const isDevelopment = process.env.NEXT_PUBLIC_ENV === "development";

// Generate JWT token for Ghost Admin API
function generateAdminToken(): string {
  const [id, secret] = GHOST_ADMIN_KEY.split(":");

  if (!id || !secret) {
    throw new Error("Invalid GHOST_ADMIN_API_KEY format. Expected format: id:secret");
  }

  const token = jwt.sign({}, Buffer.from(secret, "hex"), {
    keyid: id,
    algorithm: "HS256",
    expiresIn: "5m",
    audience: "/admin/",
  });

  return token;
}

// Fetch page by slug using environment-aware API
export async function getGhostPageBySlug(slug: string): Promise<GlossaryArticle> {
  if (isDevelopment) {
    // Development: Use Admin API to access draft pages
    const token = generateAdminToken();
    const url = `${GHOST_URL}/ghost/api/admin/pages/slug/${slug}/?formats=html`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Ghost ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Ghost Admin API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.pages?.[0] || data;
  } else {
    // Production: Use Content API for published pages only
    const url = `${GHOST_URL}/ghost/api/content/pages/slug/${slug}/?key=${GHOST_CONTENT_KEY}&formats=html`;

    const res = await fetch(url, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Ghost Content API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.pages?.[0] || data;
  }
}
