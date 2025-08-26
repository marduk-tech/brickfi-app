import { Flex, Modal } from "antd";
import { ReactNode } from "react";

interface PricePointModalProps {
  content?: ReactNode;
  onClose: () => void;
}

export const PricePointModal = ({ content, onClose }: PricePointModalProps) => {
  return (
    <Modal
      footer={null}
      height={600}
      open={!!content}
      closable={true}
      style={{ top: 40 }}
      styles={{
        content: {
          padding: 16,
        },
      }}
      onCancel={onClose}
      onClose={onClose}
    >
      <Flex
        style={{ height: 600, overflowY: "scroll", scrollbarWidth: "none" }}
      >
        {content}
      </Flex>
    </Modal>
  );
};
