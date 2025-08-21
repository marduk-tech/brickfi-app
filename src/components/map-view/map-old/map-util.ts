import { Project } from "../../../types/Project";

type MarkerData = Array<{
  id: string;
  position?: google.maps.LatLngLiteral;
  zIndex?: number;
  project: Project;
}>;

export function getProjectsMapData({ projects }: { projects: Project[] }) {
  const data: MarkerData = [];

  projects.forEach((project, index) => {
    if (project.metadata?.location?.lat && project.metadata?.location?.lng) {
      data.push({
        id: String(index),
        position: {
          lat: project.metadata.location.lat,
          lng: project.metadata.location.lng,
        },
        zIndex: index,
        project: project,
      });
    }
  });

  return data;
}
