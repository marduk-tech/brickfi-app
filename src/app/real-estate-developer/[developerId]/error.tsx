"use client";

import { CustomError } from "@/libs/error-handler";
import { Button, Result } from "antd";
import { ResultStatusType } from "antd/es/result";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

// must be a client component
export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  console.error("Real estate developer page error:", error.message);

  const parsedError = CustomError.parse(error);

  return (
    <Result
      status={(parsedError.status?.toString() as ResultStatusType) || "500"}
      title={parsedError?.title || "Something went wrong"}
      subTitle={parsedError?.description || "Please try again later"}
      extra={[
        <Button type="primary" onClick={reset} key="retry">
          Try Again
        </Button>,
        <Button key="home" href="/app">
          Back to Home
        </Button>,
      ]}
    />
  );
}
