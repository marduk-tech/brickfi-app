import { useMutation } from "@tanstack/react-query";
import { notification } from "antd";
import { AxiosError } from "axios";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { queryClient } from "../libs/query-client";
import { User } from "../types/User";

export function useUpdateUserMutation({ userId }: { userId: string }) {
  return useMutation({
    mutationFn: async ({ userData }: { userData: Partial<User> }) => {
      const endpoint = `/user/${userId}`;

      return await axiosApiInstance
        .post(endpoint, userData)
        .then((response) => {
          return response.data as User;
        });
    },

    onSuccess: () => {
      console.log("user details saved successfully");
    },

    onError: (error: AxiosError<any>) => {
      notification.error({
        message: `An unexpected error occurred. Please try again later.`,
      });

      console.log(error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.user],
      });
    },
  });
}

export function useCreateUserMutation({
  enableToasts = false,
}: {
  enableToasts?: boolean;
}) {
  return useMutation({
    mutationFn: async ({ userData }: { userData: Partial<User> }) => {
      const endpoint = `/user`;

      return await axiosApiInstance
        .post(endpoint, userData)
        .then((response) => {
          return response.data as User;
        });
    },

    onSuccess: async () => {
      if (enableToasts) {
        notification.success({
          message: `User created successfully!`,
        });
      }
    },

    onError: (error: AxiosError<any>) => {
      // notification.error({
      //   message: `An unexpected error occurred. Please try again later.`,
      // });

      console.log(error);
    },
  });
}

export function useSendUserMailMutation() {
  return useMutation({
    mutationFn: async ({
      userId,
      emailType,
      params,
    }: {
      userId: string;
      emailType: string;
      params?: any;
    }) => {
      const endpoint = `/user/${userId}/send-mail`;

      return await axiosApiInstance
        .post(endpoint, { emailType, params })
        .then((response) => {
          return response.data;
        });
    },

    onSuccess: () => {},

    onError: (error: AxiosError<any>) => {
      notification.error({
        message: `An unexpected error occurred. Please try again later.`,
      });

      console.log(error);
    },
  });
}
