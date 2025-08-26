import { Flex } from "antd";
import { useEffect, useState } from "react";
import { ProjectCard } from "./common/project-card";
import { captureAnalyticsEvent } from "../libs/lvnzy-helper";
import { Project } from "../types/Project";

const ProjectsViewV2: React.FC<{
  projects?: any[];
  projectClick: any;
}> = ({ projects, projectClick }) => {
  const [categoryFilter, setCategoryFilter] = useState();
  const [priceRange, setPriceRange] = useState([300, 1000]);
  const [locationFilter, setLocationFilter] = useState<string[] | undefined>();
  const [isFiltersModalVisible, setIsFiltersModalVisible] = useState(false);

  const [filteredProjects, setFilteredProjects] = useState<Project[]>();

  useEffect(() => {
    if (!projects) {
      return;
    }
    captureAnalyticsEvent("app-homepage-open", {});
    let filtered = projects;

    setFilteredProjects(filtered);
  }, [categoryFilter, locationFilter, priceRange, projects]);

  if (filteredProjects) {
    return (
      <>
        <Flex
          vertical
          style={{
            width: "100%",
            position: "relative",
          }}
        >
          <Flex
            style={{
              overflowX: "scroll",
              width: "100%",
              whiteSpace: "nowrap",
              scrollbarWidth: "none",
            }}
          >
            <Flex gap={24}>
              {filteredProjects.map((project) => (
                <Flex
                  style={{ overflowX: "hidden" }}
                  onClick={() => {
                    projectClick(project._id, project.metadata.name);
                  }}
                >
                  <ProjectCard
                    project={project}
                    key={project._id}
                    showClick={false}
                  />
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Flex>
      </>
    );
  }

  return null;
};

export default ProjectsViewV2;
