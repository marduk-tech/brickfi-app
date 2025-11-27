import { FeedbackForm } from "@/components/common/feedback-form";
import { Metadata } from "next";

const META_DESCR = "Share your feedback about Brickfi and help us improve our services. We value your input and suggestions.";
const META_TITLE = "Brickfi | Feedback";

export const metadata: Metadata = {
    title: META_TITLE,
    description: META_DESCR,
    keywords: [
        "feedback",
        "brickfi",
        "real estate",
        "customer feedback",
        "suggestions",
    ],
    authors: [{ name: "Brickfi" }],
    creator: "Brickfi",
    publisher: "Brickfi",
    formatDetection: {
        telephone: false,
    },
    metadataBase: new URL("https://brickfi.in"),
    alternates: {
        canonical: "/feedback",
    },
    openGraph: {
        title: META_TITLE,
        description: META_DESCR,
        url: "https://brickfi.in/feedback",
        siteName: "Brickfi",
        locale: "en_IN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: META_TITLE,
        description: META_DESCR,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function FeedbackPage() {
    return <FeedbackForm />;
}
