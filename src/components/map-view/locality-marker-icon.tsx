import { COLORS } from "../../theme/style-constants";

export const LocalityMarkerIcon = () => (
  <div style={{ width: "100px", height: "150px" }}>
    <svg width="150" height="150" viewBox="0 0 200 200">
      {/* Solid filled center circle */}
      <circle cx="100" cy="100" r="6" fill={COLORS.textColorDark} />
    </svg>
  </div>
);
