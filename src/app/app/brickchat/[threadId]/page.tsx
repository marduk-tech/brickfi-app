import BrickChatClient from "../brickchat-client";

export { metadata } from "../metadata";

// /app/brickchat/<threadId> - the same chat page, with the thread to open
// read from the path by BrickChatCore itself (see threadPathBase), so
// nothing needs passing down from the route params here.
export default function BrickChatThreadPage() {
  return <BrickChatClient />;
}
