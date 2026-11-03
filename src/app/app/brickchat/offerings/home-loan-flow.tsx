"use client";

import { apiKey, baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Button,
  Col,
  Collapse,
  DatePicker,
  Empty,
  Flex,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Skeleton,
  Switch,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { postJson } from "./api";
import {
  ContactConsent,
  contactFrom,
  ExpertCallField,
  fieldLabel,
  FlowFooter,
  MobileField,
  queryLabel,
  ToggleSection,
} from "./flow-shared";
import type { OfferingFlowProps } from "./types";
import DynamicReactIcon from "@/components/common/dynamic-react-icon";

// ---------------------------------------------------------------------------
// bkfi-home-loan (Brickfi Home Loans) - raises a request with the user's
// question, like the legal/expert flows, plus - when they opened "Check
// eligibility & see offers" - what was entered there and the bank offers
// Ambak returned (proxied by services, /third-party/ambak/*). Same steps and
// fields as the admin app's ambak-home-loan-tab.tsx.
// ---------------------------------------------------------------------------

type YesNo = "Yes" | "No";

interface AmbakMasterOption {
  id: string; // master IDs come back as strings, send them as numbers
  label: string;
}

interface AmbakMasterdata {
  loan_type: AmbakMasterOption[];
  profession: AmbakMasterOption[];
}

// Nested the way Ambak's offers endpoint validates it - see
// libs/api/ambak.ts in the admin app. Field names (and their spellings) are
// Ambak's.
interface AmbakOffersRequest {
  loan_type: "1" | "2";
  lead_details: {
    loan_amount: number;
    cibil_score: number;
    max_tenure: number;
    monthly_salary: number;
    gross_monthly_salary: number;
    profession: number;
    Fullfilment_type: "Self";
    existing_emi_amount?: number;
    emi_ending_six_month?: number;
    is_property_decided?: YesNo;
    is_additional_income?: YesNo;
    rent_amount?: number;
    monthly_incentives_amount?: number;
    annual_bonus_amount?: number;
    monthly_reimbursements_amount?: number;
    payment_mode?: string;
  };
  property_details?: {
    expected_market_value?: number; // HL
    property_city?: number; // HL
    Property_city?: number; // LAP
    property_type?: string; // HL
    property_sub_type?: string;
    agreement_type?: string; // HL
    property_usage?: string; // LAP, required
    occupancy_status?: string; // LAP
  };
  co_applicant?: {
    is_co_additional_income: YesNo;
    ca_profession?: number;
    ca_gross_monthly_salary?: number;
  }[];
  customer: { dob: string }; // dd/mm/yyyy
}

// Fees other than processingFee come back as display text ("Rs.9,500 + GST",
// "Waived", "")
interface AmbakOffer {
  bankName: string;
  bankId?: number;
  bankLogo?: string;
  eligibalLoanAmount?: number;
  monthlyEMI?: number;
  minRoi?: number;
  maxRoi?: number;
  maxTenure?: number;
  finalMaxTenure?: number;
  calculationBase?: string; // "Income based" / "Property based"
  is_apf_approved?: boolean;
  uspData?: { logo?: string; usp_text: string }[];
  roiConcessions?: {
    appliedConcessions?: { key: string; label: string; concession: number }[];
  } | null;
  processingFee?: number | string;
  processingText?: string;
  login_fee?: string;
  ac_handling_charge?: string;
  legal_technical_fee?: string;
  e_stamp_charge?: string;
  due_diligence_charge?: string;
  CERSAI_charge?: string;
  MODT_charge?: string;
  NOI_charge?: string;
  foreclosure_charge?: string;
}

type LeadDetails = AmbakOffersRequest["lead_details"];
type PropertyDetails = NonNullable<AmbakOffersRequest["property_details"]>;
type CoApplicant = NonNullable<AmbakOffersRequest["co_applicant"]>[number];

// The form is flat across its tabs; buildAmbakPayload nests it into the
// request. property_city is sent as property_city (HL) or Property_city (LAP).
type HomeLoanFormValues = Omit<LeadDetails, "Fullfilment_type"> &
  Omit<PropertyDetails, "Property_city"> &
  Partial<CoApplicant> & { loan_type: number; dob: Dayjs };

const HOME_LOAN = 1;
const LAP = 2;

const YES_NO = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const toOptions = (values: string[]) =>
  values.map((v) => ({ value: v, label: v.replace(/_/g, " ") }));

// Offers takes these as strings, not master-data IDs
const HL_PROPERTY_TYPES = toOptions([
  "Resale",
  "Builder_endorsement",
  "Builder_allotment",
  "Authority_allotment",
]);
const HL_PROPERTY_SUB_TYPES = toOptions([
  "Ready_to_move",
  "Plot",
  "Plot_construction",
  "Construction_linked",
]);
const HL_AGREEMENT_TYPES = toOptions(["Freehold", "Leasehold", "Regularised"]);
const LAP_PROPERTY_SUB_TYPES = toOptions(["plot", "ready to move"]);
const LAP_PROPERTY_USAGES = toOptions([
  "residential",
  "commercial",
  "industrial",
]);
const LAP_OCCUPANCY_STATUSES = toOptions([
  "Self_occupied",
  "vacant",
  "Given_on_rent",
]);
const PAYMENT_MODES = toOptions(["cash", "account"]);

// Tabs left out of this flow for now - their fields aren't mounted (the
// form doesn't preserve unmounted fields), so they're left out of the request
const HIDDEN_SECTIONS = new Set(["property", "income", "coApplicant"]);

// Which tab each field lives on, so a failed submit can jump to the first error
const HOME_LOAN_SECTION_FIELDS: Record<string, string[]> = {
  lead: [
    "loan_type",
    "profession",
    "loan_amount",
    "cibil_score",
    "max_tenure",
    "monthly_salary",
    "gross_monthly_salary",
    "dob",
    "existing_emi_amount",
    "emi_ending_six_month",
    "is_property_decided",
  ],
  property: [
    "expected_market_value",
    "property_city",
    "property_type",
    "property_sub_type",
    "agreement_type",
    "property_usage",
    "occupancy_status",
  ],
  income: [
    "is_additional_income",
    "rent_amount",
    "monthly_incentives_amount",
    "annual_bonus_amount",
    "monthly_reimbursements_amount",
    "payment_mode",
  ],
  coApplicant: [
    "is_co_additional_income",
    "ca_profession",
    "ca_gross_monthly_salary",
  ],
};

// Only Ambak's own master data - no fallback list, since a made-up id would
// be accepted by the form and rejected (or misread) by Ambak. Empty until
// master data loads; checking eligibility is blocked until then.
const masterOptions = (list: AmbakMasterOption[] | undefined) =>
  (list ?? []).map((o) => ({
    value: Number(o.id),
    label: o.label,
  }));

const formatINR = (value?: number | string | null) => {
  if (value === undefined || value === null || value === "") return "-";
  const n = Number(value);
  return Number.isFinite(n) ? `₹${n.toLocaleString("en-IN")}` : String(value);
};

const amountInput = (
  <InputNumber prefix="₹" min={0} style={{ width: "100%" }} />
);

// Leave unset optional fields out rather than sending null/""
const compact = <T extends object>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ) as T;

// The eligibility form as the user filled it in, for the ticket - partial is
// fine, unlike buildAmbakPayload's request
const enteredLoanDetails = (v: Partial<HomeLoanFormValues>) =>
  compact({ ...v, dob: v.dob?.format("DD/MM/YYYY") });

const buildAmbakPayload = (v: HomeLoanFormValues): AmbakOffersRequest => {
  const isLap = v.loan_type === LAP;
  const property = compact<PropertyDetails>({
    expected_market_value: v.expected_market_value,
    [isLap ? "Property_city" : "property_city"]: v.property_city,
    property_type: v.property_type,
    property_sub_type: v.property_sub_type,
    agreement_type: v.agreement_type,
    property_usage: v.property_usage,
    occupancy_status: v.occupancy_status,
  });
  return {
    loan_type: isLap ? "2" : "1",
    lead_details: compact<LeadDetails>({
      loan_amount: v.loan_amount,
      cibil_score: v.cibil_score,
      max_tenure: v.max_tenure,
      monthly_salary: v.monthly_salary,
      gross_monthly_salary: v.gross_monthly_salary,
      profession: v.profession,
      Fullfilment_type: "Self",
      existing_emi_amount: v.existing_emi_amount,
      emi_ending_six_month: v.emi_ending_six_month,
      is_property_decided: v.is_property_decided,
      is_additional_income: v.is_additional_income,
      rent_amount: v.rent_amount,
      monthly_incentives_amount: v.monthly_incentives_amount,
      annual_bonus_amount: v.annual_bonus_amount,
      monthly_reimbursements_amount: v.monthly_reimbursements_amount,
      payment_mode: v.payment_mode,
    }),
    ...(Object.keys(property).length > 0 && { property_details: property }),
    ...(v.is_co_additional_income === "Yes" && {
      co_applicant: [
        compact<CoApplicant>({
          is_co_additional_income: "Yes",
          ca_profession: v.ca_profession,
          ca_gross_monthly_salary: v.ca_gross_monthly_salary,
        }),
      ],
    }),
    customer: { dob: v.dob.format("DD/MM/YYYY") },
  };
};

const getAmbakMasterdata = async (): Promise<AmbakMasterdata> => {
  const res = await fetch(`${baseApiUrl}third-party/ambak/masterdata`, {
    headers: { "x-api-key": apiKey || "" },
  });
  if (!res.ok) throw new Error(`ambak masterdata ${res.status}`);
  const data: Partial<AmbakMasterdata> = await res.json();
  // the form only offers Ambak's ids, so a missing list is an error, not empty
  if (!data.loan_type?.length || !data.profession?.length) {
    throw new Error("ambak masterdata missing loan_type or profession");
  }
  return data as AmbakMasterdata;
};

// Response is { status, statusText, message, data: AmbakOffer[] }
const getAmbakOffers = async (
  payload: AmbakOffersRequest,
): Promise<AmbakOffer[]> => {
  const json = await postJson<{ data?: AmbakOffer[] }>(
    "third-party/ambak/offers",
    payload,
  );
  return json.data ?? [];
};

const sortByRoi = (offers: AmbakOffer[]) =>
  [...offers].sort((a, b) => (a.minRoi ?? Infinity) - (b.minRoi ?? Infinity));

const formatRoi = (offer: AmbakOffer) =>
  offer.minRoi === undefined
    ? "-"
    : offer.maxRoi !== undefined && offer.maxRoi !== offer.minRoi
    ? `${offer.minRoi}% – ${offer.maxRoi}%`
    : `${offer.minRoi}%`;

// The ticket's "Your request" line - what was asked and what came back
const homeLoanQuery = (payload: AmbakOffersRequest, offers: AmbakOffer[]) => {
  const loan =
    payload.loan_type === "2" ? "Loan against property" : "Home loan";
  const ask = `${loan} of ${formatINR(payload.lead_details.loan_amount)} over ${
    payload.lead_details.max_tenure
  } yrs`;
  if (!offers.length) return `${ask} - no eligible bank offers`;
  const best = offers[0];
  return `${ask} - ${offers.length} eligible ${
    offers.length === 1 ? "bank" : "banks"
  }, lowest ROI ${formatRoi(best)} (${best.bankName})`;
};

const statBlock = (label: string, value: string) => (
  <Flex vertical gap={2}>
    <Typography.Text
      style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
    >
      {label}
    </Typography.Text>
    <Typography.Text style={{ fontSize: FONT_SIZE.HEADING_4, fontWeight: 600 }}>
      {value}
    </Typography.Text>
  </Flex>
);

function HomeLoanOfferCard({ offer }: { offer: AmbakOffer }) {
  const tenure = offer.finalMaxTenure ?? offer.maxTenure;
  const concessions = offer.roiConcessions?.appliedConcessions ?? [];

  const fees: [string, number | string | undefined][] = [
    ["Processing fee", offer.processingFee],
    ["Processing (additional)", offer.processingText],
    ["Login fee", offer.login_fee],
    ["A/c handling", offer.ac_handling_charge],
    ["Legal & technical", offer.legal_technical_fee],
    ["E-stamp", offer.e_stamp_charge],
    ["Due diligence", offer.due_diligence_charge],
    ["CERSAI", offer.CERSAI_charge],
    ["MODT", offer.MODT_charge],
    ["NOI", offer.NOI_charge],
    ["Foreclosure", offer.foreclosure_charge],
  ];
  const presentFees = fees.filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );

  return (
    <Flex
      vertical
      gap={12}
      style={{
        padding: 12,
        borderRadius: 8,
        border: `1px solid ${COLORS.borderColorMedium}`,
        backgroundColor: "white",
      }}
    >
      <Flex align="center" gap={12}>
        <Avatar shape="square" size={32} src={offer.bankLogo}>
          {offer.bankName?.[0]}
        </Avatar>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 600 }}
        >
          {offer.bankName}
        </Typography.Text>
      </Flex>
      <Row gutter={[12, 12]}>
        <Col span={12}>{statBlock("ROI", formatRoi(offer))}</Col>
        <Col span={12}>
          {statBlock("Monthly EMI", formatINR(offer.monthlyEMI))}
        </Col>
        <Col span={12}>
          {statBlock("Eligible amount", formatINR(offer.eligibalLoanAmount))}
        </Col>
        <Col span={12}>
          {statBlock("Tenure", tenure === undefined ? "-" : `${tenure} yrs`)}
        </Col>
      </Row>
      {offer.calculationBase || offer.is_apf_approved || concessions.length ? (
        <Flex wrap gap={4}>
          {offer.calculationBase && (
            <Tag color="blue">{offer.calculationBase}</Tag>
          )}
          {offer.is_apf_approved && <Tag color="green">APF approved</Tag>}
          {concessions.map((c) => (
            <Tag key={c.key} color="gold">
              {c.label}: −{c.concession}% ROI
            </Tag>
          ))}
        </Flex>
      ) : null}
      {offer.uspData?.map((u) => (
        <Typography.Text
          key={u.usp_text}
          style={{
            fontSize: FONT_SIZE.SUB_TEXT,
            color: COLORS.textColorMedium,
          }}
        >
          {u.usp_text.trim()}
        </Typography.Text>
      ))}
      {presentFees.length > 0 && (
        <Collapse
          ghost
          size="small"
          style={{ marginInline: -12, marginBottom: -12 }}
          items={[
            {
              key: "fees",
              label: "Fees & charges",
              children: (
                <Flex vertical gap={4}>
                  {presentFees.map(([label, value]) => (
                    <Flex key={label} justify="space-between" gap={12}>
                      <Typography.Text
                        style={{
                          fontSize: FONT_SIZE.SUB_TEXT,
                          color: COLORS.textColorLight,
                        }}
                      >
                        {label}
                      </Typography.Text>
                      <Typography.Text style={{ fontSize: FONT_SIZE.SUB_TEXT }}>
                        {formatINR(value)}
                      </Typography.Text>
                    </Flex>
                  ))}
                </Flex>
              ),
            },
          ]}
        />
      )}
    </Flex>
  );
}

export default function HomeLoanFlow({
  context,
  submitting,
  onSubmit,
  onCancel,
}: OfferingFlowProps) {
  const [form] = Form.useForm<HomeLoanFormValues>();
  const [contactForm] = Form.useForm();
  const [step, setStep] = useState<"requirements" | "offers">("requirements");
  const [section, setSection] = useState("lead");
  // the "Provide Details to See Offers" switch - off by default, the
  // question alone is enough to raise a request
  const [showOffers, setShowOffers] = useState(false);
  // what the shown offers were fetched for - goes on the ticket with them
  const [lastPayload, setLastPayload] = useState<AmbakOffersRequest | null>(
    null,
  );

  const {
    data: masterdata,
    isLoading: masterLoading,
    isFetching: masterFetching,
    error: masterError,
    refetch: refetchMasterdata,
  } = useQuery({
    queryKey: ["ambak-masterdata"],
    queryFn: getAmbakMasterdata,
    staleTime: 24 * 60 * 60 * 1000, // Ambak asks partners to cache master data daily
    refetchOnWindowFocus: false,
  });
  const offersMutation = useMutation({ mutationFn: getAmbakOffers });
  const offers = offersMutation.data ? sortByRoi(offersMutation.data) : [];

  const loanType = Form.useWatch("loan_type", form);
  const propertyDecided = Form.useWatch("is_property_decided", form) as
    | YesNo
    | undefined;
  const additionalIncome = Form.useWatch("is_additional_income", form) as
    | YesNo
    | undefined;
  const coApplicantIncome = Form.useWatch("is_co_additional_income", form) as
    | YesNo
    | undefined;

  const query: string = Form.useWatch("query", contactForm) || "";
  const askExpert: boolean =
    Form.useWatch("askExpertToContact", contactForm) || false;
  // offers fetched for the details last checked - they go on the request
  const seenOffers = offersMutation.isSuccess && !!lastPayload;
  // something to act on: a question, a request for an expert to call, or
  // the offers the user checked (while the offers switch is still on)
  const canSubmit =
    !!query.trim() || askExpert || (showOffers && seenOffers);

  const loanTypeOptions = masterOptions(masterdata?.loan_type);
  const professionOptions = masterOptions(masterdata?.profession);

  const checkEligibility = (values: HomeLoanFormValues) => {
    const payload = buildAmbakPayload(values);
    setLastPayload(payload);
    setStep("offers");
    offersMutation.mutate(payload);
  };

  const onFinishFailed = ({
    errorFields,
  }: {
    errorFields: { name: (string | number)[] }[];
  }) => {
    const first = String(errorFields[0]?.name[0] ?? "");
    const target = Object.keys(HOME_LOAN_SECTION_FIELDS).find((k) =>
      HOME_LOAN_SECTION_FIELDS[k].includes(first),
    );
    if (target) setSection(target);
  };

  const sections = [
    {
      key: "lead",
      label: "Your details",
      children: (
        <Row gutter={12}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="loan_type"
              label={fieldLabel("Loan type")}
              rules={[{ required: true, message: "Please choose one" }]}
            >
              <Select
                loading={masterLoading}
                options={loanTypeOptions}
                placeholder="Select loan type"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="profession"
              label={fieldLabel("Profession")}
              rules={[{ required: true, message: "Please choose one" }]}
            >
              <Select
                loading={masterLoading}
                options={professionOptions}
                placeholder="Select profession"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="loan_amount"
              label={fieldLabel("Loan amount")}
              rules={[{ required: true, message: "Required" }]}
            >
              {amountInput}
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="max_tenure"
              label={fieldLabel("Tenure (years)")}
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={1} max={40} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="cibil_score"
              label={fieldLabel("CIBIL score")}
              rules={[{ required: true, message: "Required" }]}
            >
              <InputNumber min={300} max={900} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="dob"
              label={fieldLabel("Date of birth")}
              rules={[{ required: true, message: "Required" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                inputReadOnly
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="monthly_salary"
              label={fieldLabel("Net monthly salary")}
              rules={[{ required: true, message: "Required" }]}
            >
              {amountInput}
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="gross_monthly_salary"
              label={fieldLabel("Gross monthly salary")}
              rules={[{ required: true, message: "Required" }]}
            >
              {amountInput}
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="existing_emi_amount"
              label={fieldLabel("Existing EMI")}
              tooltip="Current monthly EMI obligations"
            >
              {amountInput}
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="emi_ending_six_month"
              label={fieldLabel("EMI ending in 6 months")}
              tooltip="EMI obligations ending within 6 months"
            >
              {amountInput}
            </Form.Item>
          </Col>
          {/* hidden for now - still mounted, so its "No" default is sent */}
          <Form.Item
            name="is_property_decided"
            label={fieldLabel("Have you decided on the property?")}
            hidden
          >
            <Radio.Group options={YES_NO} optionType="button" />
          </Form.Item>
        </Row>
      ),
    },
    {
      key: "property",
      label: "Property",
      children: !loanType ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Choose a loan type in Your details first"
        />
      ) : (
        <Row gutter={12} key={loanType}>
          {loanType === HOME_LOAN && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="expected_market_value"
                label={fieldLabel("Expected market value")}
                rules={[
                  {
                    required: propertyDecided === "Yes",
                    message: "Required when the property is decided",
                  },
                ]}
              >
                {amountInput}
              </Form.Item>
            </Col>
          )}
          <Col xs={24} sm={12}>
            <Form.Item
              name="property_city"
              label={fieldLabel("Property city ID")}
              tooltip="Ambak city ID (master list pending)"
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          {loanType === HOME_LOAN ? (
            <>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="property_type"
                  label={fieldLabel("Property type")}
                >
                  <Select allowClear options={HL_PROPERTY_TYPES} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="property_sub_type"
                  label={fieldLabel("Property sub type")}
                >
                  <Select allowClear options={HL_PROPERTY_SUB_TYPES} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="agreement_type"
                  label={fieldLabel("Agreement type")}
                >
                  <Select allowClear options={HL_AGREEMENT_TYPES} />
                </Form.Item>
              </Col>
            </>
          ) : (
            <>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="property_sub_type"
                  label={fieldLabel("Property sub type")}
                >
                  <Select allowClear options={LAP_PROPERTY_SUB_TYPES} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="property_usage"
                  label={fieldLabel("Property usage")}
                  rules={[{ required: true, message: "Please choose one" }]}
                >
                  <Select allowClear options={LAP_PROPERTY_USAGES} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="occupancy_status"
                  label={fieldLabel("Occupancy status")}
                >
                  <Select allowClear options={LAP_OCCUPANCY_STATUSES} />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      ),
    },
    {
      key: "income",
      label: "Other income",
      children: (
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name="is_additional_income"
              label={fieldLabel("Include additional income?")}
            >
              <Radio.Group options={YES_NO} optionType="button" />
            </Form.Item>
          </Col>
          {additionalIncome === "Yes" && (
            <>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="rent_amount"
                  label={fieldLabel("Monthly rent income")}
                >
                  {amountInput}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="monthly_incentives_amount"
                  label={fieldLabel("Monthly incentives")}
                >
                  {amountInput}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="annual_bonus_amount"
                  label={fieldLabel("Annual bonus")}
                >
                  {amountInput}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="monthly_reimbursements_amount"
                  label={fieldLabel("Monthly reimbursements")}
                >
                  {amountInput}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="payment_mode"
                  label={fieldLabel("Payment mode")}
                >
                  <Select allowClear options={PAYMENT_MODES} />
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      ),
    },
    {
      key: "coApplicant",
      label: "Co-applicant",
      children: (
        <Row gutter={12}>
          <Col span={24}>
            <Form.Item
              name="is_co_additional_income"
              label={fieldLabel("Include co-applicant income?")}
            >
              <Radio.Group options={YES_NO} optionType="button" />
            </Form.Item>
          </Col>
          {coApplicantIncome === "Yes" && (
            <>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="ca_profession"
                  label={fieldLabel("Co-applicant profession")}
                >
                  <Select
                    allowClear
                    loading={masterLoading}
                    options={professionOptions}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="ca_gross_monthly_salary"
                  label={fieldLabel("Co-applicant gross monthly salary")}
                >
                  {amountInput}
                </Form.Item>
              </Col>
            </>
          )}
        </Row>
      ),
    },
  ]
    .filter((s) => !HIDDEN_SECTIONS.has(s.key))
    .map((s) => ({ ...s, forceRender: true })); // keep every tab mounted so all fields validate on submit

  const offersStep = () => {
    if (offersMutation.isPending)
      return (
        <Flex vertical gap={12}>
          {[0, 1].map((i) => (
            <Skeleton key={i} active avatar />
          ))}
        </Flex>
      );
    if (offersMutation.error)
      return (
        <Alert
          type="error"
          showIcon
          message="Couldn't fetch bank offers"
          description="Please check your details and try again."
        />
      );
    if (!offers.length)
      return <Empty description="No eligible bank offers for these details" />;
    return (
      <Flex vertical gap={12}>
        <Typography.Text
          style={{ fontSize: FONT_SIZE.SUB_TEXT, color: COLORS.textColorLight }}
        >
          {offers.length} eligible {offers.length === 1 ? "bank" : "banks"},
          lowest ROI first
        </Typography.Text>
        {offers.map((offer, i) => (
          <HomeLoanOfferCard
            key={`${offer.bankId ?? offer.bankName}-${i}`}
            offer={offer}
          />
        ))}
      </Flex>
    );
  };

  const eligibilityPanel = (
    <>
      {/* kept mounted on the offers step, so "Edit details" comes back to
          what was entered */}
      <div style={{ display: step === "requirements" ? "block" : "none" }}>
        {masterError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 12 }}
            message="Couldn't load the loan types and professions - try again to check eligibility"
            action={
              <Button
                size="small"
                loading={masterFetching}
                onClick={() => refetchMasterdata()}
              >
                Retry
              </Button>
            }
          />
        )}
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          preserve={false}
          disabled={submitting}
          initialValues={{
            is_property_decided: "No",
            is_additional_income: "No",
            is_co_additional_income: "No",
          }}
          onFinish={checkEligibility}
          onFinishFailed={onFinishFailed}
        >
          <Flex
            vertical
            style={{
              padding: "0 8px",
              borderRadius: 8,
            }}
          >
            <Tabs
              activeKey={section}
              onChange={setSection}
              items={sections}
              size="small"
            />
            {/* the Other income tab is hidden, but its "No" default is still
                sent, as before */}
            {HIDDEN_SECTIONS.has("income") && (
              <Form.Item name="is_additional_income" hidden noStyle />
            )}
          </Flex>
          <Flex justify="flex-end" style={{ marginTop: 8 }}>
            <Button type="primary" htmlType="submit" disabled={!masterdata}>
              Check eligibility
            </Button>
          </Flex>
        </Form>
      </div>

      {step === "offers" && (
        <>
          <Flex
            align="center"
            justify="space-between"
            style={{ marginBottom: 12 }}
          >
            {fieldLabel("Your bank offers")}
            <Button
              type="link"
              size="small"
              onClick={() => setStep("requirements")}
              disabled={offersMutation.isPending || submitting}
            >
              Edit details
            </Button>
          </Flex>
          {/* the modal body scrolls, see OfferingFlowDialog */}
          {offersStep()}
        </>
      )}
    </>
  );

  // the eligibility form is a sibling, not nested (forms can't be), so the
  // footer below submits this form by its name
  return (
    <>
      {/* kept mounted while off so what was entered (and any offers) is
          still there when switched back on - it's a separate form, so its
          hidden fields never block the request's submit */}
      <ToggleSection
        title={
          <Flex gap={8} align="center">
            <Typography.Text
              style={{ fontSize: FONT_SIZE.HEADING_3, fontWeight: 500 }}
            >
              Provide Details to See Offers
            </Typography.Text>
            <DynamicReactIcon
              iconName="BiSolidOffer"
              iconSet="bi"
              size={24}
              color={COLORS.textColorDark}
            ></DynamicReactIcon>
          </Flex>
        }
        open={showOffers}
        keepMounted
        toggle={
          <Switch
            checked={showOffers}
            onChange={setShowOffers}
            disabled={submitting}
          />
        }
      >
        {/* scrolls on its own, so the question below stays in view */}
        <div style={{ maxHeight: "45vh", overflowY: "auto" }}>
          {eligibilityPanel}
        </div>
      </ToggleSection>

      <Form
        form={contactForm}
        name="homeLoanRequest"
        layout="vertical"
        requiredMark={false}
        disabled={submitting}
        initialValues={{ askExpertToContact: false }}
        onFinish={(values) => {
          const userQuery = values.query?.trim();
          // switching "Provide Details to See Offers" off leaves its details
          // and offers out of the ticket
          const sendOffers = showOffers && seenOffers;
          const ticketQuery = [
            userQuery,
            sendOffers && lastPayload ? homeLoanQuery(lastPayload, offers) : "",
          ]
            .filter(Boolean)
            .join("\n\n");
          // whatever was entered under "Provide Details to See Offers", even
          // if the check was never run (its fields only mount once the
          // switch is first turned on, so untouched means nothing entered)
          const loanDetails =
            showOffers && form.isFieldsTouched()
              ? enteredLoanDetails(form.getFieldsValue())
              : null;
          onSubmit({
            ...(ticketQuery ? { query: ticketQuery } : {}),
            ...(loanDetails && { loanDetails }),
            // only when the user checked eligibility before raising it
            ...(sendOffers && {
              eligibilityRequest: lastPayload,
              offers: offers.map((o) => ({
                bankName: o.bankName,
                bankId: o.bankId,
                minRoi: o.minRoi,
                maxRoi: o.maxRoi,
                monthlyEMI: o.monthlyEMI,
                eligibleLoanAmount: o.eligibalLoanAmount,
                tenure: o.finalMaxTenure ?? o.maxTenure,
              })),
            }),
            askExpertToContact: !!values.askExpertToContact,
            consentToContact: true,
            contact: contactFrom(context, values),
          });
        }}
      >
        <Flex
          vertical
          style={{
            padding: 8,
            borderRadius: 8,
          }}
        >
          <Form.Item
            name="query"
            label={queryLabel("Create a Task for Me")}
            style={{ marginBottom: 12 }}
          >
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              maxLength={1000}
              placeholder="Enter your query"
            />
          </Form.Item>

          <ExpertCallField />

          <MobileField context={context} />
        </Flex>
      </Form>

      <ContactConsent />

      <FlowFooter
        form="homeLoanRequest"
        submitting={submitting}
        onCancel={onCancel}
        disabled={!canSubmit || offersMutation.isPending}
      />
    </>
  );
}
