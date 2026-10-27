"use client";

import { Collapse, Drawer, Flex, Image, Layout, Modal, Spin, Typography } from "antd";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { CustomErrorBoundary } from "../components/common/custom-error-boundary";
import DynamicReactIcon from "../components/common/dynamic-react-icon";
import { LoginForm } from "../components/login-forms";
import { UserDetailsForm } from "../components/user-details-form";
import { formatThreadDate, useFetchChatThreads } from "../hooks/use-chat-threads";
import { useDevice } from "../hooks/use-device";
import { useUser } from "../hooks/use-user";
import { safeStorage, safeWindow } from "../libs/browser-utils";
import { LandingConstants, LocalStorageKeys } from "../libs/constants";
import {
  COLORS,
  FONT_SIZE,
  HORIZONTAL_PADDING,
} from "../theme/style-constants";
import { NavLink } from "../types/Common";
import { ChatThread } from "../types/User";

const { Header, Content } = Layout;

const ThreadList: React.FC<{
  threads: ChatThread[];
  loading: boolean;
  emptyText: string;
  onSelect: (threadId: string) => void;
}> = ({ threads, loading, emptyText, onSelect }) => {
  if (loading) {
    return (
      <Flex align="center" gap={8}>
        <Spin size="small" />
        <Typography.Text
          type="secondary"
          style={{ fontSize: FONT_SIZE.SUB_TEXT }}
        >
          Loading...
        </Typography.Text>
      </Flex>
    );
  }

  if (!threads.length) {
    return (
      <Typography.Text type="secondary" style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
        {emptyText}
      </Typography.Text>
    );
  }

  return (
    <Flex vertical style={{ maxHeight: 300, overflowY: "auto" }}>
      {threads.map((thread, index) => (
        <Flex
          key={thread.thread_id}
          vertical
          gap={2}
          onClick={() => onSelect(thread.thread_id)}
          style={{
            cursor: "pointer",
            padding: "8px 0",
            borderBottom:
              index === threads.length - 1
                ? "none"
                : `1px solid ${COLORS.borderColorMedium}`,
          }}
        >
          <Typography.Text ellipsis style={{ fontSize: FONT_SIZE.PARA }}>
            {thread.thread_title}
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ fontSize: FONT_SIZE.SUB_TEXT }}
          >
            {formatThreadDate(thread.createdAt)}
          </Typography.Text>
        </Flex>
      ))}
    </Flex>
  );
};

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading: userLoading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [showUserDetailsForm, setShowUserDetailsForm] = useState(false);
  const { isMobile } = useDevice();
  const router = useRouter();
  const pathname = usePathname();
  // brickchat lets guests run one query and shows its own sign-in popup
  const isBrickChatPath =
    pathname === "/app/brickchat" || pathname.startsWith("/app/brickchat/");
  const {
    data: chatThreads,
    isLoading: chatThreadsLoading,
    refetch: refetchChatThreads,
  } = useFetchChatThreads(user?._id);
  const bookmarkedThreads = chatThreads?.filter((t) => t.isBookmarked) ?? [];

  const openThread = (threadId: string) => {
    setSidebarOpen(false);
    router.push(`/app/brickchat/${encodeURIComponent(threadId)}`);
  };

  const { lvnzyProjectId, collectionId } = useParams<{
    lvnzyProjectId: string;
    collectionId: string;
  }>()!;

  useEffect(() => {
    const userItem = safeStorage.getItem(LocalStorageKeys.user);
    const userLocal = userItem ? JSON.parse(userItem) : null;
    if (!userLocal && pathname === "/app") {
      setLoginModalOpen(false);
      router.replace(`/app/brickchat${window.location.search}`);
    } else if (!userLocal && !isBrickChatPath) {
      setLoginModalOpen(true);
    } else {
      setLoginModalOpen(false);
    }
  }, [isBrickChatPath, pathname, router]);

  useEffect(() => {
    if (user) {
      // close login modal when user is successfully authenticated
      setLoginModalOpen(false);

      // if (!user.profile.email || !user.profile.name) {
      //   setShowUserDetailsForm(true);
      // }
    }
  }, [user]);

  useEffect(() => {
    const checkUserInStorage = () => {
      const userItem = safeStorage.getItem(LocalStorageKeys.user);
      if (userItem && loginModalOpen) {
        console.log("Fallback: User found in localStorage, closing modal");
        setLoginModalOpen(false);
      }
    };

    checkUserInStorage();
    const interval = setInterval(checkUserInStorage, 500);

    return () => clearInterval(interval);
  }, [loginModalOpen]);

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
      key: "chat",
      title: "Brick Chat",
      disabled: !user || user.role !== "admin" ,
      link: "/app/brickchat",
      icon: { name: "MdChat", set: "md" },
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
            <Flex align="center" gap={4}>
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

              <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
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
          <Flex vertical>
            <Flex vertical>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_1,
                  fontWeight: 500,
                }}
              >
                Welcome To Brickfi
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_3,
                  marginBottom: 24,
                  color: COLORS.textColorMedium,
                }}
              >
                Login/Signup with your mobile number
              </Typography.Text>
            </Flex>
            <LoginForm
              onMobVerified={(user: any) => {
                console.log("Login successful, closing modal", user);
                setLoginModalOpen(false);
              }}
            ></LoginForm>
          </Flex>
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
              <Flex align="center" gap={12} style={{ height: 60 }}>
                <Flex
                  onClick={() => {
                    setSidebarOpen(true);
                    refetchChatThreads();
                  }}
                  style={{ marginLeft: 4 }}
                >
                  <DynamicReactIcon
                    iconName="HiOutlineMenuAlt3"
                    iconSet="hi"
                  ></DynamicReactIcon>
                </Flex>
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
                    style={{ height: 16, width: "auto" }}
                  ></img>
                </Flex>
              </Flex>
              <Flex style={{ marginLeft: "auto" }} align="center">
                <Link href="/feedback" target="_blank">
                <Flex
                  style={{
                    border: `1px solid ${COLORS.textColorDark}`,
                    padding: "0 4px",
                    borderRadius: 8,
                    marginRight: 16,
                    height: 24
                  }}
                  align="center"
                  gap={4}
                >

                  <DynamicReactIcon iconName="MdFeedback" iconSet="md" size={14} color={COLORS.textColorDark}></DynamicReactIcon>
                  <Typography.Text
                    style={{
                      color: COLORS.textColorDark,
                      lineHeight: "100%",
                      fontSize: FONT_SIZE.SUB_TEXT,
                    }}
                  >
                    Feedback
                  </Typography.Text>

                </Flex>
                </Link>

                <Flex style={{ cursor: "pointer" }}>
                  <img
                    src="/images/brickfi-assist.png"
                    onClick={() => {
                      if (LandingConstants.brickAssistLink.startsWith("http")) {
                        safeWindow.location.assign(
                          LandingConstants.brickAssistLink
                        );
                      } else {
                        router.push(LandingConstants.brickAssistLink);
                      }
                    }}
                    style={{ height: 32, width: "auto" }}
                  ></img>
                </Flex>
              </Flex>
            </Flex>
          </Header>
          <Drawer
            title=""
            placement="left"
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
              {user?._id && (
                <Collapse
                  style={{ width: "100%" }}
                  defaultActiveKey={[]}
                  items={[
                    {
                      key: "bookmarked",
                      label: "Bookmarked",
                      children: (
                        <ThreadList
                          threads={bookmarkedThreads}
                          loading={chatThreadsLoading}
                          emptyText="No bookmarked chats yet."
                          onSelect={openThread}
                        />
                      ),
                    },
                    {
                      key: "recent-chats",
                      label: "Recent Chats",
                      children: (
                        <ThreadList
                          threads={chatThreads ?? []}
                          loading={chatThreadsLoading}
                          emptyText="No recent chats yet."
                          onSelect={openThread}
                        />
                      ),
                    },
                  ]}
                  
                />
              )}
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
              <CustomErrorBoundary>{children}</CustomErrorBoundary>
            </Content>
          )}
        </Layout>
      </Layout>
    </>
  );
};
