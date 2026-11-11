"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { env, posthogkey } from "@/libs/constants";
import { useUser } from "@/hooks/use-user";

// only production is tracked - no init (or identify) elsewhere
const enabled = env === "production" && !!posthogkey;

// +<country code><number> - the same form the backend sends conversions with
const toE164 = (countryCode?: string, mobile?: string) => {
  const number = (mobile || "").replace(/\D/g, "");
  if (!number) return undefined;
  const code = (countryCode || "91").replace(/\D/g, "") || "91";
  return number.length > 10 && number.startsWith(code)
    ? `+${number}`
    : `+${code}${number}`;
};

export default function PosthogProvider() {
  const { user } = useUser();

  useEffect(() => {
    if (!enabled || posthog.__loaded) return;
    posthog.init(posthogkey!, {
      api_host: "https://us.i.posthog.com",
      capture_pageview: true,
      person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    });
  }, []);

  // the signed-in user, with the contact details the ad conversions match on
  useEffect(() => {
    if (!enabled || !user?._id) return;
    const name = user.profile?.name?.trim();
    posthog.identify(user._id, {
      countryCode: user.countryCode,
      name: user.profile?.name,
      ...(toE164(user.countryCode, user.mobile)
        ? { phone: toE164(user.countryCode, user.mobile) }
        : {}),
      ...(user.profile?.email ? { email: user.profile.email } : {}),
      ...(name ? { first_name: name.split(/\s+/)[0] } : {}),
    });
  }, [user]);

  return null;
}
