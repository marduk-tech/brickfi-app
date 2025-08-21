import { useMutation } from "@tanstack/react-query";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { LocalStorageKeys, queryKeys } from "../libs/constants";
import { queryClient } from "../libs/query-client";

export type LoginStatus =
  | "OTP_SENT"
  | "LOGIN_ERROR"
  | "LOGIN_SUCCESS"
  | "EDIT_MOBILE";

export function useAuth() {
  const navigate = useNavigate();

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
      setVerificationId(data.verificationId);
      setLoginStatus("OTP_SENT");
    },
    onError: (error) => {
      setVerificationId(undefined);
      console.log(error.message);
    },
  });

  const login = useMutation({
    mutationFn: ({ code, mobile }: { code: number; mobile: string }) => {
      return axiosApiInstance.post(`/auth/otp/login`, {
        verificationId: verificationId,
        code: code,
        mobile: mobile,
      });
    },

    async onSuccess({ data }) {
      localStorage.setItem(LocalStorageKeys.user, JSON.stringify(data.user));

      await queryClient.invalidateQueries({
        queryKey: [queryKeys.user],
      });

      return setVerificationId(undefined);
    },

    onError: (error) => {
      console.log(error);
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      localStorage.removeItem(LocalStorageKeys.user);

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
