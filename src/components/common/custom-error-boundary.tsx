import { Button, Flex, Typography } from "antd";
import { AxiosError } from "axios";
import { ErrorBoundary } from "react-error-boundary";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";

export function CustomErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallbackRender={ErrorBoundaryFallback}>
      {children}
    </ErrorBoundary>
  );
}

export function ErrorBoundaryFallback({ error }: { error: AxiosError<any> }) {
  const errorMessage =
    error.response?.data.message || error.message || "Something went wrong";

  return (
    <Flex align="center" justify="center" style={{ width: "100%" }}>
      <Flex
        vertical
        align="center"
        style={{
          margin: 16,
          backgroundColor: COLORS.bgColorBlue,
          borderRadius: 16,
          padding: "32px 16px",
          boxShadow: "0px 4px 10px rgba(80, 174, 211, 0.3)",
          marginTop: 100,
          maxWidth: 500,
          minWidth: 300,
          textAlign: "center",
        }}
      >
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: "bold" }}
        >
          Oops. There was an error!
        </Typography.Text>
        <img src="/images/error-img.png" height={150}></img>
        <Typography.Text style={{ fontSize: FONT_SIZE.PARA, marginTop: 16 }}>
          Looks like we have encountered an error. <br></br>Please try and
          reload this page. If the problem persist, please drop a mail to{" "}
          <a style={{ fontWeight: "bold" }} href="mailto:support@brickfi.in">
            support@brickfi.in
          </a>
          .
        </Typography.Text>
        <Button
          onClick={() => {
            window.location.reload();
          }}
          size="small"
          type="primary"
          style={{ marginTop: 32 }}
        >
          Reload Page
        </Button>
      </Flex>
    </Flex>
  );
}
