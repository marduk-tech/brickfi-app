import FourOFour from "@/custom-pages/landing/404";
import { headers } from "next/headers";

export default async function NotFound() {
  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const isMobileSSR = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  return <FourOFour initialIsMobile={isMobileSSR} />;
}