"use client";

import { Brick360v2 } from "@/components/brick-360/brick360-v2";
import { Loader } from "@/components/common/loader";
import { useFetchAccessibleLvnzyProjectBySlug } from "@/hooks/use-lvnzy-project";
import { useUser } from "@/hooks/use-user";
import { CustomError } from "@/libs/error-handler";
import { Button, Flex, Modal, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const REPORT_ACCESS_DENIED_MESSAGE =
  "You don't have access to this report. Please request for one or reachout to Brickfi.";

function AccessDeniedState() {
  const router = useRouter();

  return (
    <>
      <Modal
        open
        closable={false}
        footer={null}
        maskClosable={false}
        centered
      >
        <Flex vertical gap={16}>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Access denied
          </Typography.Title>
          <Typography.Text>{REPORT_ACCESS_DENIED_MESSAGE}</Typography.Text>
          <Flex gap={12} wrap>
            <Button type="primary" onClick={() => router.push("/requestreport")}>
              Request for one
            </Button>
            <Button onClick={() => router.push("/brickassist")}>
              Reachout
            </Button>
          </Flex>
        </Flex>
      </Modal>

      <Flex
        vertical
        align="center"
        justify="center"
        gap={16}
        style={{ minHeight: "70vh", textAlign: "center", padding: "24px" }}
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          This report is not available on your account
        </Typography.Title>
        <Typography.Text style={{ maxWidth: 520 }}>
          {REPORT_ACCESS_DENIED_MESSAGE}
        </Typography.Text>
        <Flex gap={12} wrap justify="center">
          <Button type="primary" onClick={() => router.push("/requestreport")}>
            Request for one
          </Button>
          <Button onClick={() => router.push("/brickassist")}>Reachout</Button>
        </Flex>
      </Flex>
    </>
  );
}

export default function Brick360Client({ slug }: { slug: string }) {
  const [flickerWait, setFlickerWait] = useState(true);
  const { user, isLoading: userLoading } = useUser();

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFlickerWait(false);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, []);

  const savedProjects = useMemo(
    () =>
      user?.savedLvnzyProjects?.flatMap(
        (collection: any) => collection?.projects || [],
      ) || [],
    [user?.savedLvnzyProjects],
  );

  const accessibleProject = useMemo(
    () =>
      savedProjects.find((project: any) => {
        if (!project || typeof project !== "object") {
          return false;
        }

        return project.slug === slug || project._id === slug;
      }),
    [savedProjects, slug],
  );

  const canCheckLocally = useMemo(() => {
    if (!savedProjects.length) {
      return true;
    }

    return savedProjects.every(
      (project: any) => !project || typeof project === "object",
    );
  }, [savedProjects]);

  const shouldFetchReport = !!user?._id && (!canCheckLocally || !!accessibleProject);

  const {
    data: lvnzyProject,
    isLoading: projectLoading,
    error,
  } = useFetchAccessibleLvnzyProjectBySlug({
    slug,
    userId: user?._id || "",
    enabled: shouldFetchReport,
  });

  const parsedError = error ? CustomError.parse(error) : null;
  const isAccessDenied =
    !!user && !userLoading && canCheckLocally && !accessibleProject;
  const isDeniedByApi = parsedError?.status === 403;

  if (flickerWait || userLoading || (!user && !isAccessDenied)) {
    return (
      <Flex style={{ marginTop: 200 }} align="center" justify="center">
        <Loader />
      </Flex>
    );
  }

  if (isAccessDenied || isDeniedByApi) {
    return <AccessDeniedState />;
  }

  if (parsedError && parsedError.status !== 403) {
    return (
      <Flex
        vertical
        align="center"
        justify="center"
        gap={8}
        style={{ minHeight: "70vh", textAlign: "center", padding: "24px" }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          Unable to load this report
        </Typography.Title>
        <Typography.Text>{parsedError.description}</Typography.Text>
      </Flex>
    );
  }

  if (projectLoading || !lvnzyProject) {
    return (
      <Flex style={{ marginTop: 200 }} align="center" justify="center">
        <Loader />
      </Flex>
    );
  }

  return <Brick360v2 slug={slug} projectData={lvnzyProject} />;
}
