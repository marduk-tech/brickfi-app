"use client";

import { Brick360v2 } from "@/components/brick-360/brick360-v2";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { Loader } from "@/components/common/loader";
import { useDevice } from "@/hooks/use-device";
import { useFetchAccessibleLvnzyProjectBySlug } from "@/hooks/use-lvnzy-project";
import { useUser } from "@/hooks/use-user";
import { CustomError } from "@/libs/error-handler";
import { captureAnalyticsEvent } from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { Button, Flex, Modal, Typography } from "antd";
import Link from "antd/es/typography/Link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const REPORT_ACCESS_DENIED_MESSAGE =
  "You don't have access to this Brick360 Report. You can submit a request or if you need additional assistance, you can reachout to a Brickfi Advisor.";

function AccessDeniedState() {
  const { isMobile } = useDevice();

  return (
    <>
      <Flex
        vertical
        align="flex-start"
        justify="flex-start"
        gap={16}
        style={{
          minHeight: "70vh",
          maxWidth: 720,
          textAlign: "center",
          padding: "32px",
          marginTop: 128,
          marginLeft: isMobile ? 0 : 200,
        }}
      >
        <DynamicReactIcon
          size={64}
          color={COLORS.textColorDark}
          iconName="TbFaceIdError"
          iconSet="tb"
        ></DynamicReactIcon>
        <Typography.Text
          style={{
            margin: 0,
            fontSize: FONT_SIZE.HEADING_1,
            textAlign: "left",
            alignSelf: "flex-start",
            fontWeight: 500,
          }}
        >
          Access Denied
        </Typography.Text>
        <Typography.Text
          style={{ textAlign: "left", fontSize: FONT_SIZE.HEADING_3 }}
        >
          {REPORT_ACCESS_DENIED_MESSAGE}
        </Typography.Text>
        <Flex gap={12} wrap align="flex-start">
          <Link href="/requestreport" target="_blank">
            <Button type="primary">Request a Brick360 Report</Button>
          </Link>
          <Link
            href="/callback-request?srcIntent=brick360-access-denied"
            target="_blank"
          >
            <Button>Reachout to an Advisor</Button>
          </Link>
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

  const shouldFetchReport =
    !!user?._id &&
    !["admin", "member"].includes(user.role || "") &&
    (!canCheckLocally || !!accessibleProject);

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
    !!user &&
    !["admin", "member"].includes(user.role || "") &&
    !userLoading &&
    canCheckLocally &&
    !accessibleProject;
  const isDeniedByApi = parsedError?.status === 403;

  if (flickerWait || userLoading || (!user && !isAccessDenied)) {
    return (
      <Flex style={{ marginTop: 200 }} align="center" justify="center">
        <Loader />
      </Flex>
    );
  }

  if (isAccessDenied || isDeniedByApi) {
    captureAnalyticsEvent("report-invalid-access", {
     projectName: lvnzyProject?.meta.projectName,
      projectId: lvnzyProject?._id,
    });
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

  if (
    !["admin", "member"].includes(user.role || "") &&
    (projectLoading || !lvnzyProject)
  ) {
    return (
      <Flex style={{ marginTop: 200 }} align="center" justify="center">
        <Loader />
      </Flex>
    );
  }

  return <Brick360v2 slug={slug} projectData={lvnzyProject} />;
}
