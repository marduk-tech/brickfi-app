import AboutUs from "@/custom-pages/landing/about-us";
import { headers } from "next/headers";

export default async function AboutUsPage() {
  const headersList = await headers();
  const ua = headersList.get("user-agent") ?? "";
  const isMobileSSR = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
  return <AboutUs initialIsMobile={isMobileSSR} />;
}