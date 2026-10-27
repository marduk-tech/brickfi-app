"use client";

import { Flex } from "antd";
import { useEffect, useRef, useState } from "react";
import { useFetchLvnzyProjectBySlug } from "../../hooks/use-lvnzy-project";

import { Brick360Inline } from "@/app/app/brickchat/brick360/brick360-inline";
import { useWindowDimensions } from "@/hooks/use-browser-safe";
import { useDevice } from "@/hooks/use-device";
import { HORIZONTAL_PADDING } from "../../theme/style-constants";
import { LvnzyProject } from "../../types/LvnzyProject";
import { FakeProgress } from "./fake-progress";

const FAKE_TIMER_SECS = 500;

interface Brick360v2Props {
  slug: string;
  projectData?: LvnzyProject;
}

// Standalone brick360 page - renders the same Brick360Inline view brickchat
// embeds (tabs, header, media strip, tour), just full-page and without a
// close button. Only the loading progress bar is specific to this page.
export function Brick360v2({ slug, projectData }: Brick360v2Props) {
  const { isMobile } = useDevice();
  const { width } = useWindowDimensions();

  const { data: fetchedProject, isLoading: lvnzyProjectIsLoading } =
    useFetchLvnzyProjectBySlug(slug, !projectData);
  const lvnzyProject = projectData || fetchedProject;

  const [fakeTimeoutProgress, setFakeTimeoutProgress] = useState<any>(10);
  const [fakeInterval, setFakeInterval] = useState<any>();

  const isLvnzyProjectLoadingRef = useRef(lvnzyProjectIsLoading);
  useEffect(() => {
    isLvnzyProjectLoadingRef.current = lvnzyProjectIsLoading;
  }, [lvnzyProjectIsLoading]);

  // Fake timeout and progress
  useEffect(() => {
    if (!fakeInterval) {
      const interval = setInterval(() => {
        setFakeTimeoutProgress((prevFakeTimeoutProgress: any) => {
          if (!isLvnzyProjectLoadingRef.current) {
            // Stop at 10
            clearInterval(interval);
            return 100;
          }
          return Math.min(95, prevFakeTimeoutProgress + 10);
        });
      }, FAKE_TIMER_SECS);
      setFakeInterval(interval);
    }
  }, []);

  if (lvnzyProjectIsLoading) {
    return <FakeProgress progress={fakeTimeoutProgress} projectName={""} />;
  }

  return (
    <Flex
      vertical
      style={{
        margin: "auto",
        overflowX: "hidden",
        width: isMobile ? "100%" : width - HORIZONTAL_PADDING * 2,
      }}
    >
      <Brick360Inline slug={slug} projectData={lvnzyProject} />
    </Flex>
  );
}
