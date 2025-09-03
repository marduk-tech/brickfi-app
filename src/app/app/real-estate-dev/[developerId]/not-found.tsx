import Link from "next/link";
import { Result, Button } from "antd";


export default function NotFound() {
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      minHeight: "50vh",
      padding: "24px"
    }}>
      <Result
        status="404"
        title="Real Estate Developer Not Found"
        subTitle="The real estate developer you are looking for could not be found. It may have been moved or does not exist."
        extra={
          <Link href="/app">
            <Button type="primary" size="large">
              Back to Home
            </Button>
          </Link>
        }
      />
    </div>
  );
}