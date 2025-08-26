import { User } from "../../types/User";
import { axiosApiInstance } from "../axios-api-Instance";

export const getUserByMobile = async (mobile: string) => {
  const endpoint = `/user/${mobile}`;
  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data[0] as User;
  });
};
