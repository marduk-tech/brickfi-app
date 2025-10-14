import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import DynamicReactIcon from "../../common/dynamic-react-icon";
import { MapStyleDialog, MapStyleType } from "./map-style-dialog";
import { COLORS } from "../../../theme/style-constants";

interface MapStyleControlsProps {
  selectedStyle: MapStyleType;
  onStyleChange: (style: MapStyleType) => void;
}

export const MapStyleControls = ({ selectedStyle, onStyleChange }: MapStyleControlsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleStyleSelect = (style: MapStyleType) => {
    onStyleChange(style);
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          bottom: 100,
          right: 10,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Change map style" placement="left">
          <Button
            type="link"
            icon={
              <DynamicReactIcon
                iconSet="lu"
                iconName="LuLayers3"
                size={18}
                color="white"
              />
            }
            onClick={handleOpenDialog}
            style={{
              backgroundColor:"rgba(0,0,0,0.6)" ,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
            }}
          />
        </Tooltip>
      </div>

      <MapStyleDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        selectedStyle={selectedStyle}
        onStyleSelect={handleStyleSelect}
      />
    </>
  );
};