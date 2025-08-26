import { Flex, Modal, Tag, Typography } from "antd";
import { IDriverPlace } from "../../../types/Project";
import { COLORS, FONT_SIZE } from "../../../theme/style-constants";
import { LivIndexDriversConfig, PLACE_TIMELINE } from "../../../libs/constants";
import DynamicReactIcon from "../../common/dynamic-react-icon";
import { useState } from "react";
import { capitalize } from "../../../libs/lvnzy-helper";
const { Paragraph } = Typography;

interface LivIndexPlaceCardProps {
  place: IDriverPlace;
}

const renderIcon = (place: IDriverPlace, isUnderConstruction?: boolean) => {
  if (place.details && place.details.icon) {
    return <img src={place.details.icon} height={24} width={24}></img>;
  }
  let icon: any = { name: "FaLocationDot", set: "fa" };
  if ((LivIndexDriversConfig as any)[place!.driver]) {
    icon = (LivIndexDriversConfig as any)[place!.driver].icon;
  }
  return (
    <DynamicReactIcon
      iconName={icon.name}
      iconSet={icon.set}
      size={18}
      color={
        isUnderConstruction ? COLORS.yellowIdentifier : COLORS.textColorDark
      }
    ></DynamicReactIcon>
  );
};

export const LivIndexPlaceCard: React.FC<LivIndexPlaceCardProps> = ({
  place,
}) => {
  const isUnderConstruction = ![
    PLACE_TIMELINE.LAUNCHED,
    PLACE_TIMELINE.POST_LAUNCH,
  ].includes(place.status as any);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <Flex>
      <Modal
        style={{ width: 300 }}
        open={modalOpen}
        footer={null}
        onCancel={() => {
          setModalOpen(false);
        }}
        onClose={() => {
          setModalOpen(false);
        }}
      >
        <Flex
          vertical
          style={{
            padding: 2,
          }}
        >
          <Flex gap={4} style={{ marginTop: 4 }} align="flex-start">
            <Typography.Text
              style={{
                fontSize: FONT_SIZE.HEADING_2,
                lineHeight: "120%",
              }}
            >
              {place.name}
            </Typography.Text>
          </Flex>
          <Flex style={{ marginTop: 8 }}>
            {place.distance && (
              <Tag
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
              >
                {Math.round(place.distance)} kms away
              </Tag>
            )}
            {isUnderConstruction ? (
              <Tag
                color={COLORS.yellowIdentifier}
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
              >
                {capitalize(place.status)}
              </Tag>
            ) : null}
            {place.parameters && place.parameters.growthLever ? (
              <Tag
                color={COLORS.textColorDark}
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                }}
              >
                Key Growth Driver
              </Tag>
            ) : null}
          </Flex>

          {place.details && place.details.oneLiner ? (
            <Paragraph
              style={{
                marginTop: 8,
              }}
              ellipsis={{
                rows: 6,
                expandable: true,
              }}
            >
              {place.details.oneLiner}
            </Paragraph>
          ) : null}
        </Flex>
      </Modal>
      <Flex
        onClick={() => {
          setModalOpen(true);
        }}
        style={{
          backgroundColor: isUnderConstruction
            ? "rgba(255,255,255, 0.7)"
            : "rgba(255,255,255, 1)",
          borderRadius: "50%",
          padding: 4,
          borderWidth: "3px",
          borderColor: isUnderConstruction
            ? COLORS.yellowIdentifier
            : COLORS.borderColorDark,
          borderStyle: isUnderConstruction ? "dotted" : "solid",
          animation: "none",
        }}
      >
        {renderIcon(place, isUnderConstruction)}
      </Flex>
    </Flex>
  );
};
