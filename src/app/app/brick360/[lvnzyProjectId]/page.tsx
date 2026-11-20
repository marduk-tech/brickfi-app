import { permanentRedirect } from "next/navigation";
import Brick360Redirect from "./brick360-redirect";

interface PageProps {
  params: Promise<{ lvnzyProjectId: string }>;
}

// Legacy standalone report URL.
// - A slug: permanently redirects (308, treated like a 301 by search engines)
//   to the public, server-rendered report at /brick360/<slug>, so links
//   shared over the years keep working and pass their value to it.
// - An lvnzyProjectId (24 hex chars - the public page is slug-only): hands
//   off to /app/<id>, which opens the project in brickchat's inline 360
//   view, after a short notice (see Brick360Redirect).
export default async function Brick360Page({ params }: PageProps) {
  const { lvnzyProjectId } = await params;
  const ref = decodeURIComponent(lvnzyProjectId);
  if (!/^[a-f\d]{24}$/i.test(ref)) {
    permanentRedirect(`/brick360/${encodeURIComponent(ref.toLowerCase())}`);
  }
  return <Brick360Redirect target={`/app/${lvnzyProjectId}`} />;
}
