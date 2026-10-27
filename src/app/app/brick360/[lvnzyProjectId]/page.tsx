import Brick360Client from "./brick360-client";
import Brick360Redirect from "./brick360-redirect";

interface PageProps {
  params: Promise<{ lvnzyProjectId: string }>;
  searchParams: Promise<{ open?: string | string[] }>;
}

// Legacy standalone report URL - always hands off to /app/<projectRef>,
// which opens the project in brickchat's inline 360 view. The id/slug is
// passed through as-is: /app/<projectRef> resolves an lvnzyProjectId, slug
// or originalProjectId itself (see BrickChatCore's projectRef). A short
// notice is shown first (see Brick360Redirect) so the change of page isn't
// a surprise. ?open=standalone skips the hand-off and renders the report
// full-page instead (Brick360v2, a wrapper around the same inline view).
export default async function Brick360Page({
  params,
  searchParams,
}: PageProps) {
  const { lvnzyProjectId } = await params;
  const { open } = await searchParams;
  // if (open === "standalone") {
  //   return <Brick360Client slug={lvnzyProjectId} />;
  // }
  return <Brick360Redirect target={`/app/${lvnzyProjectId}`} />;
}
