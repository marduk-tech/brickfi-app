import { ProjectGalleryV2 } from "../project-images-gallery-v2";
import { ScrollableContainer } from "../scrollable-container";

interface MediaTabProps {
  lvnzyProject: any;
}

export const MediaTab = ({ lvnzyProject }: MediaTabProps) => {

  const processMedia = () => {
    const media: any[] = [];
    lvnzyProject?.originalProjectId.media.forEach((m: any) => {
      if (!!m.image.tags.length && !m.image.tags.includes("floorplan") && !m.image.tags.includes("na")) {
         m.image.caption = "";
        media.push(m);
      }
    })
    lvnzyProject.originalProjectId.info.unitConfigWithPricing.forEach((u: any) => {
      if (u.floorplans && u.floorplans.length) {
        u.floorplans.forEach((f: any) => {
          media.push({
            type: "image",  
            image: {
              tags: ["floorplan"],
              url: f,
              caption: `${u.type}/ SBA: ${u.sizeBuiltup}`
            }
          })
        })
      }
    })
    return media;
  }
 
  return (
    <ScrollableContainer>
      <ProjectGalleryV2
        media={processMedia()}
        selectedImageId={null}
      />
    </ScrollableContainer>
  );
};
