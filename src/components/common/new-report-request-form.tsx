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
import { memo, ReactNode, useEffect, useMemo, useState } from "react";
import LandingHeader from "../../custom-pages/landing/header";
import { useDevice } from "../../hooks/use-device";
import {
  MarketingProject as ReraProject,
  useMarketingProjectSearch as useReraProjectSearch,
} from "../../hooks/use-marketing-project-search";
import { useMinisearch } from "../../hooks/use-minisearch";
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
import DynamicReactIcon from "./dynamic-react-icon";
import { Loader } from "./loader";
const { Paragraph } = Typography;

const MAX_FREE_REPORTS = parseInt(process.env.NEXT_MAX_FREE_REPORTS || "2");

const ProjectOption = memo(({ project }: { project: ReraProject }) => {
  const getInstantReportTag = () => (
    <Flex style={{ padding: 2, borderRadius: 4 }} align="center">
      <Tag color="blue">
        <Flex align="center">
          <DynamicReactIcon iconName="GiElectric" iconSet="gi" size={12} />
          <Typography.Text style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
            Instant Report Available
          </Typography.Text>
        </Flex>
      </Tag>
    </Flex>
  );

  const getRequestReportTag = () => (
    <Flex style={{ padding: 2, borderRadius: 4 }} align="center">
      <Tag>
        <Flex align="center">
          <DynamicReactIcon
            iconName="LuCircleFadingArrowUp"
            iconSet="lu"
            size={12}
          />
          <Typography.Text
            style={{ fontSize: FONT_SIZE.SUB_TEXT, marginLeft: 4 }}
          >
            Request to Generate Report
          </Typography.Text>
        </Flex>
      </Tag>
    </Flex>
  );

  return (
    <Flex vertical>
      <Typography.Text
        style={{
          fontSize: FONT_SIZE.HEADING_2,
          color: project.lvnzyProjectId
            ? COLORS.textColorDark
            : COLORS.textColorMedium,
        }}
      >
        {capitalize(project.projectName)}
      </Typography.Text>
      {project.promoterName && (
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorMedium,
          }}
        >
          by {capitalize(project.promoterName)}
        </Typography.Text>
      )}
      {project.lvnzyProjectId ? getInstantReportTag() : getRequestReportTag()}
    </Flex>
  );
});
ProjectOption.displayName = "ProjectOption";

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
  const [userReportLimitReached, setUserReportLimitReached] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");

  // minisearch for fuzzy search on project name and promoter name
  const searchResults = useMinisearch(projects, debouncedSearchValue, {
    fields: ["projectName", "promoterName"],
    boost: { projectName: 2, promoterName: 1 },
    fuzzy: 0.2,
    prefix: true,
  });
  const [verifiedUser, setVerifiedUser] = useState<any>(null);
  const [isMobileVerified, setIsMobileVerified] = useState(false);

  const [flickerWait, setFlickerWait] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFlickerWait(false);
    }, 1000);
  }, []);

  // debounce search query to reduce expensive fuzzy search operations
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // scroll dropdown to top when search value changes
  useEffect(() => {
    if (debouncedSearchValue) {
      setTimeout(() => {
        const dropdown = document.querySelector(
          ".ant-select-dropdown .rc-virtual-list-holder"
        ) as HTMLElement;
        if (dropdown) {
          dropdown.scrollTop = 0;
        }
      }, 0);
    }
  }, [debouncedSearchValue]);

  const [errorMsg, setErrorMsg] = useState<ReactNode>();

  const projectOptions = useMemo(() => {
    if (!projects?.length) return [];

    // Only show results when search has 2+ characters OR when no search (show all)
    const searchQuery = debouncedSearchValue.trim();
    if (searchQuery && searchQuery.length < 2) {
      return [];
    }

    const filteredProjects = searchQuery ? searchResults : projects.sort((projectA, projectB) =>
        projectA.lvnzyProjectId && projectB.lvnzyProjectId
          ? 0
          : projectA.lvnzyProjectId
          ? -1
          : 1
      );

    return (filteredProjects || [])
      .filter(
        (p) => !selectedProjects.some((s) => s.projectName === p.projectName)
      )
     
      .slice(0, 100)
      .map((project) => ({
        value: project.projectName,
        label: <ProjectOption project={project} />,
        project,
      }));
  }, [projects, debouncedSearchValue, selectedProjects, searchResults]);

  const handleSelectProject = (_: any, option: any) => {
    if (
      userReportLimitReached ||
      !reportsLeft ||
      selectedProjects.length == 2
    ) {
      setSearchValue("");
      return;
    }
    const newProject = option.project;
    const alreadySelected = selectedProjects.some(
      (p) => p.projectName === newProject.projectName
    );

    if (alreadySelected) {
      message.warning("This project is already selected.");
      return;
    }

    const selProjects = [...selectedProjects, newProject];
    setSelectedProjects(selProjects);
    setReportsLeft(reportsLeft - 1);
    setSearchValue("");
  };
  const handleRemoveProject = (projectName: string) => {
    const selProjects = selectedProjects.filter(
      (p) => p.projectName !== projectName
    );
    setSelectedProjects(selProjects);
    setReportsLeft(reportsLeft + 1);
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
        (axiosError.response as any).data.userReportLimitReached
      ) {
        setUserReportLimitReached(true);
        setReportsLeft((axiosError.response as any).data.reportsLeft);
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
            email and message. You can also request a callback to expedite your report request.
          </Typography.Text>
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              fontWeight: "bold",
              marginTop: 8,
            }}
          >
            You can also request a <Link href={LandingConstants.callbackLink}>callback here</Link> to expedite your report request. 
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

  const renderMaxReportsMsg = (userLimitReached?: boolean) => {
    const msg = userLimitReached
      ? `Oops! Looks like this mobile has already requested max number of free reports. ${
          reportsLeft
            ? "You can only request " +
              reportsLeft +
              " more report(s). Please remove or update requested projects."
            : ""
        }`
      : user?.requestedReports && user?.requestedReports.length
      ? `You have already requested ${user.requestedReports.length} report(s). You can request report for upto 2 projects for free.`
      : selectedProjects.length == 2
      ? `You can request report for upto 2 projects for free.`
      : "";
    if (!msg) {
      return "";
    }
    return (
      <Flex style={{ maxWidth: "100%", margin: "8px 0" }} vertical>
        <Tag
          style={{
            width: "100%",
            textWrap: "wrap",
            backgroundColor: "rgba(255, 128, 128, 0.1)",
            border: `0.1px solid ${COLORS.redIdentifier}`,
            padding: "8px 8px",
            borderRadius: 8,
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
                  color: COLORS.textColorDark,
                  display: "flex",
                }}
              >
                {" "}
                {userLimitReached
                  ? `Oops! Looks like this mobile has already requested max number of free reports. ${
                      reportsLeft
                        ? "You can only request " +
                          reportsLeft +
                          " more report(s). Please remove or update requested projects."
                        : ""
                    }`
                  : user?.requestedReports && user?.requestedReports.length
                  ? `You have already requested ${user.requestedReports.length} report(s). You can request report for upto 2 projects for free.`
                  : selectedProjects.length == 2
                  ? `You can request report for upto 2 projects for free.`
                  : ""}
              </Typography.Text>
            </Flex>
            {userLimitReached || selectedProjects.length == 2 ? (
              <Link
                href="/brickassist"
                target="_blank"
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  marginTop: 16,
                  color: COLORS.primaryColor,
                }}
              >
                {" "}
                Need more reports ? Schedule a callback with us.
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
    if (user) {
      const isAdminOrMember =
        user.role && ["admin", "member"].includes(user.role);
      const repLeft =
        (isAdminOrMember ? 100 : MAX_FREE_REPORTS) -
        (user.requestedReports ? user.requestedReports.length : 0);
      setReportsLeft(repLeft);
      if (repLeft <= 0) {
        setUserReportLimitReached(true);
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
              <Flex vertical style={{ padding: "16px 0" }}>
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.HEADING_1,
                    lineHeight: "120%",
                    color: COLORS.textColorDark,
                  }}
                >
                  Search for a Project
                </Typography.Text>
                {reportsLeft > 0 && (
                  <Typography.Text
                    style={{
                      fontSize: FONT_SIZE.HEADING_4,
                      marginBottom: 24,
                      color: COLORS.textColorMedium,
                    }}
                  >
                    Request report for any RERA registered project in Bangalore.
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
                  filterOption={() => true}
                  placeholder={
                    reraProjectNamesLoading
                      ? "Loading projects, please wait.."
                      : "Search project or developer name..."
                  }
                  disabled={reraProjectNamesLoading}
                  listHeight={400}
                  notFoundContent={
                    debouncedSearchValue.trim() &&
                    debouncedSearchValue.trim().length < 2
                      ? "Type at least 2 characters to search"
                      : projectOptions.length === 100
                      ? "Showing first 100 results. Type more to refine your search."
                      : "No results found"
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
                        }}
                      >
                        <Flex vertical style={{ paddingBottom: 16 }}>
                          <Paragraph
                            style={{
                              fontSize: FONT_SIZE.HEADING_2,
                              marginBottom: 2,
                            }}
                            ellipsis={{ rows: 2 }}
                          >
                            {capitalize(p.projectName)}
                          </Paragraph>
                          {p.lvnzyProjectId ? (
                            <Flex
                              style={{ padding: 2, borderRadius: 4 }}
                              align="center"
                            >
                              <Tag color="blue">
                                <Flex align="center">
                                  <DynamicReactIcon
                                    iconName="GiElectric"
                                    iconSet="gi"
                                    size={12}
                                  />
                                  <Typography.Text
                                    style={{ fontSize: FONT_SIZE.SUB_TEXT }}
                                  >
                                    Instant Report Available
                                  </Typography.Text>
                                </Flex>
                              </Tag>
                            </Flex>
                          ) : (
                            <Flex
                              style={{ padding: 2, borderRadius: 4 }}
                              align="center"
                            >
                              <Tag>
                                <Flex align="center">
                                  <DynamicReactIcon
                                    iconName="LuCircleFadingArrowUp"
                                    iconSet="lu"
                                    size={12}
                                  />
                                  <Typography.Text
                                    style={{
                                      fontSize: FONT_SIZE.SUB_TEXT,
                                      marginLeft: 4,
                                    }}
                                  >
                                    Request to Generate Report
                                  </Typography.Text>
                                </Flex>
                              </Tag>
                            </Flex>
                          )}
                        </Flex>
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
                <Typography.Text
                  style={{ marginBottom: 16, color: COLORS.textColorLight }}
                >
                  Share contact details to receive the report
                </Typography.Text>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  style={{ width: "100%", maxWidth: 500 }}
                >
                  <Form.Item
                    name="name"
                    label="Full Name"
                    rules={[
                      { required: true, message: "Please enter your name" },
                    ]}
                  >
                    <Input />
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
                    <Input />
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
          {}
          {(step !== 3 && userReportLimitReached) ||
          (step == 1 && selectedProjects.length >= Math.min(2, reportsLeft))
            ? renderMaxReportsMsg(userReportLimitReached)
            : null}
          {step !== 3 && errorMsg ? errorMsg : null}
          {!userReportLimitReached && (
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
                      disabled={!isMobileVerified || userReportLimitReached}
                      onClick={() => form.submit()}
                    >
                      Submit
                    </Button>,
                  ]
                : null}
            </Flex>
          )}
        </Flex>
        {isMobile ? renderBanner() : null}
      </Flex>
      <LandingFooter></LandingFooter>
    </>
  );
};
