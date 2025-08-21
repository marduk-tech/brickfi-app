import { Alert, AutoComplete, Button, Input, message, Modal, Spin } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useProjectSearch,
  WITHLVNZYRESPONSE,
} from "../hooks/use-project-search";
import { useUser } from "../hooks/use-user";
import { useUpdateUserMutation } from "../hooks/user-hooks";
import { COLORS, FONT_SIZE } from "../theme/style-constants";

// Utility function to remove duplicates and prepend new ID
const removeDuplicatesAndPrepend = (arr: string[], newId: string): string[] => {
  // Convert to Set to remove duplicates, filter out the newId if it exists
  const uniqueSet = new Set(
    arr.filter((id) => id.toString() !== newId.toString())
  );

  // Convert back to array with newId at start
  return [newId, ...Array.from(uniqueSet)];
};

interface ProjectSearchProps {
  onSelect?: (
    projectId: string,
    projectName: string,
    lvnzyProjectId: string | null
  ) => void;
  placeholder?: string;
  style?: React.CSSProperties;
}

export const ProjectSearch: React.FC<ProjectSearchProps> = ({
  onSelect,
  placeholder = "Search projects...",
  style,
}) => {
  const navigate = useNavigate();
  const { projects, isLoading } = useProjectSearch();
  const { user } = useUser();
  const updateUser = useUpdateUserMutation({ userId: user?._id || "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<WITHLVNZYRESPONSE | null>(null);

  const [messageApi, contextHolder] = message.useMessage();

  const options = Array.isArray(projects)
    ? projects.map((project) => ({
        value: project.projectName,
        label: project.projectName,
        projectId: project.projectId,
        lvnzyProjectId: project.lvnzyProjectId,
        project: project,
      }))
    : [];

  const handleSelect = (value: string, option: any) => {
    onSelect?.(option.projectId, value, option.lvnzyProjectId);
    handleProjectSelect(option.project);
  };

  const handleProjectSelect = (project: WITHLVNZYRESPONSE) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const handleGenerateClick = async (project: WITHLVNZYRESPONSE) => {
    if (!project.lvnzyProjectId || !user) return;

    //  current savedLvnzyProjects or initialize empty array
    const savedLvnzyProjects = [...(user.savedLvnzyProjects || [])];

    //  default collection or create new one
    const defaultCollectionIndex = savedLvnzyProjects.findIndex(
      (c) => c.collectionName === "default"
    );

    console.log(defaultCollectionIndex);

    if (defaultCollectionIndex === -1) {
      // create new default collection
      savedLvnzyProjects.push({
        collectionName: "default",
        projects: [project.lvnzyProjectId],
      });
    } else {
      // remove if exists and add to start
      const existingProjects =
        savedLvnzyProjects[defaultCollectionIndex].projects.map(
          (proj: any) => proj._id
        ) || [];

      console.log(existingProjects);

      savedLvnzyProjects[defaultCollectionIndex].projects =
        removeDuplicatesAndPrepend(existingProjects, project.lvnzyProjectId);
    }

    // Update user
    await updateUser.mutateAsync({
      userData: {
        savedLvnzyProjects,
      },
    });

    // Show success notification
    messageApi.open({
      type: "success",
      content: "Report Generated",
    });

    handleCloseDialog();
    //hotfix for user-projects error
    navigate(0);
  };

  const handleRequestClick = async (project: WITHLVNZYRESPONSE) => {
    if (!project.projectId || !user) return;

    // current savedLvnzyProjects or initialize empty array
    const savedLvnzyProjects = [...(user.savedLvnzyProjects || [])];

    // find default collection or create new one
    const defaultCollectionIndex = savedLvnzyProjects.findIndex(
      (c) => c.collectionName === "default"
    );

    if (defaultCollectionIndex === -1) {
      // create new default collection with requestedProjects
      savedLvnzyProjects.push({
        collectionName: "default",
        requestedProjects: [
          {
            isExistingProject: true,
            name: project.projectName,
            project: project.projectId,
          },
        ],
        projects: [],
      });
    } else {
      // get existing requested projects or initialize empty array
      const existingProjectIds =
        savedLvnzyProjects[defaultCollectionIndex].requestedProjects
          .filter((p: any) => p.isExistingProject)
          .map((proj: any) => proj.project && proj.project._id) || [];

      const nonexistingProjects = savedLvnzyProjects[
        defaultCollectionIndex
      ].requestedProjects.filter((p: any) => !p.isExistingProject);

      console.log(savedLvnzyProjects[defaultCollectionIndex].requestedProjects);

      const orderedIds = removeDuplicatesAndPrepend(
        existingProjectIds,
        project.projectId
      );

      savedLvnzyProjects[defaultCollectionIndex].requestedProjects = [
        ...nonexistingProjects,
        ...orderedIds.map((id) => ({
          isExistingProject: true,
          name: projects.find((p) => p.projectId === id)?.projectName || "",
          project: id,
        })),
      ];
    }

    // Update user
    await updateUser.mutateAsync({
      userData: {
        savedLvnzyProjects,
      },
    });

    messageApi.open({
      type: "success",
      content: "Project Requested",
    });

    handleCloseDialog();
  };

  const handleRequestNonExistingProjectClick = async (projectName: string) => {
    if (!user) return;

    // current savedLvnzyProjects or initialize empty array
    const savedLvnzyProjects = [...(user.savedLvnzyProjects || [])];

    // find default collection or create new one
    const defaultCollectionIndex = savedLvnzyProjects.findIndex(
      (c) => c.collectionName === "default"
    );

    if (defaultCollectionIndex === -1) {
      // create new default collection with requestedProjects
      savedLvnzyProjects.push({
        collectionName: "default",
        requestedProjects: [
          {
            isExistingProject: false,
            name: projectName,
          },
        ],
        projects: [],
      });
    } else {
      // Add new request to existing collection
      if (!savedLvnzyProjects[defaultCollectionIndex].requestedProjects) {
        savedLvnzyProjects[defaultCollectionIndex].requestedProjects = [];
      }

      savedLvnzyProjects[defaultCollectionIndex].requestedProjects.unshift({
        isExistingProject: false,
        name: projectName,
      });
    }

    // Update user
    await updateUser.mutateAsync({
      userData: {
        savedLvnzyProjects,
      },
    });

    // Show success notification
    messageApi.open({
      type: "success",
      content: "Project Requested",
    });

    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProject(null);
  };

  if (isLoading) {
    return <Spin />;
  }

  return (
    <>
      {contextHolder}
      <AutoComplete
        style={{ width: "100%", ...style }}
        options={options}
        onSelect={handleSelect}
        filterOption={(inputValue, option) =>
          option!.value.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
        }
        notFoundContent={
          <div style={{ padding: "12px", textAlign: "center" }}>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 600,
                marginBottom: "8px",
                color: COLORS.textColorDark,
              }}
            >
              Oops. Project not found
            </div>
            <Button
              loading={updateUser.isPending}
              type="link"
              onClick={(e) => {
                // Get the typed value from the AutoComplete input
                const searchInput = document.querySelector(
                  ".ant-select-selection-search-input"
                ) as HTMLInputElement;
                const projectName = searchInput?.value || "";

                if (projectName) {
                  handleRequestNonExistingProjectClick(projectName);
                  // close the dropdown by removing focus
                  searchInput.blur();
                }
              }}
            >
              Request report anyways
            </Button>
          </div>
        }
      >
        <Input
          style={{ fontSize: FONT_SIZE.HEADING_2 }}
          placeholder={placeholder}
        ></Input>
      </AutoComplete>
      <Modal
        title={
          <div style={{ fontSize: "22px", fontWeight: 600 }}>
            {selectedProject?.projectName}
          </div>
        }
        open={isDialogOpen}
        onCancel={handleCloseDialog}
        footer={null}
      >
        {selectedProject && (
          <div>
            <div style={{ marginTop: 24 }}>
              {selectedProject.projectId && selectedProject.lvnzyProjectId ? (
                <>
                  <Alert
                    message="Wohoo! You can generate this project's Brick360 report for immediate access!"
                    type="success"
                    showIcon
                    style={{ marginBottom: 20 }}
                  />
                  <Button
                    type="primary"
                    onClick={() => handleGenerateClick(selectedProject)}
                    loading={updateUser.isPending}
                    block
                  >
                    Generate Report Now
                  </Button>
                </>
              ) : (
                <>
                  <Alert
                    message="Uh–Oh! We need more time to generate report for this project. Click request and we will generate within 24 hrs."
                    type="warning"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                  <Button
                    type="primary"
                    onClick={() => handleRequestClick(selectedProject)}
                    loading={updateUser.isPending}
                    block
                  >
                    Request BRICK360 Report
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
