import { RightOutlined } from "@ant-design/icons";
import { Empty, List, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useUser } from "../hooks/use-user";
import { FONT_SIZE } from "../theme/style-constants";
import DateObject from "react-date-object";

const { Paragraph } = Typography;

export default function UserSessions() {
  const navigate = useNavigate();
  const { user, isLoading, isError } = useUser();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "50px",
          gap: "20px",
        }}
      >
        <Spin size="large" />
        <Typography.Text>Loading your chat sessions...</Typography.Text>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div style={{ padding: "50px" }}>
        <Empty description="Could not load user sessions" />
      </div>
    );
  }

  const sortedSessions = [...(user.chatSessions || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px" }}>
        <Typography.Title level={2}>Your Chat History</Typography.Title>
        {/* <Typography.Text type="secondary">
          Here are all your previous conversations with Liv
        </Typography.Text> */}
      </div>
      <List
        size="large"
        bordered
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          height: 500,
          scrollbarWidth: "none",
          overflowY: "scroll",
        }}
        dataSource={sortedSessions}
        renderItem={(session) => (
          <List.Item
            style={{
              padding: 16,
              cursor: "pointer",
            }}
            onClick={() => navigate(`/${session.sessionId}`)}
            actions={[
              <RightOutlined key="open" style={{ color: "#8c8c8c" }} />,
            ]}
          >
            <List.Item.Meta
              title={
                <Paragraph
                  ellipsis={{ rows: 1 }}
                  style={{
                    margin: 0,
                    fontSize: FONT_SIZE.HEADING_4,
                  }}
                >
                  {session.startingQuestion}
                </Paragraph>
              }
              description={
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: FONT_SIZE.PARA }}
                >
                  {new DateObject(session.createdAt).format(
                    "dddd DD MMM, hh:mm a"
                  )}
                </Typography.Text>
              }
            />
          </List.Item>
        )}
        locale={{
          emptyText: <Empty description="No chat sessions yet" />,
        }}
      />
    </div>
  );
}
