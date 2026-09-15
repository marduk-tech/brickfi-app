import { useMemo } from "react";
import { COLORS } from "../../../theme/style-constants";
import { RentalLocalityAnchor } from "@/types/Rental";
import { getRentDomain, RENT_RAMP } from "../map-layers/rental-colors";

export const RentalLegend = ({ anchors }: { anchors: RentalLocalityAnchor[] }) => {
  const [min, max] = useMemo(() => getRentDomain(anchors), [anchors]);

  return (
    <div
      style={{
        position: "absolute",
        left: 8,
        bottom: 8,
        zIndex: 1000,
        background: "rgba(255,255,255,0.92)",
        border: `1px solid ${COLORS.borderColorMedium}`,
        borderRadius: 8,
        padding: "6px 8px",
        fontSize: 11,
        lineHeight: "14px",
        color: COLORS.textColorDark,
        pointerEvents: "none",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>Rent ₹/sqft</div>
      <div
        style={{
          width: 110,
          height: 8,
          borderRadius: 4,
          background: `linear-gradient(to right, ${RENT_RAMP.join(", ")})`,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <span>₹{Math.round(min)}</span>
        <span>₹{Math.round(max)}</span>
      </div>
      <div style={{ color: COLORS.textColorMedium, marginTop: 2 }}>
        Faint = fewer listings
      </div>
    </div>
  );
};
