import ExpertHelpFlow from "./expert-help-flow";
import HomeLoanFlow from "./home-loan-flow";
import LegalConsultationFlow from "./legal-consultation-flow";
import ScheduleVisitCallbackFlow from "./schedule-visit-callback-flow";
import type { OfferingFlowProps } from "./types";

// flowKey (set per CTA on the offering, in the admin app) -> its form. A
// CTA whose flowKey isn't listed here has no button (see
// OfferingCtaButtons), so an offering added before its flow is built never
// shows a dead button.
export const OFFERING_FLOWS: Record<string, React.FC<OfferingFlowProps>> = {
  "free-legal-consulation": LegalConsultationFlow,
  "schedule-visit-callback": ScheduleVisitCallbackFlow,
  "brkfi-expert": ExpertHelpFlow,
  "home-loan-offers": HomeLoanFlow,
};
