import { useMemo } from "react";
import { ProjectGalleryV2 } from "../project-images-gallery-v2";
import { ScrollableContainer } from "../scrollable-container";

interface MediaTabProps {
  lvnzyProject: any;
}

export const MediaTab = ({ lvnzyProject }: MediaTabProps) => {
  const filteredMedia = useMemo(() => {
    const media = lvnzyProject?.originalProjectId?.media || [];
    const unitConfigs =
      lvnzyProject?.originalProjectId?.info?.unitConfigWithPricing || [];

    const unitConfigFloorplanUrls = new Set<string>();
    unitConfigs.forEach((config: any) => {
      config.floorplans?.forEach((url: string) => {
        if (url) unitConfigFloorplanUrls.add(url);
      });
    });

    // remove floorplan-tagged items from media
    const nonFloorplanMedia = media.filter((item: any) => {
      return !(
        item.type === "image" && item.image?.tags?.includes("floorplan")
      );
    });

    // add all floorplans from unitConfig
    const unitConfigFloorplans = Array.from(unitConfigFloorplanUrls).map(
      (url) => ({
        _id: url,
        type: "image",
        image: { url, tags: ["floorplan"] },
        isPreview: false,
      }),
    );

    return [...nonFloorplanMedia, ...unitConfigFloorplans];
  }, [lvnzyProject]);

  return (
    <ScrollableContainer>
      <ProjectGalleryV2 media={filteredMedia} selectedImageId={null} />
    </ScrollableContainer>
  );
};
