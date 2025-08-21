import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

//Layouts
import { DashboardLayout } from "../layouts/dashboard-layout";

import { ProfilePage } from "../pages/profile-page";
import { SignUpForm } from "../pages/signup";
import UserSessions from "../pages/user-sessions";

import { Capacitor } from "@capacitor/core";
import posthog from "posthog-js";
import { useEffect } from "react";
import LivProjectPro from "../components/liv-project-pro";
import { useUser } from "../hooks/use-user";
import { posthogkey } from "../libs/constants";
import { Brick360Full } from "../pages/brick360-full";
import BrickfiHome from "../pages/brickfi-home";
import { AboutUs } from "../pages/landing/about-us";
import { MainLanding } from "../pages/landing/main-landing";
import { PaymentCallbackPage } from "../pages/payment-callback";
import { FourOFour } from "../pages/landing/404";
import { BrickAssistLanding } from "../pages/landing/brick-assist-landing";
import { NewReportRequestFormV2 } from "../components/common/new-report-request-form-v2";
import { LivIndexFull } from "../components/map-view/map-old/liv-index-all/livindex-full";
import { MetroMapperPage } from "../pages/metro-mapper";

export const Router = () => {
  const { user, isLoading: userLoading } = useUser();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && user._id && !window.location.href.includes("localhost")) {
      console.log(user);
      posthog.init(posthogkey, {
        api_host: "https://us.i.posthog.com",
        person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
      });

      posthog.identify(user._id, {
        countryCode: user.countryCode,
      });
    }
  }, [user]);

  useEffect(() => {
    const isNative = Capacitor.isNativePlatform();
    if (isNative && location.pathname === "/") {
      navigate("/app", { replace: true });
    }
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<MainLanding />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route
        path="/brickassist"
        element={<BrickAssistLanding></BrickAssistLanding>}
      ></Route>
      <Route
        path="/requestreport"
        element={<NewReportRequestFormV2></NewReportRequestFormV2>}
      ></Route>
      <Route element={<DashboardLayout />}>
        <Route path="/app/map-view-345" element={<LivIndexFull />} />
        <Route path="/app/metro-mapper" element={<MetroMapperPage />} />
        <Route path="/app/:collectionId?" element={<BrickfiHome />} />
        <Route path="/app/profile" element={<ProfilePage />} />

        <Route path="/pro/:projectId?" element={<LivProjectPro />} />
        <Route
          path="/app/brick360/:lvnzyProjectId?"
          element={<BrickfiHome />}
        />
        <Route
          path="/app/brick360-full/:lvnzyProjectId?"
          element={<Brick360Full />}
        />
        <Route path="/app/user-sessions" element={<UserSessions />} />
      </Route>

      <Route path="/app/payments/callback" element={<PaymentCallbackPage />} />

      <Route path="/*" element={<FourOFour></FourOFour>} />
      <Route path="/app/sign-up" element={<SignUpForm />} />
    </Routes>
  );
};
