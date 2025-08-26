import { Flex, Typography } from "antd";
import { useEffect, useState } from "react";
import { useDevice } from "../hooks/use-device";
import { COLORS } from "../theme/style-constants";
import { IMedia } from "../types/Project";
import { ProjectImagesGalleryModal } from "./project-images-gallery-modal";

const ProjectGallery: React.FC<{ media: IMedia[] }> = ({ media }) => {
  const { isMobile } = useDevice();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const [filteredImgs, setFilteredImgs] = useState<IMedia[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<IMedia[]>([]);

  useEffect(() => {
    const customOrder = [
      "exterior",
      "amenities",
      "layout",
      "house",
      "floorplan",
      "construction",
    ];

    function sortByCustomtag(media: IMedia[]) {
      return media.sort((a: any, b: any) => {
        const aIndex = customOrder.indexOf(a.image.tags[0]);
        const bIndex = customOrder.indexOf(b.image.tags[0]);

        const aRank = aIndex === -1 ? customOrder.length : aIndex;
        const bRank = bIndex === -1 ? customOrder.length : bIndex;

        return aRank - bRank;
      });
    }
    if (media && media.length) {
      setFilteredImgs(
        sortByCustomtag(
          media.filter(
            (item: IMedia) =>
              item.type === "image" &&
              item.image &&
              item.image.tags &&
              item.image.tags.length &&
              !item.image.tags.includes("na")
          )
        )
      );
      setFilteredVideos(
        media.filter((item: IMedia) => item.type === "video" && item.video)
      );
    }
  }, [media]);

  return (
    <>
      <Flex
        className="custom-scrollbar"
        style={{
          width: "100%",
          overflowX: "scroll",
          whiteSpace: "nowrap",
          height: 125,
          scrollbarWidth: "none",
        }}
      >
        {filteredImgs.map((img: IMedia, index: number) => (
          <div
            key={index}
            style={{ position: "relative" }}
            onClick={() => {
              setSelectedImageId(img._id || "");
              setIsModalOpen(true);
            }}
          >
            <img
              src={img.image!.url}
              height="100%"
              width="auto"
              style={{
                overflow: "hidden",
                borderRadius: 8,
                border: "1px solid",
                borderColor: COLORS.borderColor,
                width: 200,
                height: 125,
                marginRight: 8,
                position: "relative",
                filter:
                  "brightness(1.1) contrast(1.1) saturate(1.1) sepia(0.3)",
                cursor: "pointer",
              }}
              alt={img.image!.caption || `Project image ${index + 1}`}
            />
            {/* {img.image!.caption ||
            (img.image?.tags && img.image.tags.length) ? (
              <Typography.Text
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  color: COLORS.textColorVeryLight,
                  textTransform: "capitalize",
                  borderTopRightRadius: 8,
                  fontSize: FONT_SIZE.SUB_TEXT,
                  borderBottomLeftRadius: 8,
                  padding: "4px 8px",
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                {img.image!.caption || img.image!.tags}
              </Typography.Text>
            ) : null} */}
          </div>
        ))}

        {filteredVideos.map((media: IMedia, index: number) => (
          <div
            key={index}
            style={{
              height: "100%",
              width: isMobile ? "100%" : "49%",
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
              marginRight: 8,
              position: "relative",
            }}
          >
            <iframe
              src={`https://iframe.mediadelivery.net/embed/330257/${media.video?.bunnyVideoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
              loading="lazy"
              style={{
                height: "100%",
                width: "100%",
                border: "none",
              }}
              allow="accelerometer;gyroscope;encrypted-media;picture-in-picture;"
            ></iframe>
            {media.video!.caption ||
            (media.video?.tags && media.video.tags.length) ? (
              <Typography.Text
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  color: "white",
                  textTransform: "capitalize",
                  borderBottomLeftRadius: 8,
                  padding: "8px 16px",
                  backgroundColor: "rgba(0,0,0,0.3)",
                }}
              >
                {media.video!.caption || media.video!.tags}
              </Typography.Text>
            ) : null}
          </div>
        ))}
      </Flex>

      <ProjectImagesGalleryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImageId(null);
        }}
        media={filteredImgs}
        selectedImageId={selectedImageId}
      />
    </>
  );
};

export default ProjectGallery;
