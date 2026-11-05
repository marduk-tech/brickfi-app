import { COLORS, FONT_SIZE } from "@/theme/style-constants";

// TEMP: shown on the home page during maintenance, with every other route
// redirected there (see redirects in next.config.ts and src/app/page.tsx).
export default function Maintenance() {
  return (
    <main
      style={{
        minHeight: "90dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        textAlign: "center",
        backgroundColor: "white",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/brickfi-logo.png"
        alt="Brickfi"
        style={{ width: 140, height: "auto" }}
      />
      <h1
        style={{
          margin: 0,
          fontSize: FONT_SIZE.HEADING_2,
          fontWeight: 500,
          backgroundColor: COLORS.LANDING.PINK,
          color: "white",
          padding: "2px 8px",
          borderRadius: 8
        }}
      >
        Upgrading to something special. We&apos;ll be back soon
      </h1>
      <p
        style={{
          margin: 0,
          maxWidth: 420,
          fontSize: FONT_SIZE.PARA,
          lineHeight: "150%",
          color: COLORS.textColorMedium,
        }}
      >
        Brickfi is down for maintenance. Please check back in sometime.
      </p>
    </main>
  );
}
