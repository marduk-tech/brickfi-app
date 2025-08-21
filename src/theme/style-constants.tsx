export const COLORS = {
  primaryColor: "#38b6ff",
  redIdentifier: "#FF8080",
  greenIdentifier: "#A6CF98",
  yellowIdentifier: "#f1b24b",
  orangeIdentifier: "#d68438",
  yellowBgColor: "#fcf1df",
  bgColor: "#fafbfb",
  bgColorMedium: "#e6e6e6",
  bgColorDark: "#2D3F4E",
  borderColor: "#EEE",
  borderColorMedium: "#ddd",
  borderColorDark: "#666",
  textColorDark: "#2D3F4E",
  textColorMedium: "#888",
  textColorLight: "#bbb",
  textColorVeryLight: "#e1e1e1",
  bgColorBlue: "#e7f6ff",
};

export const FONTS = {
  primary: "DM Sans",
  regular: "DM Sans",
  bold: "DM Sans",
};

const isMobile = !!window.matchMedia("((max-width: 576px))").matches;
export const FONT_SIZE = {
  SUB_TEXT: 12,
  PARA: 14,
  HEADING_1: isMobile ? 30 : 32,
  HEADING_2: 21,
  HEADING_3: 18,
  HEADING_4: 15,
};

export const MOBILE_MARGIN = 16;
export const MAX_WIDTH = 1150;
export const HORIZONTAL_PADDING =
  window.innerWidth > MAX_WIDTH ? (window.innerWidth - MAX_WIDTH) / 2 : 16;
