import { Card, Flex } from "antd";
import { useDevice } from "../hooks/use-device";
import { User } from "../types/User";

interface RequestedProjectsListProps {
  user: User;
}

interface SavedLvnzyProject {
  collectionName: string;
  requestedProjects: RequestedProject[];
}

interface RequestedProject {
  isExistingProject: boolean;
  name: string;
  project: {
    type: string;
    ref: string;
  };
}

export const RequestedProjectsList = ({ user }: RequestedProjectsListProps) => {
  const { isMobile } = useDevice();

  return (
    <Flex vertical style={{ width: "100%", padding: 16 }}>
      <Flex
        style={{
          width: "100%",
          flexWrap: "wrap",
          marginBottom: 16,
        }}
        gap={16}
      >
        {user.savedLvnzyProjects?.map(
          (collection: SavedLvnzyProject, collectionIndex: number) =>
            collection.requestedProjects?.map(
              (project: RequestedProject, projectIndex: number) => (
                <Card
                  key={`${collectionIndex}-${projectIndex}`}
                  style={{
                    width: isMobile ? "100%" : 250,
                    minWidth: isMobile ? "100%" : 250,
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginBottom: "8px",
                    }}
                  >
                    Report requested
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                    {project.name}
                  </div>
                </Card>
              )
            )
        )}
      </Flex>
    </Flex>
  );
};
