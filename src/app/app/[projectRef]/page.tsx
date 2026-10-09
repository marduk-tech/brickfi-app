import BrickChatClient from "../brickchat/brickchat-client";

export { metadata } from "../brickchat/metadata";

interface AppProjectPageProps {
  params: Promise<{ projectRef: string }>;
}

// /app/<projectRef> - the chat page with a project (lvnzyProjectId, slug or
// originalProjectId) opened in the inline 360 view: taken from the user's
// pinned projects if it's one of them, otherwise fetched and saved to their
// default collection (see BrickChatCore's projectRef). Static /app/* routes
// (brickchat, profile, brick360, ...) take precedence over this segment.
export default async function AppProjectPage({ params }: AppProjectPageProps) {
  const { projectRef } = await params;
  return <BrickChatClient projectRef={decodeURIComponent(projectRef)} />;
}
