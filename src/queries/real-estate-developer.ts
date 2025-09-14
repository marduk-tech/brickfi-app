import { baseApiUrl } from "@/libs/constants";
import { CustomError } from "@/libs/error-handler";

export const getDeveloper = async (id: string) => {
  const res = await fetch(`${baseApiUrl}real-estate-developer/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    throw new CustomError({
      status: 404,
      title: "Real Estate Developer Not Found",
      description: "The requested real estate developer could not be found.",
    });
  }

  if (res.status === 500) {
    throw new CustomError({
      status: 500,
      title: "Invalid Developer ID",
      description: "The provided developer ID is invalid.",
    });
  }

  if (!res.ok) {
    throw new CustomError({
      status: res.status,
      title: "Something went wrong",
      description: "An unexpected error occurred.",
    });
  }

  return res.json();
};

export const getRealEstateDevelopersQuery = (developerId: string) => {
  return {
    queryKey: ["real-estate-developer", developerId],
    queryFn: () => getDeveloper(developerId),
    throwOnError: true,
  };
};
