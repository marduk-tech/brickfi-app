import { COLORS } from "../../theme/style-constants";

// Sonar-ping style pulse: a few filled rings expand outward from the center
// and fade out, looping continuously with staggered start times so several
// are always mid-animation at once - giving the always-on concentric-rings
// look (like the reference gif) rather than a single ring repeating in
// isolation. The @keyframes/class rules are embedded in an inline <style>
// tag (rather than a global stylesheet) because this component is also
// rendered to a static HTML string via renderToString for the Leaflet
// divIcon variant (see map-markers/locality-markers.tsx) - that path has no
// access to this app's global CSS, only whatever markup ships in the string
// itself.
const RING_COUNT = 4;
const ANIMATION_DURATION_S = 3;
const MAX_RADIUS = 95;
const CENTER_RADIUS = 6;

export const LocalityMarkerIcon = () => (
  <div style={{ width: "50px", height: "75px" }}>
    <svg width="75" height="75" viewBox="0 0 200 200">
      <style>
        {`
          @keyframes locality-marker-pulse {
            0% { r: ${CENTER_RADIUS}px; opacity: 0.85; }
            100% { r: ${MAX_RADIUS}px; opacity: 0; }
          }
          .locality-marker-ring {
            animation: locality-marker-pulse ${ANIMATION_DURATION_S}s ease-out infinite;
          }
        `}
      </style>
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <circle
          key={i}
          className="locality-marker-ring"
          cx="100"
          cy="100"
          r={CENTER_RADIUS}
          fill={COLORS.primaryColor}
          style={{
            animationDelay: `${(i * ANIMATION_DURATION_S) / RING_COUNT}s`,
          }}
        />
      ))}
      {/* Solid filled center circle - stays put, on top of every ring */}
      <circle cx="100" cy="100" r={CENTER_RADIUS} fill={COLORS.textColorDark} />
    </svg>
  </div>
);
