import { Metadata } from "next";
import FindProjectsClient from "./find-projects-client";

export const metadata: Metadata = {
  title: "Find Projects | Brickfi",
  description: "Browse and filter all projects",
  robots: { index: false, follow: false },
};

export default function FindProjectsPage() {
  return <FindProjectsClient />;
}
