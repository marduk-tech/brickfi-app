import { EditOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Flex, Modal, Typography } from "antd";
import { useState } from "react";
import { Loader } from "../components/common/loader";
import { ProfileEditModal } from "../components/profile-edit-modal";
import { useAuth } from "../hooks/use-auth";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

export function ProfilePage() {
  const { isMobile } = useDevice();
  const { user, isLoading } = useUser();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    logout.mutate();
    window.location.href = "/app";
    setIsLogoutModalVisible(false);
  };

  const [showProfileEditForm, setShowProfileEditForm] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  if (user) {
    return (
      <>
        <Modal
          title="Logout"
          open={isLogoutModalVisible}
          onOk={handleLogout}
          onCancel={() => setIsLogoutModalVisible(false)}
          okText="Logout"
          okButtonProps={{ danger: true }}
          cancelText="Cancel"
        >
          <p>Are you sure you want to logout?</p>
        </Modal>

        <Flex vertical gap={40} style={{ padding: 16 }}>
          <Flex vertical>
            <Typography.Title level={4}>Your Profile</Typography.Title>
            <Flex
              style={{
                padding: 8,
                backgroundColor: COLORS.bgColor,
                borderRadius: 8,
                border: "1px solid",
                borderColor: COLORS.borderColor,
              }}
              vertical
            >
              <Flex vertical gap={24}>
                <Flex vertical>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.SUB_TEXT,
                      color: COLORS.textColorLight,
                    }}
                  >
                    Name
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_3,
                    }}
                  >
                    {user.profile?.name}
                  </Typography.Text>
                </Flex>
                {user.profile.email ? (
                  <Flex vertical>
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: COLORS.textColorLight,
                      }}
                    >
                      Email
                    </Typography.Text>
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.HEADING_3,
                      }}
                    >
                      {user.profile?.email}
                    </Typography.Text>
                  </Flex>
                ) : null}

                <Flex vertical>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.SUB_TEXT,
                      color: COLORS.textColorLight,
                    }}
                  >
                    Mobile Number
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_3,
                    }}
                  >
                    {user?.mobile}
                  </Typography.Text>

                  <Typography.Text
                    style={{
                      color: COLORS.textColorLight,
                      fontSize: FONT_SIZE.SUB_TEXT,
                    }}
                  >
                    * Login again to update your number
                  </Typography.Text>
                </Flex>
              </Flex>
              <Flex gap={16} style={{ marginTop: 24 }}>
                <ProfileEditModal
                  open={showProfileEditForm}
                  onCancel={() => setShowProfileEditForm(false)}
                />
                <Button
                  type="link"
                  icon={<EditOutlined></EditOutlined>}
                  style={{ padding: 0 }}
                  onClick={() => setShowProfileEditForm(true)}
                >
                  Edit
                </Button>
                <Button
                  icon={<LogoutOutlined />}
                  type="link"
                  onClick={() => setIsLogoutModalVisible(true)}
                  style={{
                    padding: 0,
                  }}
                >
                  Logout
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </>
    );
  }
}
