'use client'

import { ErrorFallback } from "./components/error-fallback";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <ErrorFallback
        title="Something went wrong"
        message={error.message || "An unexpected error occurred. Please try again."}
        type="error"
      />
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}