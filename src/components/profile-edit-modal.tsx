import { Modal } from "antd";
import { UserDetailsForm } from "./user-details-form";

export function ProfileEditModal({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) {
  return (
    <Modal title="" open={open} onCancel={onCancel} footer={[]}>
      <UserDetailsForm ignoreCity={true} ignoreSource={true} />
    </Modal>
  );
}
