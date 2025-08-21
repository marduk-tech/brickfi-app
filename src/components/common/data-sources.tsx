import { Alert, Flex, Modal, Typography } from "antd";
import { COLORS, FONT_SIZE } from "../../theme/style-constants";
import { useDevice } from "../../hooks/use-device";
import { useState } from "react";
const { Paragraph, Text, Link } = Typography;

const DATA_SRCS = [
  {
    image: "rera.png",
    label: "RERA",
    description:
      "Real Estate Regulatory Authority, a regulatory body established under the Real Estate (Regulation and Development) Act. Any project has to be registered with RERA with all details like land, legal, plan, NOCs etc.",
  },
  {
    image: "open-city.png",
    label: "Open City",
    description:
      "Open City is a civic tech project that helps public data on cities be available, discoverable, easily accessible, shareable, understandable, and analysable.",
  },
  {
    image: "bbmp.png",
    label: "BBMP",
    description:
      "Bruhat Bengaluru Mahanagara Palike is the administrative body responsible for civic amenities and some infrastructural assets of the Greater Bengaluru metropolitan area. ",
  },
  {
    image: "open-street.png",
    label: "Open Street Maps",
    description:
      "Open Street Mapsprovides high-quality geographic data used by millions for navigation, analysis, and development across various industries.",
  },
  {
    image: "metro-rail.png",
    label: "Metro Rail Guy",
    description:
      "Metro Rail Guy dedicated platform offering curated, accurate, and timely updates on metro rail, high-speed rail, and large-scale infrastructure projects across India.",
  },
  {
    image: "google-maps.png",
    label: "Google Maps",
    description:
      "Google maps is a mapping platform that offers real-time navigation, traffic updates, and location-based services to help users explore and navigate the world.",
  },
];

export function DataSources({
  disableDetailsDialog,
}: {
  disableDetailsDialog?: boolean;
}) {
  const { isMobile } = useDevice();
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  return (
    <Flex
      style={{
        marginBottom: 16,
      }}
      gap={4}
      align="center"
    >
      <Flex
        onClick={() => {
          if (!disableDetailsDialog) {
            setDetailsModalOpen(true);
          }
        }}
        style={{
          borderRadius: 8,
          padding: "4px 0",
        }}
        align="center"
      >
        <Typography.Title level={3} style={{ margin: 0 }}>
          Brick<i>360</i>
        </Typography.Title>
        {/* {!disableDetailsDialog && (
          <DynamicReactIcon
            iconName="IoMdInformationCircleOutline"
            iconSet="io"
            color={COLORS.textColorLight}
          ></DynamicReactIcon>
        )} */}

        <Flex style={{ flexWrap: "wrap", marginLeft: "16px" }}>
          {(DATA_SRCS as any).map((src: any) => {
            return (
              <div
                style={{
                  fontSize: FONT_SIZE.SUB_TEXT,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "1px solid",
                  borderColor: COLORS.borderColorMedium,
                  marginLeft: -12,
                  backgroundImage: `url('/images/data-src-logos/${src.image}')`,
                  backgroundSize: "90%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              ></div>
            );
          })}
        </Flex>
      </Flex>
      <Modal
        title={null}
        open={detailsModalOpen}
        footer={[]}
        closable={true}
        onClose={() => {
          setDetailsModalOpen(false);
        }}
        onCancel={() => {
          setDetailsModalOpen(false);
        }}
      >
        <Typography.Title style={{ margin: 0 }} level={3}>
          Brick<i>360</i>
        </Typography.Title>

        <Flex
          vertical
          style={{
            marginTop: 16,
            height: 500,
            overflowY: "scroll",
            scrollbarWidth: "none",
          }}
        >
          <Alert
            style={{ marginBottom: 16 }}
            message={
              <Typography.Text>
                Brickfi uses AI to collect and analyse data from multiple
                legitimate sources like below. If you have any specific
                questions, please{" "}
                <Link href="https://brickfi.in/about-us" target="_blank">
                  reach out to us.
                </Link>{" "}
              </Typography.Text>
            }
          ></Alert>
          {(DATA_SRCS as any).map((src: any) => {
            return (
              <Flex
                vertical
                align="flex-start"
                style={{
                  borderBottom: "1px solid",
                  borderColor: COLORS.borderColor,
                  paddingTop: 16,
                }}
              >
                <Flex align="center" justify="center">
                  <Flex style={{ width: 40, height: 40 }} align="center">
                    <div
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        width: 32,
                        height: 32,
                        backgroundColor: "white",
                        borderColor: COLORS.borderColorMedium,
                        backgroundImage: `url('/images/data-src-logos/${src.image}')`,
                        backgroundSize: "contain",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    ></div>
                  </Flex>
                  <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_3 }}>
                    {src.label}
                  </Typography.Text>
                </Flex>
                <Flex vertical>
                  <Paragraph
                    ellipsis={{ rows: 5, expandable: true }}
                    style={{
                      fontSize: FONT_SIZE.PARA,
                      color: COLORS.textColorLight,
                    }}
                  >
                    {src.description || ""}
                  </Paragraph>
                </Flex>
              </Flex>
            );
          })}
        </Flex>
      </Modal>
    </Flex>
  );
}
