import { Card, Flex, Modal, Typography } from "antd";
import Image from "next/image";
import React from "react";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";

const { Text, Title } = Typography;

export type MapStyleType = "minimal" | "street";

export interface MapStyleOption {
  key: MapStyleType;
  label: string;
  image: string;
  description?: string;
}

interface MapStyleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStyle: MapStyleType;
  onStyleSelect: (style: MapStyleType) => void;
}

const mapStyleOptions: MapStyleOption[] = [
  {
    key: "minimal",
    label: "Minimal View",
    image: "/images/map-styles/minimal.png",
  },
  {
    key: "street",
    label: "Street View",
    image: "/images/map-styles/street.png",
  },
];

export const MapStyleDialog = ({
  isOpen,
  onClose,
  selectedStyle,
  onStyleSelect,
}: MapStyleDialogProps) => {
  const handleStyleSelect = (style: MapStyleType) => {
    onStyleSelect(style);
    onClose();
  };

  return (
    <Modal
      // title={
      //   <Title level={4} style={{ margin: 0, fontSize: FONT_SIZE.HEADING_2 }}>
      //     Map Style
      //   </Title>
      // }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={400}
      zIndex={3000}
      closeIcon={<></>}
    >
      <Flex gap={16} style={{ marginTop: 16 }}>
        {mapStyleOptions.map((option) => (
          <Card
            key={option.key}
            hoverable
            onClick={() => handleStyleSelect(option.key)}
            style={{
              borderColor:
                selectedStyle === option.key
                  ? COLORS.primaryColor
                  : COLORS.borderColor,
              borderWidth: selectedStyle === option.key ? 2 : 1,
              cursor: "pointer",
              flex: 1,
              boxShadow: "none",
            }}
          >
            <Flex vertical align="center" gap={12}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  overflow: "hidden",
                  border: `1px solid ${COLORS.borderColor}`,
                }}
              >
                <Image
                  src={option.image}
                  alt={option.label}
                  width={80}
                  height={80}
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>
              <Flex vertical align="center" gap={4}>
                <Text
                  strong
                  style={{
                    fontSize: FONT_SIZE.PARA,
                    color:
                      selectedStyle === option.key
                        ? COLORS.primaryColor
                        : COLORS.textColorDark,
                    textAlign: "center",
                  }}
                >
                  {option.label}
                </Text>
                {option.description && (
                  <Text
                    type="secondary"
                    style={{
                      fontSize: FONT_SIZE.SUB_TEXT,
                      lineHeight: 1.3,
                      textAlign: "center",
                    }}
                  >
                    {option.description}
                  </Text>
                )}
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Modal>
  );
};
