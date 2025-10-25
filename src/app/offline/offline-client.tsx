"use client";

import Link from "next/link";
import Image from "next/image";

export default function OfflineClient() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div style={{ maxWidth: "500px" }}>
        <Image
          src="/images/brickfi-logo.png"
          alt="Brickfi Logo"
          width={200}
          height={60}
          priority
          style={{ marginBottom: "2rem" }}
        />

        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#2E3E4E",
          }}
        >
          You&apos;re Offline
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            marginBottom: "2rem",
            color: "#666",
            lineHeight: "1.6",
          }}
        >
          It looks like you&apos;ve lost your internet connection. Please check
          your network and try again.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#fff",
              backgroundColor: "#2E3E4E",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1a252f";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2E3E4E";
            }}
          >
            Try Again
          </button>

          <Link
            href="/"
            style={{
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#2E3E4E",
              backgroundColor: "#fff",
              border: "2px solid #2E3E4E",
              borderRadius: "8px",
              textDecoration: "none",
              transition: "all 0.3s",
              display: "inline-block",
            }}
          >
            Go Home
          </Link>
        </div>

        <div
          style={{
            marginTop: "3rem",
            padding: "1.5rem",
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#2E3E4E",
            }}
          >
            While you&apos;re offline
          </h2>
          <p style={{ fontSize: "0.9rem", color: "#666", margin: 0 }}>
            Some features may be limited, but you can still browse cached pages
            and content you&apos;ve previously viewed.
          </p>
        </div>
      </div>
    </div>
  );
}
