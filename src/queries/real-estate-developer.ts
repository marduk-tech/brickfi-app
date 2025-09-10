import { baseApiUrl } from "@/libs/constants";

export const getDeveloper = async (id: string) => {
  const res = await fetch(`${baseApiUrl}real-estate-developer/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch developer");
  return res.json();
};

export const getRealEstateDevelopersQuery = (developerId: string) => {
  return {
    queryKey: ["real-estate-developer", developerId],
    queryFn: () => getDeveloper(developerId),
  };
};
