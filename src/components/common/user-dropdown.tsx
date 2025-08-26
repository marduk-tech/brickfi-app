import {
  ExclamationCircleFilled,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Dropdown, Modal } from "antd";
import { useAuth } from "../../hooks/use-auth";

const { confirm } = Modal;

export function UserDropDown() {
  const { logout } = useAuth();

  const showConfirm = () => {
    confirm({
      title: "Logout",
      icon: <ExclamationCircleFilled />,
      content: "Are you sure you want to logout ?",
      okText: "Logout",
      okType: "danger",
      cancelButtonProps: {
        type: "default",
        shape: "default",
      },
      onOk() {
        logout.mutate();
      },
    });
  };

  return (
    <Dropdown
      menu={{
        items: [
          {
            key: "1",
            label: (
              <Button
                icon={<LogoutOutlined />}
                type="link"
                onClick={showConfirm}
                style={{
                  padding: 0,
                  height: 32,
                  width: 150,
                  textAlign: "left",
                }}
              >
                Logout
              </Button>
            ),
          },
        ],
      }}
      placement="bottomRight"
    >
      <Button
        shape="circle"
        icon={<UserOutlined />}
        style={{
          marginRight: 16,
          marginLeft: "auto",
        }}
      ></Button>
    </Dropdown>
  );
}
