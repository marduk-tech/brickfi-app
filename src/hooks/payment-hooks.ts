import { useQuery } from "@tanstack/react-query";
import { axiosApiInstance } from "../libs/axios-api-Instance";
import { queryKeys } from "../libs/constants";
import { Payment } from "../types/payment";

export const useFetchPaymentByPaymentLinkId = (paymentLinkId: string) => {
  return useQuery<Payment, Error>({
    queryKey: [queryKeys.paymentById, paymentLinkId],
    queryFn: async () => {
      const { data } = await axiosApiInstance.get(`/payments/${paymentLinkId}`);
      return data as Payment;
    },
    enabled: !!paymentLinkId,
  });
};
