import { ErrorFallback } from "./components/error-fallback";

export default function NotFound() {
  return (
    <ErrorFallback
      title="Developer Not Found"
      message="The developer you're looking for doesn't exist or has been removed."
      type="warning"
    />
  );
}