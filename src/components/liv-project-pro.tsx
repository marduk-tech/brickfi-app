import { Flex, List, Tabs, Tag, Timeline, Typography } from "antd";
import { useParams } from "react-router-dom";
import { useFetchProjectById } from "../hooks/use-project";
import { Loader } from "./common/loader";
import ProjectGallery from "./project-gallery";
import { FONT_SIZE } from "../theme/style-constants";

const { TabPane } = Tabs;
const DATA = {
  qa: [
    {
      question:
        "What is the current Khata for the layout? Is it Khata A or Khata B?",
      answer:
        "The project has 9 and 11A e-Khata. This document will be provided before registration as it is mandatory for the process.",
      categories: ["Khata"],
    },
    {
      question:
        "What do you mean by release order? Does it refer to the time of registration?",
      answer:
        "For apartments, the release order is the Occupancy Certificate (OC). For plotted development, it is a similar document. The release is at the sole discretion of the authority.",
      categories: ["Legal", "Registration"],
    },
    {
      question:
        "Can you share details on the 60ft CDP road? Is there a government-approved document for the same?",
      answer:
        "The clarification on the CDP road will be provided in a few days.",
      categories: ["Infrastructure", "Road Access"],
    },
    {
      question:
        "If we decide not to go ahead with the agreement for any reason, will the full booking amount be refunded within 60 days?",
      answer:
        "Yes, prior to signing the agreement, if the plot is canceled by the buyer, the full amount paid will be refunded within 60 days.",
      categories: ["Payment", "Refund"],
    },
    {
      question:
        "At the time of booking, I requested a break-up of infrastructure charges. ₹500 per sq. ft. seems a lot. Can you please provide details around how the infrastructure charges will be used?",
      answer:
        "Infrastructure charges will be used for facilities like electrical, plumbing, and common amenities.",
      categories: ["Payment", "Infrastructure"],
    },
    {
      question:
        "I don't see a Khata document for the project on the RERA website. What Khata is it, and where is the document?",
      answer:
        "The Khata and tax documents for the individual plot will be provided after the release order. These documents are not currently available on the RERA website.",
      categories: ["Khata", "Legal"],
    },
    {
      question:
        "Can you provide the calculation for Khata Assessment & Bifurcation charges? Usually, it’s a percentage of stamp duty, I believe.",
      answer:
        "The charges are not calculated as a percentage of stamp duty but rather as a lump sum amount for the services.",
      categories: ["Khata", "Payment"],
    },
    {
      question:
        "Are there any charges applied by the builder if the property is transferred before completion/possession to another party?",
      answer:
        "Yes, if the property is transferred before completion/possession, a charge of 4% of the new sale value plus applicable charges will be levied.",
      categories: ["Payment", "Legal"],
    },
    {
      question:
        "No details have been provided on road access for the project from the main Bellary Expressway. It was mentioned that the road would be widened; can you confirm officially, including the details?",
      answer:
        "Currently, customers can access the project through the underpass only. Once the 60-feet CDP road parallel to the railway line is completed, customers will be able to access Panorama through the railway level crossing (next to Signature Villa).",
      categories: ["Infrastructure", "Road Access"],
    },
  ],
  costSheet: {
    plotArea: "1500 sq.ft",
    perSqftRate: "₹6,399",
    totalInfrastructureCharges: "₹8,85,000",
    totalSaleValue: "₹1,04,83,500",
    milestones: [
      {
        milestone: "Agreement Execution (Less Advance)",
        percentageAmount: "10%",
        amountInRupees: "10.48 Lakhs",
        latestDate: "Date of Agreement Execution",
        otherCharges: [
          {
            chargeTitle: "Plot Legal & Documentation",
            chargeAmount: "₹50,000 + Taxes",
            chargeAmountValue: 50000,
          },
        ],
      },
      {
        milestone: "Site Cleaning & Bush Cleaning",
        percentageAmount: "15%",
        amountInRupees: "15.72 Lakhs",
        latestDate: "45 days from booking",
        otherCharges: [],
      },
      {
        milestone: "Grading & Levelling",
        percentageAmount: "10%",
        amountInRupees: "10.48 Lakhs",
        latestDate: "Feb 25, 2025",
        otherCharges: [],
      },
      {
        milestone: "Sewer Line Piping",
        percentageAmount: "10%",
        amountInRupees: "10.48 Lakhs",
        latestDate: "Apr 25, 2025",
        otherCharges: [],
      },
      {
        milestone: "STP and UGT Civil Works",
        percentageAmount: "10%",
        amountInRupees: "10.48 Lakhs",
        latestDate: "Jun 25, 2025",
        otherCharges: [],
      },
      {
        milestone: "Storm Water Drain",
        percentageAmount: "10%",
        amountInRupees: "10.48 Lakhs",
        latestDate: "Aug 25, 2025",
        otherCharges: [],
      },
      {
        milestone: "Footpath Works",
        percentageAmount: "10%",
        amountInRupees: "10.48 Lakhs",
        latestDate: "Oct 25, 2025",
        otherCharges: [],
      },
      {
        milestone: "Entrance Portal",
        percentageAmount: "10%",
        amountInRupees: "10.48 Lakhs",
        latestDate: "Dec 25, 2025",
        otherCharges: [],
      },
      {
        milestone: "Road Works (Except Topcoat)",
        percentageAmount: "5%",
        amountInRupees: "5.24 Lakhs",
        latestDate: "Feb 25, 2026",
        otherCharges: [],
      },
      {
        milestone: "Electrical Works",
        percentageAmount: "5%",
        amountInRupees: "5.24 Lakhs",
        latestDate: "Mar 25, 2026",
        otherCharges: [],
      },
      {
        milestone: "Invitation for Plot Registration",
        percentageAmount: "5%",
        amountInRupees: "5.24 Lakhs",
        latestDate: "To Be Notified",
        otherCharges: [
          {
            chargeTitle: "Clubhouse Membership",
            chargeAmount: "₹2,00,000 + Taxes",
            chargeAmountValue: 200000,
          },
          {
            chargeTitle: "Khata Assessment",
            chargeAmount: "₹40,000 + Taxes",
            chargeAmountValue: 40000,
          },
          {
            chargeTitle: "Corpus Fund",
            chargeAmount: "₹50/sqft SBUA",
            chargeAmountValue: 75000,
          },
          {
            chargeTitle: "Maintenance",
            chargeAmount: "₹48/sqft SBUA + Taxes",
            chargeAmountValue: 72000,
          },
        ],
      },
    ],
    totalValue: "₹10,920,500.00",
  },
};
const LivProjectPro = () => {
  const { projectId } = useParams();

  const { data: projectData, isLoading: projectDataLoading } =
    useFetchProjectById(projectId!);

  if (!projectData) {
    return <Loader></Loader>;
  }
  return (
    <Flex
      vertical
      style={{
        padding: 16,
        height: window.innerHeight - 100,
        overflowY: "auto",
        scrollbarWidth: "none",
        paddingBottom: 150,
        scrollBehavior: "smooth",
      }}
    >
      <h2>{projectData.metadata.name}</h2>

      <Flex>
        <ProjectGallery media={projectData.media}></ProjectGallery>
      </Flex>

      {/* Tabbed Content */}
      <Tabs defaultActiveKey="1" style={{ marginTop: 20 }}>
        <TabPane
          tab="Payment Details"
          key="cost-sheet"
          style={{ width: "100%" }}
        >
          <Timeline
            items={DATA.costSheet.milestones.map((m) => {
              const otherChargesTotal = m.otherCharges.reduce(
                (partialSum, a) => partialSum + a.chargeAmountValue,
                0
              );
              return {
                children: (
                  <Flex vertical>
                    <Flex vertical>
                      <Typography.Text
                        style={{
                          fontSize: FONT_SIZE.HEADING_3,
                        }}
                      >
                        {m.latestDate}
                      </Typography.Text>
                      <Flex>
                        <Typography.Text style={{ fontSize: FONT_SIZE.PARA }}>
                          ₹{m.amountInRupees} / {m.percentageAmount}{" "}
                        </Typography.Text>
                        {otherChargesTotal ? (
                          <Typography.Text
                            style={{
                              marginLeft: 8,
                              fontSize: FONT_SIZE.PARA,
                            }}
                          >
                            {"+₹"}
                            {otherChargesTotal}
                          </Typography.Text>
                        ) : null}
                      </Flex>
                    </Flex>
                    <Flex style={{ flexWrap: "wrap" }} gap={8}>
                      <Tag style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
                        {m.milestone}
                      </Tag>
                      {m.otherCharges.map((o) => {
                        return (
                          <Tag style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
                            {" "}
                            {`${o.chargeTitle} (${o.chargeAmount})`}
                          </Tag>
                        );
                      })}
                    </Flex>
                  </Flex>
                ),
              };
            })}
          />
        </TabPane>
        <TabPane tab="QA" key="qa" style={{ width: "80%" }}>
          <List
            itemLayout="horizontal"
            dataSource={DATA.qa}
            renderItem={(item, index) => (
              <List.Item>
                <List.Item.Meta
                  title={item.question}
                  description={
                    <Flex vertical>
                      <Flex>
                        {item.categories.map((c) => (
                          <Tag>{c}</Tag>
                        ))}
                      </Flex>
                      <Typography.Text>{item.answer}</Typography.Text>
                    </Flex>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>
    </Flex>
  );
};

export default LivProjectPro;
