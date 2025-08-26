import { Flex, Image, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import "../theme/gallery.css";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia } from "../types/Project";

export const ProjectGalleryV2 = ({
  media,
  selectedImageId,
}: {
  media: IMedia[];
  selectedImageId: string | null;
}) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    const hasVideos = media.some(
      (item) =>
        item.type === "video" &&
        item.video &&
        (item.video.youtubeUrl || item.video.bunnyLibraryId)
    );

    media.forEach((item) => {
      // Extract tags from images
      if (item.type === "image" && item.image?.tags) {
        item.image.tags.forEach((tag) => {
          if (tag !== "na") {
            tags.add(tag);
          }
        });
      }
      // Extract tags from videos
      if (item.type === "video" && item.video?.tags) {
        item.video.tags.forEach((tag) => {
          if (tag !== "na") {
            tags.add(tag);
          }
        });
      }
    });

    // fixed order for tags
    const fixedOrder = [
      "exterior",
      "layout",
      "amenities",
      "floorplan",
      "house",
      "construction",
    ];

    const tagArray = ["all"];
    if (hasVideos) {
      tagArray.push("Videos");
    }

    fixedOrder.forEach((tag) => {
      if (tags.has(tag)) {
        tagArray.push(tag);
      }
    });

    return tagArray;
  }, [media]);

  const groupedImages = useMemo(() => {
    // Filter videos first
    const videoMedia = media.filter(
      (item) =>
        item.type === "video" &&
        item.video &&
        (item.video.youtubeUrl || item.video.bunnyLibraryId) &&
        (!item.video.tags || !item.video.tags.includes("na"))
    );
    const imageMedia = media.filter(
      (item) =>
        item.type === "image" && item.image && !item.image.tags.includes("na")
    );
    const allMedia = [...videoMedia, ...imageMedia];
    const result: Record<string, IMedia[]> = {};

    allMedia.forEach((item) => {
      const tags = item.type === "image" ? item.image?.tags : item.video?.tags;
      if (tags && tags.length > 0) {
        tags.forEach((tag) => {
          if (!result[tag]) {
            result[tag] = [];
          }
          result[tag].push(item);
        });
      }
      // Media without tags will only appear when "all" is selected
      // They won't be grouped under any specific tag
    });

    // Sort videos first, then images
    Object.keys(result).forEach((tag) => {
      result[tag].sort((a, b) => {
        if (a.type === "video" && b.type === "image") return -1;
        if (a.type === "image" && b.type === "video") return 1;
        return 0;
      });
    });

    // move selected image to front in its sections
    if (selectedImageId) {
      Object.keys(result).forEach((tag) => {
        const selectedIndex = result[tag].findIndex(
          (img) => img._id === selectedImageId
        );
        if (selectedIndex > -1) {
          const [selected] = result[tag].splice(selectedIndex, 1);
          result[tag].unshift(selected);
        }
      });
    }

    return result;
  }, [media, selectedImageId]);

  const filteredImages = useMemo((): [string, IMedia[]][] => {
    if (selectedTag === "all") {
      const result = Object.entries(groupedImages);

      // Add media without tags to the result when "all" is selected
      const mediaWithoutTags = media.filter((item) => {
        const tags =
          item.type === "image" ? item.image?.tags : item.video?.tags;
        return (
          (!tags ||
            tags.length === 0 ||
            (tags.length === 1 && tags[0] === "na")) &&
          ((item.type === "image" && item.image) ||
            (item.type === "video" &&
              item.video &&
              (item.video.youtubeUrl || item.video.bunnyLibraryId)))
        );
      });

      if (mediaWithoutTags.length > 0 && result.length > 0) {
        // Add untagged media to the first existing category
        result[0][1] = [...result[0][1], ...mediaWithoutTags];
      } else if (mediaWithoutTags.length > 0) {
        // If no other categories exist, create a general category
        result.push(["Media", mediaWithoutTags]);
      }

      return result;
    }
    if (selectedTag === "Videos") {
      const videoMedia = media.filter(
        (item) =>
          item.type === "video" &&
          item.video &&
          (!item.video.tags || !item.video.tags.includes("na"))
      );
      return [["Videos", videoMedia]];
    }
    if (groupedImages[selectedTag]) {
      return [[selectedTag, groupedImages[selectedTag]]];
    }
    return [];
  }, [selectedTag, groupedImages, media]);

  return (
    <Flex vertical gap={16}>
      <Flex
        style={{
          width: "100%",
          overflowX: "scroll",
          whiteSpace: "nowrap",
          scrollbarWidth: "none",
        }}
        gap={8}
      >
        {allTags.map((tag) => (
          <Tag.CheckableTag
            key={tag}
            checked={selectedTag === tag}
            onChange={(checked) => {
              if (checked) {
                setSelectedTag(tag);
              }
            }}
            style={{
              textTransform: "capitalize",
              border: `1px solid ${
                selectedTag === tag ? COLORS.primaryColor : COLORS.borderColor
              }`,
              marginRight: 0,
              padding: "4px 12px",
              borderRadius: 16,
              backgroundColor:
                selectedTag === tag ? COLORS.primaryColor : "white",
              color: selectedTag === tag ? "white" : COLORS.textColorMedium,
            }}
          >
            {tag}
          </Tag.CheckableTag>
        ))}
      </Flex>

      {filteredImages.length > 0 ? (
        <Flex vertical gap={32} style={{ paddingBottom: 80 }}>
          {filteredImages
            .sort(([aTag, aImages], [bTag, bImages]) => {
              if (selectedImageId) {
                const aHasSelected = aImages.some(
                  (img) => img._id === selectedImageId
                );
                const bHasSelected = bImages.some(
                  (img) => img._id === selectedImageId
                );
                if (aHasSelected && !bHasSelected) return -1;
                if (!aHasSelected && bHasSelected) return 1;
              }

              // Prioritize videos sections
              const aHasVideos = aImages.some((item) => item.type === "video");
              const bHasVideos = bImages.some((item) => item.type === "video");
              if (aHasVideos && !bHasVideos) return -1;
              if (!aHasVideos && bHasVideos) return 1;

              return aTag.localeCompare(bTag);
            })
            .map(([tag, images]) => (
              <Flex key={tag} vertical>
                <Typography.Text
                  style={{
                    margin: 0,
                    fontSize: FONT_SIZE.HEADING_3,
                    textTransform: "capitalize",
                  }}
                >
                  {tag}
                </Typography.Text>

                <div className="gallery-grid">
                  {images.map((item, index) => {
                    const isFirstInSection = index === 0;
                    return (
                      <div
                        key={`${tag}-${item._id}`}
                        className={`gallery-item ${
                          isFirstInSection ? "gallery-item-large" : ""
                        }`}
                      >
                        {item.type === "video" ? (
                          item.video?.isYoutube ? (
                            <iframe
                              src={item.video.youtubeUrl?.replace(
                                "watch?v=",
                                "embed/"
                              )}
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "1px solid",
                                borderColor: COLORS.borderColorMedium,
                                borderRadius: "8px",
                              }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <iframe
                              src={`https://iframe.mediadelivery.net/embed/${item.video?.bunnyLibraryId}/${item.video?.bunnyVideoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "1px solid",
                                borderColor: COLORS.borderColorMedium,
                                borderRadius: "8px",
                              }}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )
                        ) : (
                          <Image
                            src={item.image!.url}
                            alt={
                              item.image!.caption || `${tag} image ${index + 1}`
                            }
                            preview={{
                              mask: null,
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              border: "1px solid",
                              borderColor: COLORS.borderColorMedium,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Flex>
            ))}
        </Flex>
      ) : (
        <Typography.Text>
          No media available for the selected tag.
        </Typography.Text>
      )}
    </Flex>
  );
};
