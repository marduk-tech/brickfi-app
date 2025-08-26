import { Locality } from "../../types/Locality";
import { axiosApiInstance } from "../axios-api-Instance";

export const getAllLocalities = async () => {
  const endpoint = `/locality`;
  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data as Locality[];
  });
};

export const getLocalityById = async (id: string) => {
  const endpoint = `/locality/${id}`;
  return axiosApiInstance.get(endpoint).then((response) => {
    return response.data as Locality;
  });
};

export const updateLocality = async (
  id: string,
  corridorData: Partial<Locality>
) => {
  const endpoint = `/locality/${id}`;
  return axiosApiInstance.put(endpoint, corridorData).then((response) => {
    return response.data as Locality;
  });
};

export const createLocality = async (corridorData: Partial<Locality>) => {
  const endpoint = `/locality`;
  return axiosApiInstance.post(endpoint, corridorData).then((response) => {
    return response.data as Locality;
  });
};

export const deleteLocality = async (id: string) => {
  const endpoint = `/locality/${id}`;
  return axiosApiInstance.delete(endpoint).then((response) => {
    return response.data;
  });
};
