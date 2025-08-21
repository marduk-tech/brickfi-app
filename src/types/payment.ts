export interface CustomerDetails {
  email: string;
}

export interface PaymentHistoryItem {
  _id: string;
  amount: number;
  status: string;
  timestamp: string;
}

export interface Payment {
  _id: string;
  amountPaid: number;
  status: string;
  paymentAmount: number;
  userId: string;
  paymentLinkId: string;
  referenceId: string;
  customerDetails: CustomerDetails;
  paymentHistory: PaymentHistoryItem[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastPaymentDate: string;
  razorpayStatus: string;
}
