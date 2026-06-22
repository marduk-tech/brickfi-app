import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { safeStorage } from "../libs/browser-utils";
import { LocalStorageKeys, queryKeys } from "../libs/constants";
import { User } from "../types/User";

const USER_EXPIRY_DURATION = 60 * 1000;

export function useUser() {
  const getUser = async (): Promise<User> => {
    const userItem = safeStorage.getItem(LocalStorageKeys.user);
    let localUserData = userItem ? JSON.parse(userItem) : null;

    if (!localUserData) {
      throw new Error("User not found in local storage");
    }

    // Backwards compatibility
    if (localUserData.mobile) {
      localUserData = { user: localUserData };
      safeStorage.setItem(LocalStorageKeys.user, JSON.stringify(localUserData));
    }

    const isExpired =
      !localUserData.updated ||
      new Date().getTime() - USER_EXPIRY_DURATION >
        new Date(localUserData.updated).getTime();

    if (!isExpired) {
      return localUserData.user;
    }

    const response = await axiosApiInstance.get(
      `/auth/myinfo/${localUserData.user._id}`,
      {},
    );

    if (response?.data?.mobile) {
      safeStorage.setItem(
        LocalStorageKeys.user,
        JSON.stringify({ updated: `${new Date()}`, user: response.data }),
      );
      return response.data;
    }

    throw new Error("Failed to fetch fresh user data");
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [queryKeys.user],
    queryFn: getUser,
    refetchOnWindowFocus: false,
    retry: 2,
    staleTime: USER_EXPIRY_DURATION,
  });

  return {
    user: isLoading ? undefined : data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
