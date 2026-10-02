import { MicroPocket } from "../../types/MicroPocket";
import { axiosApiInstance } from "../axios-api-Instance";

export const getAllMicroPockets = async (ids?: string[]) => {
  const endpoint = ids?.length ? `/micro-pockets?ids=${ids.join(",")}` : `/micro-pockets`;
  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data as MicroPocket[];
  });
};
