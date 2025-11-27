import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import { AxiosError } from "axios";
import { axiosApiInstance } from "../libs/axios-api-Instance";

interface FeedbackQuestion {
  question: string;
  answer: string;
}

interface FeedbackContact {
  name: string;
  contact: string;
}

interface FeedbackData {
  feedback: FeedbackQuestion[];
  contact: FeedbackContact;
}

export function useSubmitFeedbackMutation({
  enableToasts = true,
}: {
  enableToasts?: boolean;
} = {}) {
  return useMutation({
    mutationFn: async ({ feedbackData }: { feedbackData: FeedbackData }) => {
      const endpoint = `/marketing/feedback`;

      return await axiosApiInstance
        .post(endpoint, feedbackData)
        .then((response) => {
          return response.data;
        });
    },

    onSuccess: () => {
      if (enableToasts) {
        notification.success({
          message: `Thank you for submitting the feedback`,
        });
      }
    },

    onError: (error: AxiosError<any>) => {
      if (enableToasts) {
        notification.error({
          message:
            error.response?.data?.message ||
            `An unexpected error occurred. Please try again later.`,
        });
      }

      console.log(error);
    },
  });
}
