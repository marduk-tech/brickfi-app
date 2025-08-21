import { Drawer, Modal } from "antd";

import { InlineWidget } from "react-calendly";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import { Loader } from "./common/loader";

export function CalendlyPopup({
  open,
  onCancel,
}: {
  open: boolean;
  onCancel: () => void;
}) {
  const { user } = useUser();
  const { isMobile } = useDevice();

  if (isMobile) {
    return (
      <Drawer open={open} onClose={onCancel} title="Schedule Callback">
        <InlineWidget
          styles={{ height: "100%", width: "100%" }}
          prefill={{
            name: user?.profile.name,
            email: user?.profile.email,
            location: `+91${user?.mobile}`,
          }}
          LoadingSpinner={() => <Loader />}
          url="https://calendly.com/livinzy/callback"
        />
      </Drawer>
    );
  }

  return (
    <>
      <Modal
        styles={{
          body: {
            width: "65vw",
            height: "70vh",
          },
        }}
        width={"65vw"}
        height={"70vh"}
        title="Schedule Callback"
        open={open}
        onCancel={onCancel}
        footer={[]}
      >
        <InlineWidget
          styles={{ height: "100%", width: "95%" }}
          prefill={{
            name: user?.profile.name,
            email: user?.profile.email,
            location: `+91${user?.mobile}`,
          }}
          LoadingSpinner={() => <Loader />}
          url="https://calendly.com/livinzy/callback"
        />
      </Modal>
    </>
  );
}
