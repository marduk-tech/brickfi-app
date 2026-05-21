import { Flex, Typography } from "antd";
import moment from "moment";
import Link from "next/link";
import { MapModalContent } from "@/components/map-view-v2/map-modal";
import { capitalize, getMinMaxPrices } from "@/libs/lvnzy-helper";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";

const getCompletionDate = (timeline: any[]) => {
  const lastEntry = timeline[timeline.length - 1];
  return `${moment(timeline[0].startDate, "DD-MM-YYYY").format(
    "ll"
  )} - ${moment(lastEntry.completionDate, "DD-MM-YYYY").format("ll")}`;
};

export const buildFindProjectsModalContent = (project: any): MapModalContent => {
  const rera = project.info?.reraProjectId?.projectDetails?.listOfRegistrationsExtensions;
  const pricing = project.info?.unitConfigWithPricing;
  const rate = project.info?.rate;

  return {
    title: (
      <Flex vertical style={{ marginBottom: 0 }}>
        {project.info?.developerId ? (
          <Typography.Text
            style={{
              color: COLORS.primaryColor,
              textTransform: "uppercase",
              fontSize: FONT_SIZE.PARA,
            }}
          >
            {project.info.developerId.name}
          </Typography.Text>
        ) : null}
        <Typography.Text
          style={{
            fontSize: FONT_SIZE.HEADING_1 * 0.9,
            lineHeight: "100%",
            marginBottom: 8,
          }}
        >
          {project.info?.name}
        </Typography.Text>
      </Flex>
    ),
    content: (
      <Flex vertical gap={0}>
        {rera ? (
          <Typography.Text
            style={{
              fontSize: FONT_SIZE.HEADING_4,
              color: COLORS.textColorMedium,
            }}
          >
            {getCompletionDate(rera)}
          </Typography.Text>
        ) : null}

        <Flex style={{ marginBottom: 16 }}>
          {(project.info?.homeType || []).map((t: string) => (
            <Typography.Text
              key={t}
              style={{
                fontSize: FONT_SIZE.HEADING_4,
                color: COLORS.textColorMedium,
                marginRight: 3,
              }}
            >
              {capitalize(t)} ·{" "}
            </Typography.Text>
          ))}
          {pricing && pricing.length && rate ? (
            <Flex>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  marginLeft: 2,
                  color: COLORS.textColorMedium,
                }}
              >
                {getMinMaxPrices(pricing.map((c: any) => c.price))} ·{" "}
              </Typography.Text>
              <Typography.Text
                style={{
                  fontSize: FONT_SIZE.HEADING_4,
                  marginLeft: 2,
                  color: COLORS.textColorMedium,
                }}
              >
                ₹
                {Math.round(
                  (rate.minimumUnitCost / (rate.minimumUnitSize * 1000)) * 10
                ) / 10}
                k per sq.ft
              </Typography.Text>
            </Flex>
          ) : null}
        </Flex>

        <Flex
          gap={8}
          style={{
            overflowX: "scroll",
            whiteSpace: "nowrap",
            width: "100%",
            scrollbarWidth: "none",
          }}
        >
          <Flex gap={8}>
            {(project.media || [])
              .filter(
                (i: any) =>
                  !!i.image &&
                  !!i.image.url &&
                  i.image.tags?.length &&
                  !i.image.tags.includes("na")
              )
              .map((i: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    backgroundImage: `url('${i.image.url}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: 200,
                    height: 200,
                    borderRadius: 8,
                    border: `1px solid ${COLORS.borderColor}`,
                  }}
                />
              ))}
          </Flex>
        </Flex>

        {project.reportSlug ? (
          <Link
            href={`/app/brick360/${project.reportSlug}`}
            prefetch={false}
            style={{
              display: "block",
              textAlign: "center",
              padding: "10px 0",
              marginTop: 16,
              backgroundColor: COLORS.primaryColor,
              color: "#fff",
              borderRadius: 8,
              fontSize: FONT_SIZE.HEADING_4,
              textDecoration: "none",
            }}
          >
            Open Report
          </Link>
        ) : null}
      </Flex>
    ),
  };
};
