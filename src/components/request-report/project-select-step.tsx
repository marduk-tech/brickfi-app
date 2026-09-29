import {
  Alert,
  AutoComplete,
  Button,
  Col,
  Flex,
  Input,
  message,
  Row,
  Tag,
  Typography,
} from "antd";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  MarketingProject as ReraProject,
  useMarketingProjectSearch as useReraProjectSearch,
} from "../../hooks/use-marketing-project-search";
import { useMinisearch } from "../../hooks/use-minisearch";
import { useUser } from "../../hooks/use-user";
import { LandingConstants } from "../../libs/constants";
import { capitalize } from "../../libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import {
  ExclamationCircleFilled,
  InfoCircleFilled,
} from "@ant-design/icons";
import DynamicReactIcon from "../common/dynamic-react-icon";

const MAX_FREE_REPORTS = parseInt(process.env.NEXT_MAX_FREE_REPORTS || "2");

const { Paragraph } = Typography;

const ProjectOption = memo(({ project }: { project: ReraProject }) => (
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
        style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorMedium }}
      >
        by {capitalize(project.promoterName)}
      </Typography.Text>
    )}
    <Flex style={{ padding: 2, borderRadius: 4 }} align="center">
      {project.lvnzyProjectId ? (
        <Tag color="blue">
          <Flex align="center">
            <DynamicReactIcon iconName="GiElectric" iconSet="gi" size={12} />
            <Typography.Text style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
              Instant Report Available
            </Typography.Text>
          </Flex>
        </Tag>
      ) : (
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
      )}
    </Flex>
  </Flex>
));
ProjectOption.displayName = "ProjectOption";

export interface ProjectSelectStepState {
  selectedProjects: ReraProject[];
  reportsLeft: number;
  userReportLimitReached: boolean;
}

export interface ProjectSelectStepProps {
  projectIds?: string[];
  onChange: (state: ProjectSelectStepState) => void;
  onAutoPopulate?: () => void;
  onSubmit?: () => void;
  submitLoading?: boolean;
}

export const ProjectSelectStep = memo(
  ({
    projectIds,
    onChange,
    onAutoPopulate,
    onSubmit,
    submitLoading,
  }: ProjectSelectStepProps) => {
    const { projects, isLoading: reraProjectNamesLoading } =
      useReraProjectSearch();
    const { user } = useUser();
    const [selectedProjects, setSelectedProjects] = useState<ReraProject[]>([]);
    const [reportsLeft, setReportsLeft] = useState<number>(MAX_FREE_REPORTS);
    const [userReportLimitReached, setUserReportLimitReached] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
    const autoPopulatedRef = useRef(false);

    useEffect(() => {
      onChange({ selectedProjects, reportsLeft, userReportLimitReached });
    }, [selectedProjects, reportsLeft, userReportLimitReached]);

    useEffect(() => {
      if (user) {
        const isAdminOrMember =
          user.role && ["admin", "member"].includes(user.role);
        const repLeft =
          (isAdminOrMember ? 100 : MAX_FREE_REPORTS) -
          (user.requestedReports ? user.requestedReports.length : 0);
        setReportsLeft(repLeft);
        if (repLeft <= 0) setUserReportLimitReached(true);
      }
    }, [user]);

    useEffect(() => {
      if (
        autoPopulatedRef.current ||
        !projectIds?.length ||
        !projects?.length ||
        reraProjectNamesLoading
      )
        return;
      const matched = projects.filter((p) =>
        projectIds.some((id) => p.reraNumber === id || p.lvnzyProjectId === id),
      );
      if (matched.length > 0) {
        autoPopulatedRef.current = true;
        const newReportsLeft = Math.max(0, reportsLeft - matched.length);
        setSelectedProjects(matched);
        setReportsLeft(newReportsLeft);
        // Call onChange directly: onAutoPopulate causes the parent to unmount this
        // component in the same React batch, so the onChange useEffect never fires.
        onChange({
          selectedProjects: matched,
          reportsLeft: newReportsLeft,
          userReportLimitReached: newReportsLeft <= 0,
        });
        onAutoPopulate?.();
      }
    }, [projects, reraProjectNamesLoading]);

    const handleSelectProject = (project: ReraProject) => {
      setSelectedProjects((prev) => [...prev, project]);
      setReportsLeft((prev) => prev - 1);
    };

    const handleRemoveProject = (projectName: string) => {
      setSelectedProjects((prev) =>
        prev.filter((p) => p.projectName !== projectName),
      );
      setReportsLeft((prev) => prev + 1);
    };

    const searchResults = useMinisearch(projects, debouncedSearchValue, {
      fields: ["projectName", "promoterName"],
      boost: { projectName: 2, promoterName: 1 },
      fuzzy: 0.2,
      prefix: true,
    });

    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearchValue(searchValue);
      }, 300);
      return () => clearTimeout(timer);
    }, [searchValue]);

    useEffect(() => {
      if (debouncedSearchValue) {
        setTimeout(() => {
          const dropdown = document.querySelector(
            ".ant-select-dropdown .rc-virtual-list-holder",
          ) as HTMLElement;
          if (dropdown) dropdown.scrollTop = 0;
        }, 0);
      }
    }, [debouncedSearchValue]);

    const projectOptions = useMemo(() => {
      if (!projects?.length) return [];
      const searchQuery = debouncedSearchValue.trim();
      if (searchQuery && searchQuery.length < 2) return [];

      const filteredProjects = searchQuery
        ? searchResults
        : projects.sort((a, b) =>
            a.lvnzyProjectId && b.lvnzyProjectId
              ? 0
              : a.lvnzyProjectId
                ? -1
                : 1,
          );

      return (filteredProjects || [])
        .filter(
          (p) => !selectedProjects.some((s) => s.projectName === p.projectName),
        )
        .slice(0, 100)
        .map((project) => ({
          value: project.projectName,
          label: <ProjectOption project={project} />,
          project,
        }));
    }, [projects, debouncedSearchValue, selectedProjects, searchResults]);

    const handleSelect = (_: any, option: any) => {
      if (
        userReportLimitReached ||
        !reportsLeft ||
        selectedProjects.length === 2
      ) {
        setSearchValue("");
        return;
      }
      const newProject = option.project;
      if (
        selectedProjects.some((p) => p.projectName === newProject.projectName)
      ) {
        message.warning("This project is already selected.");
        return;
      }
      handleSelectProject(newProject);
      setSearchValue("");
    };

    return (
      <Flex vertical style={{ padding: "16px 0" }}>
        {/* <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_1, lineHeight: "120%", color: COLORS.textColorDark }}
        >
          Search for a Project
        </Typography.Text> */}
        {reportsLeft > 0 && (
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              marginBottom: 24,
              color: COLORS.textColorDark,
            }}
          >
            Request report for upto two RERA registered projects in Bangalore.
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
          onSelect={handleSelect}
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

        <Flex gap={24} style={{marginTop: 16,}}>
          {selectedProjects.map((p, index) => (
            <Flex
              style={{
                borderBottom:
                  index === selectedProjects.length - 1
                    ? "none"
                    : `1px solid ${COLORS.borderColor}`,
              }}
            >
              <Flex vertical style={{ paddingBottom: 16,  }}>
                <Flex gap={4} align="center">
                  <Paragraph
                    style={{ fontSize: FONT_SIZE.HEADING_3, marginBottom: 2 }}
                    ellipsis={{ rows: 2 }}
                  >
                    {capitalize(p.projectName)}
                  </Paragraph>
                  <DynamicReactIcon
                    iconName="IoMdCloseCircle"
                    iconSet="io"
                    color={COLORS.textColorDark}
                    size={18}
                  />
                </Flex>
                {p.lvnzyProjectId ? (
                  <Flex style={{ padding: 2, borderRadius: 4 }} align="center">
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
                  <Flex style={{ padding: 2, borderRadius: 4 }} align="center">
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
            </Flex>
          ))}
        </Flex>
        {selectedProjects && !!selectedProjects.length && <Flex><Alert
          style={{ marginBottom: 16 }}
          type={reportsLeft > 0 ? "info" : "warning"}
          showIcon
          icon={
            reportsLeft > 0 ? (
              <InfoCircleFilled style={{ fontSize: 20 }} />
            ) : (
              <ExclamationCircleFilled style={{ fontSize: 20 }} />
            )
          }
          message={
            <Flex vertical>
              <Typography.Text>
                {reportsLeft > 0
                  ? `You can request ${reportsLeft} more report${
                      reportsLeft === 1 ? "" : "s"
                    } for free`
                  : `Reached max number of your free reports`}
              </Typography.Text>
              {!!user?.requestedReports?.length && (
                <Typography.Text style={{ marginTop: -2, fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}>
                  You have already requested {user.requestedReports.length}{" "}
                  report{user.requestedReports.length === 1 ? "" : "s"} previously.
                </Typography.Text>
              )}
            </Flex>
          }
        /></Flex>}
        {onSubmit && (
          <Button
            type="primary"
            style={{ marginTop: 16, alignSelf: "flex-start" }}
            disabled={selectedProjects.length === 0}
            loading={submitLoading}
            onClick={onSubmit}
          >
            Request Report
          </Button>
        )}
      </Flex>
    );
  },
);
ProjectSelectStep.displayName = "ProjectSelectStep";
