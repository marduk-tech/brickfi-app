import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { safeStorage } from "../libs/browser-utils";
import { LocalStorageKeys, queryKeys } from "../libs/constants";
import { User } from "../types/User";
import { useAuth } from "./use-auth";

export function useUser() {
  const { logout } = useAuth();

  const getUser = async (): Promise<User> => {
    const userItem = safeStorage.getItem(LocalStorageKeys.user);
    const user = userItem ? JSON.parse(userItem) : null;

    if (!user) {
      throw new Error("User not found in local storage");
    }

    // Refresh the user object in the background.
    // TODO: This should be done using an expiry logic.
    axiosApiInstance.get(`/auth/myinfo/${user._id}`, {}).then((data) => {
      if (data && data.data && data.data.mobile) {
        safeStorage.setItem(LocalStorageKeys.user, JSON.stringify(data.data));
      }
    });

    return user;
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [queryKeys.user],
    queryFn: getUser,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // useEffect(() => {
  //   const handleStorageChange = (e: StorageEvent) => {
  //     if (e.key === LocalStorageKeys.user && e.newValue) {
  //       console.log("LocalStorage user changed, refetching...");
  //       refetch();
  //     }
  //   };

  //   window.addEventListener("storage", handleStorageChange);
  //   return () => window.removeEventListener("storage", handleStorageChange);
  // }, [refetch]);

  return { user: data, isLoading, isError, error, refetch };
}
