import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { safeStorage } from "../libs/browser-utils";
import { LocalStorageKeys, queryKeys } from "../libs/constants";
import { User } from "../types/User";

const USER_EXPIRY_DURATION = 24 * 60 * 60 * 1000;

export function useUser() {
  const getUser = async (): Promise<User> => {
    const userItem = safeStorage.getItem(LocalStorageKeys.user);
    let localUserData = userItem ? JSON.parse(userItem) : null;

    if (!localUserData) {
      throw new Error("User not found in local storage");
    }

    // Backwards compatibility
    if (localUserData && localUserData.mobile) {
      localUserData = { user: localUserData };
      safeStorage.setItem(
        LocalStorageKeys.user,
        JSON.stringify(localUserData),
      );
    }

    // Refresh stale user data after 1 day
    const isExpired =
      localUserData &&
      (!localUserData.updated ||
        new Date().getTime() - USER_EXPIRY_DURATION >
          new Date(localUserData.updated).getTime());

    if (isExpired) {
      try {
        const data = await axiosApiInstance.get(
          `/auth/myinfo/${localUserData.user._id}`,
          {},
        );

        if (data?.data?.mobile) {
          safeStorage.setItem(
            LocalStorageKeys.user,
            JSON.stringify({ updated: `${new Date()}`, user: data.data }),
          );
          return data.data;
        }
      } catch (error) {
        console.error("Failed to refresh user info:", error);
      }
    }

    axiosApiInstance
      .get(`/auth/myinfo/${localUserData.user._id}`, {})
      .then((data) => {
        if (data && data.data && data.data.mobile) {
          safeStorage.setItem(
            LocalStorageKeys.user,
            JSON.stringify({ updated: `${new Date()}`, user: data.data }),
          );
        }
      });

    return localUserData.user;
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
