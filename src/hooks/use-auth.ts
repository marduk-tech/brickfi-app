"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { LocalStorageKeys, queryKeys } from "../libs/constants";
import { queryClient } from "../libs/query-client";
import { safeStorage } from "../libs/browser-utils";

export type LoginStatus =
  | "OTP_SENT"
  | "LOGIN_ERROR"
  | "LOGIN_SUCCESS"
  | "EDIT_MOBILE";

export function useAuth() {
  const router = useRouter();

  const [loginStatus, setLoginStatus] = useState<LoginStatus>("EDIT_MOBILE");
  const [verificationId, setVerificationId] = useState<string | undefined>();

  const generateOtp = useMutation({
    mutationFn: ({
      mobile,
      countryCode,
    }: {
      mobile: string;
      countryCode: string;
    }) => {
      return axiosApiInstance.post(`/auth/otp/generate`, {
        mobile: mobile,
        countryCode: countryCode,
      });
    },
    onSuccess: async ({ data }) => {
      if (data.verificationId) {
        setVerificationId(data.verificationId);
        setLoginStatus("OTP_SENT");
      } else {
        console.error("No verification ID received");
        setLoginStatus("LOGIN_ERROR");
      }
    },
    onError: (error) => {
      setVerificationId(undefined);
      setLoginStatus("LOGIN_ERROR");
      console.error("Generate OTP error:", error);
    },
  });

  const login = useMutation({
    mutationFn: ({ code, mobile }: { code: number; mobile: any }) => {
      return axiosApiInstance.post(`/auth/otp/login`, {
        verificationId: verificationId,
        code: code,
        mobile: mobile,
      });
    },

    async onSuccess({ data }) {
      if (data.user) {
        safeStorage.setItem(LocalStorageKeys.user, JSON.stringify(data.user));

        await queryClient.invalidateQueries({
          queryKey: [queryKeys.user],
        });

        setLoginStatus("LOGIN_SUCCESS");
        setVerificationId(undefined);
        return data;
      } else {
        console.error("No user data received");
        setLoginStatus("LOGIN_ERROR");
      }
    },

    onError: (error) => {
      setLoginStatus("LOGIN_ERROR");
      console.error("Login error:", error);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      safeStorage.removeItem(LocalStorageKeys.user);

      await queryClient.removeQueries({
        queryKey: [queryKeys.user],
      });
      return true;
    },

    onError: (error) => {
      console.log(error);
    },
  });

  return {
    login,
    logout,
    generateOtp,
    loginStatus,
    setLoginStatus,
  };
}
