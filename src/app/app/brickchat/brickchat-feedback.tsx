"use client";

import DynamicReactIcon from "@/components/common/dynamic-react-icon";
import { apiKey, baseApiUrl } from "@/libs/constants";
import { COLORS, FONT_SIZE } from "@/theme/style-constants";
import {
  Button,
  Flex,
  Input,
  Modal,
  Tooltip,
  Typography,
  Upload,
  UploadFile,
  message,
} from "antd";
import { useState } from "react";

// Reuses the existing single-file upload endpoint (upload.route.js) rather
// than a brickchat-specific one - same S3 bucket/webp-conversion pipeline
// every other image upload in the app already goes through.
const uploadFeedbackImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${baseApiUrl}upload/single`, {
    method: "POST",
    headers: { "x-api-key": apiKey || "" },
    body: formData,
  });
  if (!res.ok) throw new Error(`upload/single ${res.status}`);
  const json = await res.json();
  return json?.data?.Location;
};

const submitBrickchatFeedback = async (payload: {
  threadId: string;
  userId: string;
  text: string;
  imageUrl?: string;
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

interface BrickchatFeedbackProps {
  /** Same thread id the "Share chat"/"View in LangSmith" toolbar buttons use - see brickchat-client.tsx. */
  threadId?: string;
  userId?: string;
}

// Self-contained "Give feedback" toolbar button + modal, meant to be dropped
// into brickchat-client's toolbar alongside Share/LangSmith/New chat. Saved
// to the brickchat_feedback collection (see brickchat-feedback.model.js in
// the backend) - a separate, user-initiated note, not brickchat_logger's own
// automatic turn-by-turn logging.
export default function BrickchatFeedback({
  threadId,
  userId,
}: BrickchatFeedbackProps) {
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackFileList, setFeedbackFileList] = useState<UploadFile[]>([]);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  if (!threadId) {
    return null;
  }

  const handleOpenFeedback = () => {
    setFeedbackText("");
    setFeedbackFileList([]);
    setFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async () => {
    const text = feedbackText.trim();
    if (!threadId || !userId || !text) {
      return;
    }

    setFeedbackSubmitting(true);
    try {
      const file = feedbackFileList[0]?.originFileObj;
      const imageUrl = file ? await uploadFeedbackImage(file) : undefined;
      await submitBrickchatFeedback({ threadId, userId, text, imageUrl });
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
      <Tooltip title="Give feedback">
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
        title="Give feedback"
        styles={{ content: { padding: 24 } }}
      >
        <Flex vertical gap={12}>
          <Typography.Paragraph
            style={{ color: COLORS.textColorMedium, marginBottom: 0 }}
          >
            What's working well, or what should we fix? A screenshot helps
            too.
          </Typography.Paragraph>
          <Input.TextArea
            rows={4}
            placeholder="Tell us what happened..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            disabled={feedbackSubmitting}
          />
          <Upload
            listType="picture-card"
            fileList={feedbackFileList}
            beforeUpload={() => false}
            onChange={({ fileList }) =>
              setFeedbackFileList(fileList.slice(-1))
            }
            onRemove={() => setFeedbackFileList([])}
            maxCount={1}
            accept="image/*"
            disabled={feedbackSubmitting}
          >
            {feedbackFileList.length === 0 ? (
              <Flex vertical align="center" gap={2}>
                <DynamicReactIcon
                  iconName="MdOutlineAddPhotoAlternate"
                  iconSet="md"
                  size={20}
                  color={COLORS.textColorMedium}
                />
                <Typography.Text
                  style={{
                    fontSize: FONT_SIZE.SUB_TEXT,
                    color: COLORS.textColorMedium,
                  }}
                >
                  Add screenshot
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
              disabled={!feedbackText.trim()}
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
