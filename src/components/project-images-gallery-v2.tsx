import { Flex, Image, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import "../theme/gallery.css";
import { COLORS, FONT_SIZE } from "../theme/style-constants";
import { IMedia } from "../types/Project";

// fixed order for tags
const TAGS_ORDER = [
  "exterior",
  "layout",
  "amenities",
  "house",
  "floorplan",
  "construction",
];
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

    const tagArray = ["all"];
    if (hasVideos) {
      tagArray.push("Videos");
    }

    TAGS_ORDER.forEach((tag) => {
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
    const imageMedia = media
      .filter(
        (item) =>
          item.type === "image" &&
          item.image &&
          (!item.image.tags ||
            !item.image.tags.length ||
            !item.image.tags.find((t) => !TAGS_ORDER.includes(t)))
      )
      .sort((a: any, b: any) => {
        const seqA = TAGS_ORDER.indexOf(a.image.tags[0]);
        const seqB = TAGS_ORDER.indexOf(b.image.tags[0]);
        return seqA - seqB;
      });
    const allMedia = [...videoMedia, ...imageMedia];
    const result: Record<string, IMedia[]> = {};

    allMedia.forEach((item) => {
      const tags = item.type === "image" ? item.image?.tags : item.video?.tags;
      if (tags && tags.length > 0) {
          if (!result[tags[0]]) {
            result[tags[0]] = [];
          }
          result[tags[0]].push(item);
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

      // if (mediaWithoutTags.length > 0 && result.length > 0) {
      //   // Add untagged media to the first existing category
      //   result[0][1] = [...result[0][1], ...mediaWithoutTags];
      // } else if (mediaWithoutTags.length > 0) {
      //   // If no other categories exist, create a general category
      //   result.push(["Media", mediaWithoutTags]);
      // }

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
      {/* Tag Filters */}
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
              border: `2px solid ${
                selectedTag === tag ? COLORS.primaryColor : COLORS.borderColor
              }`,
              marginRight: 0,
              padding: "4px 12px",
              borderRadius: 16,
              fontWeight: 500,
              fontSize: FONT_SIZE.HEADING_4,
              backgroundColor:
                selectedTag === tag ? COLORS.primaryColor : "white",
              color: selectedTag === tag ? "white" : COLORS.textColorMedium,
            }}
          >
            {tag == "layout" ? "Masterplan": tag}
          </Tag.CheckableTag>
        ))}
      </Flex>

      {filteredImages.length > 0 ? (
        <Image.PreviewGroup preview={true}>
          <Flex vertical gap={32} style={{ paddingBottom: 80 }}>
            {filteredImages.map(([tag, images]) => (
              <Flex key={tag} vertical>
                <Typography.Text
                  style={{
                    margin: 0,
                    fontSize: FONT_SIZE.HEADING_2,
                    textTransform: "capitalize",
                  }}
                >
                  {tag == "layout" ? "masterplan": tag}
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
                              `${tag}-${item.image!.caption}` ||
                              `${tag} image ${index + 1}`
                            }
                            preview={{
                              mask: null,
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "center",
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
        </Image.PreviewGroup>
      ) : (
        <Typography.Text>
          No media available for the selected tag.
        </Typography.Text>
      )}
    </Flex>
  );
};
