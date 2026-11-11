"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { env, posthogkey } from "@/libs/constants";
import { useUser } from "@/hooks/use-user";

export default function PosthogProvider() {
  const { user } = useUser();

  useEffect(() => {
    // only production is tracked - no init (or identify) elsewhere
    if (env !== "production") return;
    if (posthogkey) {
      console.log(user);
      posthog.init(posthogkey, {
        api_host: "https://us.i.posthog.com",
        capture_pageview: true,
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      });

      if (user && user._id) {
        posthog.identify(user._id, {
          countryCode: user.countryCode,
          name: user.profile.name
        });
      }
    }
  }, [user]);

  return null;
}
