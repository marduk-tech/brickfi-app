import { ArrowRightOutlined, CloseOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { FONT_SIZE } from "../../../theme/style-constants";
import { ILivIndexPlaces } from "../../../types/Common";
import { LivIndexPlaceCard } from "./livindex-place-card";
import { IDriverPlace } from "../../../types/Project";

export const PlaceCard = ({
  place,
  isExpanded,
  onClose,
}: {
  place: ILivIndexPlaces;
  isExpanded: boolean;
  onClose: () => void;
}) => {
  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: 10,
        padding: "10px",
        whiteSpace: "nowrap",
        border: "1px solid #ccc",
        cursor: "pointer",
        overflow: "hidden",
        position: "relative",
        width: 250,
        height: isExpanded ? 300 : "auto",
      }}
    >
      {isExpanded && <CloseButton onClick={onClose} />}
      <div style={{ marginTop: isExpanded ? "24px" : "0px" }}>
        <Flex justify="space-between" align="center">
          <Typography.Text
            style={{
              fontSize: isExpanded ? FONT_SIZE.HEADING_3 : "16px",
              fontWeight: "medium",
            }}
          >
            {place.name} *
          </Typography.Text>
          {isExpanded && (
            <Link to={`/livindex-place/${place._id}`}>
              <Button
                variant="outlined"
                icon={<ArrowRightOutlined />}
                size="small"
              />
            </Link>
          )}
        </Flex>
        {isExpanded && (
          <div style={{ marginTop: "10px" }}>
            <Typography.Text type="secondary">
              {place.description || `${place.type} - ${place.driver}`}
            </Typography.Text>
          </div>
        )}
      </div>
    </div>
  );
};

export const LivIndexMarker = ({ place }: { place: IDriverPlace }) => {
  return <LivIndexPlaceCard place={place} />;
};

export const CloseButton: React.FC<{ onClick: (e: any) => void }> = ({
  onClick,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "18px",
        right: "18px",
        fontSize: "14px",
        cursor: "pointer",
        zIndex: 1,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClick}
    >
      <CloseOutlined />
    </div>
  );
};
