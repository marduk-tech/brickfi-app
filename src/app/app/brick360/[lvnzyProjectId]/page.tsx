import Brick360Redirect from "./brick360-redirect";

interface PageProps {
  params: Promise<{ lvnzyProjectId: string }>;
}

// Legacy standalone report URL - always hands off to /app/<projectRef>,
// which opens the project in brickchat's inline 360 view. The id/slug is
// passed through as-is: /app/<projectRef> resolves an lvnzyProjectId, slug
// or originalProjectId itself (see BrickChatCore's projectRef). A short
// notice is shown first (see Brick360Redirect) so the change of page isn't
// a surprise.
export default async function Brick360Page({ params }: PageProps) {
  const { lvnzyProjectId } = await params;
  return <Brick360Redirect target={`/app/${lvnzyProjectId}`} />;
}
