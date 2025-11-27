"use client";

import LandingFooter from "@/custom-pages/landing/footer";
import {
  Alert,
  AutoComplete,
  Button,
  Col,
  Flex,
  Form,
  Input,
  message,
  Row,
  Tag,
  Typography,
} from "antd";
import Link from "antd/es/typography/Link";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import LandingHeader from "../../custom-pages/landing/header";
import { useDevice } from "../../hooks/use-device";
import {
  MarketingProject as ReraProject,
  useMarketingProjectSearch as useReraProjectSearch,
} from "../../hooks/use-marketing-project-search";
import { useUser } from "../../hooks/use-user";
import {
  useCreateUserMutation,
  useSendUserMailMutation,
} from "../../hooks/user-hooks";
import { safeWindow } from "../../libs/browser-utils";
import { LandingConstants, queryKeys } from "../../libs/constants";
import { capitalize } from "../../libs/lvnzy-helper";
import { queryClient } from "../../libs/query-client";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { LoginForm } from "../login-forms";
import DynamicReactIcon from "./dynamic-react-icon";
import { Loader } from "./loader";
const { Paragraph } = Typography;

const MAX_FREE_REPORTS = parseInt(process.env.NEXT_MAX_FREE_REPORTS || "2");
export const NewReportRequestForm = () => {
  const [form] = Form.useForm();
  const [step, setStep] = useState(1);
  const [selectedProjects, setSelectedProjects] = useState<ReraProject[]>([]);
  const { projects, isLoading: reraProjectNamesLoading } =
    useReraProjectSearch();
  const createUser = useCreateUserMutation({ enableToasts: false });
  const sendMail = useSendUserMailMutation();
  const { user } = useUser();
  const { isMobile } = useDevice();
  const [reportsLeft, setReportsLeft] = useState<number>(MAX_FREE_REPORTS);
  const [maxReportsRequested, setMaxReportsRequested] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [projectOptions, setProjectOptions] = useState<any[]>([]);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  const [flickerWait, setFlickerWait] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setFlickerWait(false);
    }, 1000);
  });

  const [errorMsg, setErrorMsg] = useState<ReactNode>();

  useEffect(() => {
    if (projects && projects.length) {
      const projectOptions: any[] = (projects || [])
        .filter(
          (p) => !selectedProjects.some((s) => s.projectName === p.projectName)
        )
        .sort((projectA, projectB) =>
          projectA.lvnzyProjectId && projectB.lvnzyProjectId
            ? 0
            : projectA.lvnzyProjectId
              ? -1
              : 1
        )
        .map((project) => ({
          value: project.projectName,
          label: (
            <span
              style={{
                color: project.lvnzyProjectId
                  ? COLORS.textColorDark
                  : COLORS.textColorMedium,
              }}
            >
              {capitalize(project.projectName)}
            </span>
          ),
          project,
        }));
      setProjectOptions(projectOptions);
    }
  }, [projects]);

  const handleSelectProject = (_: any, option: any) => {
    const newProject = option.project;
    const alreadySelected = selectedProjects.some(
      (p) => p.projectName === newProject.projectName
    );

    if (alreadySelected) {
      message.warning("This project is already selected.");
      return;
    }

    if (selectedProjects.length < MAX_FREE_REPORTS) {
      setSelectedProjects([...selectedProjects, newProject]);
      setSearchValue("");
    } else {
      message.warning(
        `You can select a maximum of ${MAX_FREE_REPORTS} projects.`
      );
    }
  };
  const handleRemoveProject = (projectName: string) => {
    setSelectedProjects(
      selectedProjects.filter((p) => p.projectName !== projectName)
    );
  };

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
      if (
        axiosError.response &&
        axiosError.response.data &&
        (axiosError.response as any).data.maxReportsRequested
      ) {
        setMaxReportsRequested(true);
      } else {
        setErrorMsg(
          <Alert
            message="Oops. Looks like there was an error. Please try again."
            type="error"
          />
        );
      }
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
            onClick={() => router.push("/app")}
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
            Wohoo! Your request is submitted to queue.
          </Typography.Text>
          <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4 }}>
            We will get back to you with a detailed report once available.
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              fontWeight: "bold",
              marginTop: 16,
            }}
          >
            We will notify you via email and message once its ready.
          </Typography.Text>
        </>
      );
    }

    // mixed some ready, some not ready
    const notReadyNames = notReady
      .map((p) => capitalize(p.projectName))
      .join(", ");

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
          Click below to login to your account and see the reports. For other
          projects - {notReadyNames}; your request is submitted to queue. We
          will get back to you with a detailed report once available.
        </Typography.Text>
        <Button
          type="primary"
          size="large"
          style={{ marginTop: 24 }}
          onClick={() => (window.location.href = "https://www.brickfi.in/app")}
        >
          View My Reports
        </Button>
      </>
    );
  };

  const renderMaxReportsMsg = (userLimitReached?: boolean) => {
    return (
      <Flex style={{ maxWidth: "100%", margin: "8px 0" }} vertical>
        <Tag
          style={{
            width: "100%",
            textWrap: "wrap",
            backgroundColor: COLORS.bgColorBlue,
            padding: "8px 8px",
            borderRadius: 8,
            border: 0,
            margin: 0,
          }}
        >
          <Flex vertical>
            {" "}
            <Flex align="center" gap={4}>
              {/* <DynamicReactIcon
                iconName={
                  !userLimitReached
                    ? "IoMdInformationCircle"
                    : "BiSolidErrorCircle"
                }
                iconSet={!userLimitReached ? "io" : "bi"}
                size={20}
                color={COLORS.primaryColor}
              ></DynamicReactIcon> */}
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  lineHeight: "110%",
                  color: COLORS.textColorMedium,
                  display: "flex",
                }}
              >
                {" "}
                {userLimitReached
                  ? "Oops! Looks like this mobile has already requested max number of free reports."
                  : "You can generate report for upto 2 projects for free."}
              </Typography.Text>
            </Flex>
            {userLimitReached ? (
              <Link
                href="/brickassist"
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  marginTop: 16,
                  color: COLORS.primaryColor,
                }}
              >
                {" "}
                Looking for more ? Schedule a callback with us.
              </Link>
            ) : null}
          </Flex>
        </Tag>
      </Flex>
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
  useEffect(() => {
    if (user && user.requestedReports) {
      setReportsLeft(MAX_FREE_REPORTS - user.requestedReports.length);
      if (MAX_FREE_REPORTS - user.requestedReports.length <= 0) {
        setMaxReportsRequested(true);
      }
    }
  }, [user]);

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
            padding: 16,
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
              padding: 16,
              backgroundColor: COLORS.bgColor,
              marginTop: 8,
              border: "1px solid",
              borderColor: COLORS.borderColor,
              borderRadius: 16,
            }}
          >
            {step === 1 && (
              <Flex vertical style={{ padding: "16px 0" }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1,
                    lineHeight: "120%",
                  }}
                >
                  Search for a Project in Bangalore.
                </Typography.Text>
                {reportsLeft > 0 && (
                  <Typography.Text
                    style={{ fontSize: FONT_SIZE.HEADING_4, marginBottom: 24 }}
                  >
                    You can request report for upto {reportsLeft} projects. It
                    will be shared within 2 business days.
                  </Typography.Text>
                )}

                <AutoComplete
                  style={{
                    width: "100%",
                    marginBottom: 16,
                    maxWidth: 500,
                    marginTop: 8,
                  }}
                  options={projectOptions}
                  value={searchValue}
                  onChange={setSearchValue}
                  onSelect={handleSelectProject}
                  filterOption={(inputValue, option) =>
                    option!.label
                      .toLowerCase()
                      .includes(inputValue.toLowerCase())
                  }
                  placeholder={
                    reraProjectNamesLoading
                      ? "Loading projects, please wait.."
                      : "Search project name..."
                  }
                  disabled={
                    !reportsLeft ||
                    selectedProjects.length >= MAX_FREE_REPORTS ||
                    reraProjectNamesLoading
                  }
                >
                  <Input.Search loading={reraProjectNamesLoading} />
                </AutoComplete>
                <a
                  style={{
                    textDecoration: "none",
                    marginTop: -8,
                    color: COLORS.primaryColor,

                    fontSize: FONT_SIZE.PARA,
                  }}
                  target="_blank"
                  href={LandingConstants.sampleReport}
                >
                  Looking for a sample report ? Click here.
                </a>

                <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                  {selectedProjects.map((p, index) => (
                    <Col key={p.projectName} style={{ width: "100%" }}>
                      <Flex
                        style={{
                          width: "100%",
                          borderBottom:
                            index == selectedProjects.length - 1
                              ? "none"
                              : `1px solid ${COLORS.borderColor}`,
                          borderColor: COLORS.borderColor,
                        }}
                      >
                        <Paragraph
                          style={{
                            fontSize: FONT_SIZE.HEADING_2,
                            marginBottom: 8,
                          }}
                          ellipsis={{ rows: 2 }}
                        >
                          {capitalize(p.projectName)}
                        </Paragraph>
                        <Flex
                          style={{ marginLeft: "auto" }}
                          onClick={() => handleRemoveProject(p.projectName)}
                        >
                          <DynamicReactIcon
                            iconName="IoMdCloseCircle"
                            iconSet="io"
                            color={COLORS.textColorDark}
                            size={32}
                          ></DynamicReactIcon>
                        </Flex>
                      </Flex>
                    </Col>
                  ))}
                </Row>
              </Flex>
            )}
            {step === 2 && (
              <>
                <Typography.Text style={{ marginBottom: 16 }}>
                  {!isMobileVerified
                    ? "Verify your mobile number to receive the report"
                    : "Share contact details"}
                  .
                </Typography.Text>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  style={{ width: "100%", maxWidth: 500 }}
                >
                  {isMobileVerified && (
                    <Form.Item
                      name="name"
                      label="Full Name"
                      rules={[
                        { required: true, message: "Please enter your name" },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                  )}

                  {isMobileVerified && (
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
                      <Input />
                    </Form.Item>
                  )}
                  {isMobileVerified ? (
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
          { }
          {(step !== 3 && maxReportsRequested) ||
            (step == 1 && selectedProjects.length >= MAX_FREE_REPORTS)
            ? renderMaxReportsMsg(maxReportsRequested)
            : null}
          {step !== 3 && errorMsg ? errorMsg : null}
          {reportsLeft > 0 && (
            <Flex style={{ marginTop: 16 }} gap={16}>
              {step === 1
                ? [
                  <Button
                    key="next"
                    type="primary"
                    onClick={handleNext}
                    disabled={selectedProjects.length === 0}
                    loading={createUser.isPending && !!user}
                  >
                    {user ? "Submit" : "Next"}
                  </Button>,
                ]
                : step == 2
                  ? [
                    <Button key="back" onClick={() => setStep(1)}>
                      Back
                    </Button>,
                    <Button
                      key="submit"
                      type="primary"
                      loading={createUser.isPending}
                      disabled={!isMobileVerified || maxReportsRequested}
                      onClick={() => form.submit()}
                    >
                      Submit
                    </Button>,
                  ]
                  : [
                    <Button
                      style={{ width: 200 }}
                      key="home"
                      onClick={() => {
                        safeWindow.location.replace("/");
                      }}
                    >
                      Take me Home
                    </Button>,
                  ]}
            </Flex>
          )}
        </Flex>
        {isMobile ? renderBanner() : null}
      </Flex>
      <LandingFooter></LandingFooter>
    </>
  );
};
