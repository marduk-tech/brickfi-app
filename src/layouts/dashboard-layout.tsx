"use client";

import { Drawer, Flex, Image, Layout, Modal, Typography } from "antd";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CustomErrorBoundary } from "../components/common/custom-error-boundary";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { LoginForm } from "../components/login-forms";
import { UserDetailsForm } from "../components/user-details-form";
import { useUser } from "../hooks/use-user";
import { LandingConstants, LocalStorageKeys } from "../libs/constants";
import { safeStorage, safeWindow } from "../libs/browser-utils";
import {
  COLORS,
  FONT_SIZE,
  HORIZONTAL_PADDING,
} from "../theme/style-constants";
import { NavLink } from "../types/Common";
import { useDevice } from "../hooks/use-device";

const { Header, Content } = Layout;

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);
  const { isMobile } = useDevice();
  const router = useRouter();

  const { lvnzyProjectId, collectionId } = useParams<{ lvnzyProjectId: string, collectionId: string }>()!;

  useEffect(() => {
    const userItem = safeStorage.getItem(LocalStorageKeys.user);
    const userLocal = userItem ? JSON.parse(userItem) : null;
    if (!userLocal) {
      setLoginModalOpen(true);
    } else {
      setLoginModalOpen(false);
    }
  }, []);

  useEffect(() => {
    if (user && (!user.profile.email || !user.profile.name)) {
      setShowUserDetailsForm(true);
    }
  }, [user]);

  const navLinks: NavLink[] = [
    {
      key: "profile",
      title: "My Profile",
      link: "/app/profile",
      icon: { name: "FaRegUserCircle", set: "fa" },
    },
    {
      key: "consult",
      title: "Brickfi Assist",
      link: LandingConstants.brickAssistLink,
      icon: { name: "RiHomeSmileFill", set: "ri" },
    },
    {
      key: "about",
      title: "Request Brick360 Report",
      link: LandingConstants.genReportFormLink,
      icon: { name: "HiDocumentReport", set: "hi" },
    },
    {
      key: "consult",
      title: "Brickfi Blog",
      link: "/app/profile",
      icon: { name: "FaBookOpen", set: "fa6" },
    },
    {
      key: "about",
      title: "About Brickfi",
      link: "/aboutus",
      icon: { name: "RiTeamFill", set: "ri" },
    },

    {
      key: "chat-history",
      title: "Chat History",
      disabled: true,
      link: "/user-sessions",
      icon: { name: "RiHistoryLine", set: "ri" },
    },
  ];

  const NavLinks = ({ navLinks }: { navLinks: NavLink[] }) => {
    return (
      <>
        {navLinks.map((link) => (
          <Link
            key={link.title}
            href={link.link || "#"}
            onClick={() => {
              setSidebarOpen(false);
            }}
            style={{ marginTop: link.alignBottom ? "auto" : "initial" }}
          >
            <Flex align="center" gap={8}>
              {link.icon.name ? (
                <DynamicReactIcon
                  iconName={link.icon.name}
                  iconSet={link.icon.set as any}
                  size={20}
                  color={COLORS.textColorDark}
                />
              ) : (
                <Image width={16} src={link.icon.src}></Image>
              )}

              <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3 }}>
                {link.title}
              </Typography.Text>
            </Flex>
          </Link>
        ))}
      </>
    );
  };

  return (
    <>
      <Modal
        open={loginModalOpen || showUserDetailsForm}
        closable={false}
        footer={null}
        style={{ padding: 0 }}
        styles={{
          mask: {
            backgroundColor: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(8px)",
          },
        }}
      >
        {showUserDetailsForm ? (
          <UserDetailsForm ignoreCity={true} />
        ) : (
          <LoginForm></LoginForm>
        )}
      </Modal>
      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <Layout
          style={{
            backgroundColor: "#FFF",
          }}
        >
          <Header
            style={{
              background: "transparent",
              height: "60px",
              padding: "0 8px",
            }}
          >
            <Flex
              align="center"
              justify="space-between"
              style={{ height: 60, cursor: "pointer" }}
            >
              <Flex
                onClick={() => {
                  if (lvnzyProjectId || collectionId) {
                    router.push("/app");
                  } else {
                    router.push("/");
                  }
                }}
                style={{ height: 60, display: "flex", alignItems: "center" }}
              >
                <img
                  src="/images/brickfi-logo.png"
                  style={{ height: 16, width: "auto", marginLeft: 4 }}
                ></img>
              </Flex>

              <Flex style={{ marginLeft: "auto", cursor: "pointer" }}>
                <img
                  src="/images/brickfi-assist.png"
                  onClick={() => {
                    if (LandingConstants.brickAssistLink.startsWith('http')) {
                      safeWindow.location.assign(LandingConstants.brickAssistLink);
                    } else {
                      router.push(LandingConstants.brickAssistLink);
                    }
                  }}
                  style={{ height: 32, width: "auto", marginRight: 8 }}
                ></img>
                <Flex
                  onClick={() => {
                    setSidebarOpen(true);
                  }}
                >
                  <DynamicReactIcon
                    iconName="HiOutlineMenuAlt3"
                    iconSet="hi"
                  ></DynamicReactIcon>
                </Flex>
              </Flex>
            </Flex>
          </Header>
          <Drawer
            title=""
            onClose={() => {
              setSidebarOpen(false);
            }}
            open={sidebarOpen}
          >
            <Flex
              vertical
              gap={24}
              align="flex-start"
              style={{ position: "relative", height: "100%" }}
            >
              <NavLinks navLinks={navLinks.filter((l) => !l.disabled)} />
              {/* {user?.savedLvnzyProjects &&
                user.savedLvnzyProjects.length > 1 && (
                  <Select
                    style={{ minWidth: 200 }}
                    placeholder="Select project list"
                    defaultValue={user.savedLvnzyProjects[0]._id}
                    optionFilterProp="label"
                    onChange={(value: string) => {
                      setSidebarOpen(false);
                      navigate(`/app/${value}`);
                    }}
                    options={[
                      { value: "all", label: "All Collections" },
                      ...(user.savedLvnzyProjects?.map((c: any) => ({
                        value: c._id,
                        label: c.collectionName,
                      })) ?? []),
                    ]}
                  />
                )} */}
              <Flex gap={24} vertical style={{ marginTop: "auto" }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorLight,
                  }}
                >
                  Copyright @Marduk Technologies Private Ltd
                </Typography.Text>
              </Flex>
            </Flex>
          </Drawer>
          {loginModalOpen || showUserDetailsForm ? null : (
            <Content
              style={{
                margin: "auto",
                backgroundColor: "#FFF",
                width: "100%",
                padding: isMobile ? 0 : `0 ${HORIZONTAL_PADDING}px`,
                height: "calc(100vh - 300px)",
                overflowY: "scroll",
                scrollbarWidth: "none",
              }}
            >
              <CustomErrorBoundary>
{children}
              </CustomErrorBoundary>
            </Content>
          )}
        </Layout>
      </Layout>
    </>
  );
};
