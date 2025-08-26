import { Flex, Modal, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { ReactNode } from "react";

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  pt: ReactNode;
}

export const SnapshotModal = ({ isOpen, onClose, pt }: SnapshotModalProps) => {
  if (!pt) {
    return null;
  }

  return (
    <Modal
      footer={null}
      open={isOpen}
      closable={true}
      style={{ top: 100 }}
      onCancel={onClose}
      onClose={onClose}
    >
      <Flex vertical>
        {pt}
        <Typography.Text
          style={{
            marginTop: 16,
            color: COLORS.textColorLight,
            fontSize: FONT_SIZE.PARA,
          }}
        >
          * See full report for specific details.
        </Typography.Text>
      </Flex>
    </Modal>
  );
};
