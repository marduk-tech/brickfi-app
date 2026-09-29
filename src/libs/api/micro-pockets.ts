import { MicroPocket } from "../../types/MicroPocket";
import { axiosApiInstance } from "../axios-api-Instance";

export const getAllMicroPockets = async () => {
  const endpoint = `/micro-pockets`;
  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data as MicroPocket[];
  });
};
