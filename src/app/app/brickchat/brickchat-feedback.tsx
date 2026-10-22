"use client";

import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { apiKey, baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import {
  App,
  Button,
  Flex,
  Input,
  Modal,
  Select,
  Tooltip,
  Typography,
  Upload,
  UploadFile,
} from "antd";
import type { RcFile } from "antd/es/upload";
import { useState } from "react";

// Reuses the existing multi-file upload endpoint (upload.route.js) rather
// than a brickchat-specific one - same S3 bucket/webp-conversion pipeline
// every other image upload in the app already goes through. Field name
// "files" matches upload.array('files', 100) there; the response's
// `results` array is in the same order the files were appended.
const uploadFeedbackImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await fetch(`${baseApiUrl}upload/multiple`, {
    method: "POST",
    headers: { "x-api-key": apiKey || "" },
    body: formData,
  });
  if (!res.ok) throw new Error(`upload/multiple ${res.status}`);
  const json = await res.json();
  return (json?.results || []).map((r: { Location: string }) => r.Location);
};

// Same 1-5 scale as rating in brickchat-feedback.model.js (backend)
type FeedbackRating = 1 | 2 | 3 | 4 | 5;

const FEEDBACK_RATING_OPTIONS: {
  value: FeedbackRating;
  label: string;
  icon: string;
}[] = [
  { value: 1, label: "Bad", icon: "MdSentimentVeryDissatisfied" },
  { value: 2, label: "Needs work", icon: "MdSentimentDissatisfied" },
  { value: 3, label: "Satisfactory", icon: "MdSentimentSatisfied" },
  { value: 4, label: "Good", icon: "MdSentimentSatisfiedAlt" },
  { value: 5, label: "Awesome", icon: "MdSentimentVerySatisfied" },
];

// Same values as the category enum in brickchat-feedback.model.js (backend)
type FeedbackCategory =
  | "wrong-intent"
  | "wrong-project"
  | "wrong-data"
  | "hallucination"
  | "missing-info"
  | "too-long"
  | "tone"
  | "other";

const FEEDBACK_CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] =
  [
    { value: "wrong-intent", label: "Misunderstood my question" },
    { value: "wrong-project", label: "Wrong project(s)" },
    { value: "wrong-data", label: "Incorrect information" },
    { value: "hallucination", label: "Made-up information" },
    { value: "missing-info", label: "Missing information" },
    { value: "too-long", label: "Too long" },
    { value: "tone", label: "Tone or style" },
    { value: "other", label: "Something else" },
  ];

const submitBrickchatFeedback = async (payload: {
  threadId: string;
  turnId?: string;
  userId: string;
  rating?: FeedbackRating;
  category?: FeedbackCategory;
  text?: string;
  imageUrls?: string[];
}): Promise<void> => {
  const res = await fetch(`${baseApiUrl}brickchat-feedback`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey || "",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`brickchat-feedback ${res.status}`);
};

const MAX_FEEDBACK_IMAGES = 5;

interface BrickchatFeedbackProps {
  /** Same thread id the "Share chat"/"View in LangSmith" toolbar buttons use - see brickchat-client.tsx. */
  threadId?: string;
  userId?: string;
  /** The answer's own turnId (see ExploreAnswer) - set for feedback on one turn, omitted for the whole thread. */
  turnId?: string;
}

// Self-contained feedback button + modal: in brickchat-client's toolbar
// (alongside Share/LangSmith/New chat) for the thread as a whole, and under
// each answer with that turn's turnId. Saved to the brickchat_feedback
// collection (see brickchat-feedback.model.js in the backend) - a separate,
// user-initiated note, not brickchat_logger's own automatic turn-by-turn
// logging. Rating, category and text are each optional, but a rating or
// some text is needed to submit (or a category, on a turn). Thread-level
// feedback doesn't ask for a category - it's always sent as "other".
export default function BrickchatFeedback({
  threadId,
  userId,
  turnId,
}: BrickchatFeedbackProps) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRating>();
  const [feedbackCategory, setFeedbackCategory] = useState<FeedbackCategory>();
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackFileList, setFeedbackFileList] = useState<UploadFile[]>([]);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  // Context-bound instance (see ClientProviders' <AntApp> wrapper) rather
  // than the plain static import - the static message/notification/Modal
  // API renders its own holder outside AntApp's StyleProvider cache, so its
  // styles never get injected and the toast is invisible even though it
  // technically fires.
  const { message } = App.useApp();

  if (!threadId) {
    return null;
  }

  // the category is only asked for on a turn - thread-level feedback always
  // goes in as "other", which shouldn't make an otherwise empty form valid
  const askCategory = !!turnId;
  const canSubmit =
    !!feedbackRating ||
    (askCategory && !!feedbackCategory) ||
    !!feedbackText.trim();

  const handleOpenFeedback = () => {
    setFeedbackRating(undefined);
    setFeedbackCategory(undefined);
    setFeedbackText("");
    setFeedbackFileList([]);
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async () => {
    const text = feedbackText.trim();
    if (!threadId || !userId || !canSubmit) {
      return;
    }

    setFeedbackSubmitting(true);
    try {
      const files = feedbackFileList
        .map((f) => f.originFileObj)
        .filter((f): f is RcFile => !!f);
      const imageUrls = files.length
        ? await uploadFeedbackImages(files)
        : undefined;
      await submitBrickchatFeedback({
        threadId,
        turnId,
        userId,
        rating: feedbackRating,
        category: askCategory ? feedbackCategory : "other",
        text: text || undefined,
        imageUrls,
      });
      message.success("Thanks for the feedback!");
      setFeedbackModalOpen(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      message.error("Failed to submit feedback. Please try again.");
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  return (
    <>
      <Tooltip title={turnId ? "Feedback on this answer" : "Give feedback"}>
        <Button
          type="text"
          style={{
            padding: "8px 0",
            height: "auto",
            width: 32,
            lineHeight: 1,
          }}
          icon={
            <DynamicReactIcon
              iconName="MdOutlineFeedback"
              iconSet="md"
              color={COLORS.textColorMedium}
              size={18}
            />
          }
          onClick={handleOpenFeedback}
        />
      </Tooltip>

      <Modal
        open={feedbackModalOpen}
        onCancel={() => {
          if (!feedbackSubmitting) setFeedbackModalOpen(false);
        }}
        footer={null}
        closable
        mask={false}
        title={turnId ? "Rate this answer" : "Rate this conversation"}
        styles={{ content: { padding: 24 } }}
      >
        <Flex vertical gap={12}>
          <Typography.Paragraph
            style={{ color: COLORS.textColorLight, marginBottom: 16, fontSize: FONT_SIZE.HEADING_4 }}
          >
            What&apos;s working well, or what should we fix? Screenshots help
            too.
          </Typography.Paragraph>
          <Flex justify="space-between" gap={4}>
            {FEEDBACK_RATING_OPTIONS.map(({ value, label, icon }) => {
              const selected = feedbackRating === value;
              const color = selected
                ? COLORS.primaryColor
                : COLORS.textColorLight;
              return (
                <Button
                  key={value}
                  type="text"
                  aria-label={label}
                  aria-pressed={selected}
                  onClick={() =>
                    setFeedbackRating(selected ? undefined : value)
                  }
                  disabled={feedbackSubmitting}
                  style={{
                    flex: 1,
                    height: "auto",
                    padding: "8px 4px",
                    border: `1px solid ${selected ? COLORS.primaryColor : "transparent"}`,
                    backgroundColor: selected
                      ? COLORS.bgColorLightBlue
                      : undefined,
                  }}
                >
                  <Flex vertical align="center" gap={4}>
                    <DynamicReactIcon
                      iconName={icon}
                      iconSet="md"
                      size={28}
                      color={color}
                    />
                    <Typography.Text
                      style={{
                        fontSize: FONT_SIZE.SUB_TEXT,
                        color: selected
                          ? COLORS.primaryColor
                          : COLORS.textColorMedium,
                        // antd buttons don't wrap - let a label take two
                        // lines on a narrow screen rather than overflow
                        whiteSpace: "normal",
                        textAlign: "center",
                        lineHeight: 1.2,
                      }}
                    >
                      {label}
                    </Typography.Text>
                  </Flex>
                </Button>
              );
            })}
          </Flex>
          {askCategory ? (
            <Select
              allowClear
              placeholder="What was it about? (optional)"
              options={FEEDBACK_CATEGORY_OPTIONS}
              value={feedbackCategory}
              onChange={(value) => setFeedbackCategory(value)}
              disabled={feedbackSubmitting}
            />
          ) : null}
          <Input.TextArea
            rows={4}
            placeholder="Tell us what happened..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            disabled={feedbackSubmitting}
            style={{ resize: "none" }}
          />
          <Upload
            listType="picture-card"
            fileList={feedbackFileList}
            beforeUpload={() => false}
            onChange={({ fileList }) =>
              setFeedbackFileList(fileList.slice(-MAX_FEEDBACK_IMAGES))
            }
            multiple
            maxCount={MAX_FEEDBACK_IMAGES}
            accept="image/*"
            disabled={feedbackSubmitting}
            style={{height: 100, width: 100}}
          >
            {feedbackFileList.length < MAX_FEEDBACK_IMAGES ? (
              <Flex vertical align="center" gap={2}>
                <DynamicReactIcon
                  iconName="MdOutlineAddPhotoAlternate"
                  iconSet="md"
                  size={20}
                  color={COLORS.textColorMedium}
                />
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.NOTE,
                    color: COLORS.textColorMedium,
                  }}
                >
                  Add screenshots
                </Typography.Text>
              </Flex>
            ) : null}
          </Upload>
          <Flex justify="end" gap={8}>
            <Button
              onClick={() => setFeedbackModalOpen(false)}
              disabled={feedbackSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              loading={feedbackSubmitting}
              disabled={!canSubmit}
              onClick={handleSubmitFeedback}
            >
              Submit
            </Button>
          </Flex>
        </Flex>
      </Modal>
    </>
  );
}
