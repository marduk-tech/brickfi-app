"use client";

import { useDevice } from "@/hooks/use-device";
import { FONT_SIZE } from "@/theme/style-constants";

// Heading sizes used across the brick360 inline view and its tabs - each
// steps one size down on mobile (h2 -> h3, h3 -> h4, h4 -> sub text) so the
// denser mobile layout isn't dominated by desktop-sized text. Use these in
// place of FONT_SIZE.HEADING_2/3/4 anywhere under brick360/.
export interface Brick360FontSize {
  HEADING_2: number;
  HEADING_3: number;
  HEADING_4: number;
}

const DESKTOP_FONT_SIZE: Brick360FontSize = {
  HEADING_2: FONT_SIZE.HEADING_2,
  HEADING_3: FONT_SIZE.HEADING_3,
  HEADING_4: FONT_SIZE.HEADING_4,
};

const MOBILE_FONT_SIZE: Brick360FontSize = {
  HEADING_2: FONT_SIZE.HEADING_3,
  HEADING_3: FONT_SIZE.HEADING_4,
  HEADING_4: FONT_SIZE.SUB_TEXT,
};

export const useBrick360FontSize = (): Brick360FontSize => {
  const { isMobile } = useDevice();
  return isMobile ? MOBILE_FONT_SIZE : DESKTOP_FONT_SIZE;
};
