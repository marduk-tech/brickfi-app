"use client";

import LandingFooter from "@/custom-pages/landing/footer";
import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  message,
  Tag,
  Typography,
} from "antd";
import Link from "antd/es/typography/Link";
import { AxiosError } from "axios";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LandingHeader from "../../custom-pages/landing/header";
import { useDevice } from "../../hooks/use-device";
import { MarketingProject as ReraProject } from "../../hooks/use-marketing-project-search";
import { useUser } from "../../hooks/use-user";
import {
  useCreateUserMutation,
  useSendUserMailMutation,
} from "../../hooks/user-hooks";
import { LandingConstants, queryKeys } from "../../libs/constants";
import { capitalize } from "../../libs/lvnzy-helper";
import { queryClient } from "../../libs/query-client";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LoginForm } from "../login-forms";
import DynamicReactIcon from "../common/dynamic-react-icon";
import { Loader } from "../common/loader";
import { ProjectSelectStep, ProjectSelectStepState } from "./project-select-step";

export const NewReportRequestForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIds = searchParams.get("projectIds")?.split(",").filter(Boolean);
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [userWentBack, setUserWentBack] = useState(false);
  const [projectSelectState, setProjectSelectState] = useState<ProjectSelectStepState>({
    selectedProjects: [],
    reportsLeft: 0,
    userReportLimitReached: false,
  });
  const selectedProjects = projectSelectState.selectedProjects;
  const createUser = useCreateUserMutation({ enableToasts: false });
  const sendMail = useSendUserMailMutation();
  const { user } = useUser();
  const { isMobile } = useDevice();
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  const handleProjectStateChange = useCallback((state: ProjectSelectStepState) => {
    setProjectSelectState(state);
  }, []);

  const [flickerWait, setFlickerWait] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFlickerWait(false);
    }, 1000);
  }, []);

  const [errorMsg, setErrorMsg] = useState<ReactNode>();

  const handleNext = async () => {
    if (selectedProjects.length === 0) {
      message.error("Please select at least one project.");
      return;
    }
    if (user) {
      processReportRequest();
    } else {
      setStep(2);
    }
  };

  const processReportRequest = async (formValues?: any) => {
    const requestedReports = selectedProjects.map((p) => ({
      projectName: p.projectName,
      ...(p.reraNumber && { reraNumber: p.reraNumber }),
      ...(p.lvnzyProjectId && { lvnzyProjectId: p.lvnzyProjectId }),
    }));
    try {
      let responseUser;
      if (user) {
        responseUser = await createUser.mutateAsync({
          userData: {
            profile: user.profile,
            mobile: user.mobile,
            countryCode: user.countryCode,
            requestedReports,
          },
        });
      } else {
        // Use verified user data from mobile authentication
        const userMobile = verifiedUser?.mobile || formValues.mobile;
        const userCountryCode = verifiedUser?.countryCode || "91";

        responseUser = await createUser.mutateAsync({
          userData: {
            profile: {
              name: formValues.name,
              email: formValues.email,
            },
            mobile: userMobile,
            countryCode: userCountryCode,
            requestedReports,
          },
        });
      }

      if (responseUser) {
        if (responseUser.requestedReports) {
          setStep(3);
        }

        await sendMail.mutateAsync({
          userId: responseUser._id,
          emailType: "report-request",
          params: {
            requestedReports,
          },
        });

        // send "Report Ready" email
        const readyProjects = selectedProjects.filter((p) => p.lvnzyProjectId);

        if (readyProjects.length > 0) {
          const readyProjectNames = readyProjects
            .map((p) => capitalize(p.projectName))
            .join(", ");

          await sendMail.mutateAsync({
            userId: responseUser._id,
            emailType: "report-ready",
            params: {
              projectNames: readyProjectNames,
              seeReportLink: "https://brickfi.in/app",
            },
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: [queryKeys.user] });
    } catch (error) {
      const axiosError = error as AxiosError<{
        message: string;
        response: any;
      }>;
      setErrorMsg(
        <Alert
          message="Oops. Looks like there was an error. Please try again."
          type="error"
        />,
      );
    }
  };

  const onFinish = async (values: any) => {
    await processReportRequest(values);
  };

  const categorizeProjects = () => {
    const ready = selectedProjects.filter((p) => p.lvnzyProjectId);
    const notReady = selectedProjects.filter((p) => !p.lvnzyProjectId);
    return { ready, notReady };
  };

  const renderSuccessMessage = () => {
    const { ready, notReady } = categorizeProjects();

    // all projects ready
    if (ready.length === selectedProjects.length) {
      return (
        <>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_1,
              lineHeight: "120%",
              marginBottom: 16,
            }}
          >
            Wohoo! Your Brick360 Report is ready and available.
          </Typography.Text>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
            Click below to login to your account and see the reports.
          </Typography.Text>

          <Button
            type="primary"
            size="large"
            style={{ marginTop: 24 }}
            onClick={() => {
              window.open(`${window.location.origin}/app`, "_blank");
            }}
          >
            View My Reports
          </Button>
        </>
      );
    }

    // no projects ready
    if (notReady.length === selectedProjects.length) {
      return (
        <>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_1,
              lineHeight: "120%",
              marginBottom: 16,
            }}
          >
            Request submitted.
          </Typography.Text>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
            Your request is important to us. However, we are constrained by our
            bandwidth and continously working to prepare detailed projects
            across Bangalore.
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              fontWeight: "bold",
              marginTop: 16,
            }}
          >
            Once your requested report is available, we will notify you via
            email and message. You can also request a callback to expedite your
            report request.
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              fontWeight: "bold",
              marginTop: 8,
            }}
          >
            You can also request a{" "}
            <Link href={LandingConstants.callbackLink}>callback here</Link> to
            expedite your report request.
          </Typography.Text>
        </>
      );
    }

    // mixed some ready, some not ready
    const notReadyNames = notReady
      .map((p) => capitalize(p.projectName))
      .join(", ");
    const readyNames = ready.map((p) => capitalize(p.projectName)).join(", ");

    return (
      <>
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_1,
            lineHeight: "120%",
            marginBottom: 16,
          }}
        >
          Wohoo! Your Brick360 Report is ready for selected projects.
        </Typography.Text>
        <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
          Click below to login to your account and see report for{" "}
          <span style={{ color: COLORS.primaryColor }}>{readyNames}</span>.
        </Typography.Text>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_4, marginTop: 8 }}
        >
          For other projects - <b>{notReadyNames}</b>, your request is submitted
          to queue. We are continously working to prepare detailed projects
          across Bangalore and will get back to you once the report is
          available.
        </Typography.Text>

        <Button
          type="primary"
          size="large"
          style={{ marginTop: 24 }}
          onClick={() => {
            window.open(`${window.location.origin}/app`, "_blank");
          }}
        >
          View My Reports
        </Button>
      </>
    );
  };

  const renderBanner = () => {
    return (
      <Flex
        style={{
          width: `calc(${isMobile ? "100%" : "50%"} - 32px)`,
          padding: 16,
        }}
        justify="center"
      >
        {/* <img
            src="/images/landing/brick360-request-1.png"
            style={{
              height: isMobile ? 200 : 400,
              marginTop: isMobile ? 0 : 50,
            }}
          /> */}
        <div
          style={{
            backgroundImage: `url(/images/landing/brick360-request-1.png)`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: isMobile ? 200 : 400,
            width: isMobile ? "100%" : "80%",
          }}
        ></div>
      </Flex>
    );
  };
  if (flickerWait) {
    return (
      <Flex style={{ marginTop: 200 }} align="center" justify="center">
        <Loader></Loader>
      </Flex>
    );
  }

  return (
    <>
      <LandingHeader
        bgColor="transparent"
        logo="/images/brickfi-logo.png"
        color={COLORS.textColorMedium}
        isMobile={isMobile}
      ></LandingHeader>
      <Flex
        vertical={isMobile}
        style={{
          paddingTop: isMobile ? 72 : 100,
          minHeight: "calc(100vh - 100px)",
        }}
      >
        {isMobile ? null : renderBanner()}
        <Flex
          style={{
            width: `calc(${isMobile ? "100%" : "50%"} - 32px)`,
            padding: "8px 16px",
            height: "100%",
            maxWidth: 600,
            marginTop: 0,
          }}
          vertical
        >
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_3,
              color: COLORS.primaryColor,
            }}
          >
            REQUEST BRICK360 REPORT
          </Typography.Text>

          <Flex
            vertical
            style={{
              padding: "0 16px",
              backgroundColor: COLORS.bgColor,
              marginTop: 8,
              border: "1px solid",
              borderColor: COLORS.borderColor,
              borderRadius: 16,
            }}
          >
            {step === 1 && (
              <ProjectSelectStep
                projectIds={projectIds}
                onChange={handleProjectStateChange}
                onAutoPopulate={userWentBack ? undefined : () => setStep(2)}
                onSubmit={handleNext}
                submitLoading={createUser.isPending && !!user}
              />
            )}
            {step === 2 && (
              <>
                <Flex
                  gap={8}
                  wrap="wrap"
                  style={{ marginBottom: 16, marginTop: 16 }}
                >
                  {selectedProjects.map((p) => (
                    <Flex>
                      <Tag
                        key={p.projectName}
                        color={p.lvnzyProjectId ? "blue": "default"}
                        style={{
                          fontSize: FONT_SIZE.HEADING_4,
                          padding: "4px 8px",
                        }}
                      >
                        <Flex align="center" gap={4}>
                        {p.lvnzyProjectId ? (
                          <DynamicReactIcon
                            iconName="GiElectric"
                            iconSet="gi"
                            color={p.lvnzyProjectId ? "blue": "default"}
                            size={12}
                          />
                        ) : (
                          <DynamicReactIcon
                            iconName="LuCircleFadingArrowUp"
                            iconSet="lu"
                            size={12}
                          />
                        )}

                        {capitalize(p.projectName)}
                        </Flex>
                      </Tag>
                    </Flex>
                  ))}
                </Flex>
                <Typography.Text
                  style={{ marginBottom: 8, color: COLORS.textColorLight }}
                >
                  Share contact details to receive the report
                </Typography.Text>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  style={{ width: "100%", maxWidth: 500, }}
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}
                    style={{margin: 0}}
                  >
                    <Input style={{height: 40}} />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="Email Address"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      {
                        type: "email",
                        message: "Please enter a valid email",
                      },
                    ]}
                  >
                    <Input style={{height: 40}}/>
                  </Form.Item>
                  <Typography.Text>Your Mobile Number</Typography.Text>
                  {isMobileVerified ? (
                    <Flex vertical>
                      <Flex align="center" gap={8}>
                        <Typography.Text
                          style={{ fontSize: FONT_SIZE.HEADING_2 }}
                        >
                          +{verifiedUser?.countryCode} {verifiedUser?.mobile}
                        </Typography.Text>
                        <DynamicReactIcon
                          iconName="MdVerifiedUser"
                          iconSet="md"
                          color={COLORS.primaryColor}
                        ></DynamicReactIcon>
                        <Button type="link">Edit</Button>
                      </Flex>
                    </Flex>
                  ) : (
                    <LoginForm
                      onMobVerified={(updatedUser: any) => {
                        setVerifiedUser(updatedUser);
                        setIsMobileVerified(true);
                      }}
                    ></LoginForm>
                  )}
                </Form>
              </>
            )}

            {step == 3 && (
              <Flex vertical style={{ padding: "32px 0" }}>
                {renderSuccessMessage()}
              </Flex>
            )}
          </Flex>
          {step !== 3 && errorMsg ? errorMsg : null}
          <Flex style={{ marginTop: 16 }} gap={16}>
            {step == 2
                ? [
                    <Button key="back" onClick={() => { setStep(1); setUserWentBack(true); router.replace(window.location.pathname); }}>
                      Back
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      loading={createUser.isPending}
                      disabled={!isMobileVerified}
                      onClick={() => form.submit()}
                    >
                      Submit
                    </Button>,
                  ]
                : null}
          </Flex>
        </Flex>
        {isMobile ? renderBanner() : null}
      </Flex>
      <LandingFooter></LandingFooter>
    </>
  );
};
