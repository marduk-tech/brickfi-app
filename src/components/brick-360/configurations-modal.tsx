import { Flex, Image, Modal, Tag, Typography } from "antd";
import { rupeeAmountFormat } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

interface ConfigurationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lvnzyProject: any;
}

export const ConfigurationsModal = ({
  isOpen,
  onClose,
  lvnzyProject,
}: ConfigurationsModalProps) => {
  return (
    <Modal
      title={null}
      closable={true}
      footer={null}
      open={isOpen}
      onOk={onClose}
      onCancel={onClose}
    >
      <Typography.Title style={{ margin: 0, marginBottom: 16 }} level={3}>
        Configurations/Pricing
      </Typography.Title>
      {lvnzyProject?.meta.projectConfigurations && (
        <Flex>
          {lvnzyProject?.meta.projectConfigurations.unitsBreakup && (
            <Tag>{lvnzyProject?.property.layout.totalUnits} Units</Tag>
          )}
          {lvnzyProject?.property.layout.totalLandArea && (
            <Tag>
              {Math.round(
                lvnzyProject?.property.layout.totalLandArea / 4046.8564
              )}{" "}
              Acre
            </Tag>
          )}
        </Flex>
      )}
      <Flex
        vertical
        style={{
          marginTop: 16,
          maxHeight: 400,
          overflowY: "scroll",
          scrollbarWidth: "none",
        }}
        gap={16}
      >
        {lvnzyProject!.meta.costingDetails.configurations.map(
          (c: any, index: number) => {
            return (
              <Flex
                key={`config-modal-${index}`}
                vertical
                style={{
                  borderLeft: "1px solid",
                  paddingLeft: 8,
                  borderLeftColor: COLORS.borderColorMedium,
                }}
              >
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
                  ₹{rupeeAmountFormat(c.cost)}
                </Typography.Text>
                <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3 }}>
                  {c.config}
                </Typography.Text>
                {c.floorPlans && c.floorPlans.length > 0 && (
                  <Flex
                    style={{
                      overflowX: "auto",
                      marginTop: 8,
                    }}
                    gap={8}
                  >
                    {c.floorPlans.map((fp: any, i: number) => (
                      <Image
                        key={`fp-modal-${i}`}
                        src={fp.url}
                        style={{
                          height: 100,
                          borderRadius: 8,
                        }}
                        width={100}
                      />
                    ))}
                  </Flex>
                )}
              </Flex>
            );
          }
        )}
      </Flex>
    </Modal>
  );
};
