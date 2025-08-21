import { ProjectGalleryV2 } from "../project-images-gallery-v2";
import { ScrollableContainer } from "../scrollable-container";

interface MediaTabProps {
  lvnzyProject: any;
}

export const MediaTab = ({ lvnzyProject }: MediaTabProps) => {
  return (
    <ScrollableContainer>
      <ProjectGalleryV2
        media={lvnzyProject?.originalProjectId.media}
        selectedImageId={null}
      />
    </ScrollableContainer>
  );
};
