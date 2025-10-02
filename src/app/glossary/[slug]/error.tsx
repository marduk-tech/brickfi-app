"use client";

import { useEffect } from "react";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <Result
        status="404"
        title="Article Not Found"
        subTitle="Sorry, the glossary article you are looking for does not exist."
        extra={[
          <Button type="primary" key="glossary" onClick={() => router.push("/glossary")}>
            Back to Glossary
          </Button>,
          <Button key="home" onClick={() => router.push("/")}>
            Go Home
          </Button>,
        ]}
      />
    </div>
  );
}
