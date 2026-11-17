import { connection } from "next/server";
import { ReactNode } from "react";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { FlippingIcon, FlippingIcons } from "./flipping-icons";
import { Flex } from "antd";

const HOME_ICONS: FlippingIcon[] = [
  { iconName: "MdHome", iconSet: "md" },
  { iconName: "MdApartment", iconSet: "md" },
  { iconName: "MdVilla", iconSet: "md" },
  { iconName: "MdCottage", iconSet: "md" },
  { iconName: "PiBuildings", iconSet: "pi" },
  { iconName: "PiHouseLine", iconSet: "pi" },
  { iconName: "PiKey", iconSet: "pi" },
  { iconName: "PiDoor", iconSet: "pi" },
  { iconName: "PiCouch", iconSet: "pi" },
  { iconName: "MdOutlineBed", iconSet: "md" },
];

// BRICKCHAT_MAINTENANCE_MODE=true in the server env swaps every BrickChat page
// for a maintenance message. Read per request (connection() opts the page out
// of build-time prerendering), so flipping it only needs a restart, not a
// rebuild.
const isBrickchatInMaintenance = () =>
  process.env.BRICKCHAT_MAINTENANCE_MODE?.trim().toLowerCase() === "true";

export async function BrickChatMaintenanceGate({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  if (!isBrickchatInMaintenance()) return children;

  return (
    <Flex
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: 16,
        textAlign: "center",
        width: "90%",
        maxWidth: "1000px",
        margin: "auto",
        border: `4px solid ${COLORS.primaryColor}`,
        borderRadius: 16,
        marginTop: 100
      }}
      vertical
    >
      <FlippingIcons
        icons={HOME_ICONS}
        count={2}
        size={48}
        color={COLORS.primaryColor}
        random
        circled={false}
      />
      <p style={{ fontSize: FONT_SIZE.HEADING_2, color: COLORS.textColorMedium, maxWidth: 420 }}>
        Brickfi is currently undergoing maintenance. Please check back in
        sometime.
      </p>
    </Flex>
  );
}
