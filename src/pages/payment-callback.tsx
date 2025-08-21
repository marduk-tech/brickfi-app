import { Result, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFetchPaymentByPaymentLinkId } from "../hooks/payment-hooks";

export function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  const status = searchParams.get("razorpay_payment_link_status");
  const paymentLinkId = searchParams.get("razorpay_payment_link_id");

  const { data: payment, isLoading } = useFetchPaymentByPaymentLinkId(
    paymentLinkId as string
  );

  useEffect(() => {
    if (
      status === "paid" &&
      payment?.status === "completed" &&
      payment.paymentAmount === payment.amountPaid
    ) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(timer);
            navigate("/");
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, payment, navigate]);

  if (isLoading || !payment) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          icon={<Spin size="large" />}
          title="Verifying your payment..."
          subTitle="Please wait while we confirm your transaction"
        />
      </div>
    );
  }

  if (
    status === "paid" &&
    payment.status === "completed" &&
    payment.paymentAmount === payment.amountPaid
  ) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Result
          status="success"
          title="Payment Successful!"
          subTitle={`Redirecting you to homepage in ${countdown} seconds...`}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Result
        status="error"
        title="Payment Failed"
        subTitle="Please try again or contact support if the issue persists"
      />
    </div>
  );
}
