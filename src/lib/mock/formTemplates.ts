import { FormTemplate } from "@/lib/types";

// ---------------------------------------------------------------------------
// Richland OS built-in form library.
// These are the forms clients complete in their portal. A new Firestore
// project is seeded from this list once; after that the coach edits forms in
// Settings → Forms. Template ids are stable — do not rename them.
// ---------------------------------------------------------------------------

const RATING_OPTIONS = [
  { value: "1", label: "1 — Rarely" },
  { value: "2", label: "2 — Sometimes" },
  { value: "3", label: "3 — Often" },
  { value: "4", label: "4 — Usually" },
  { value: "5", label: "5 — Consistently" },
];

const FOCUS_AREA_OPTIONS = [
  { value: "strategy", label: "Strategy & vision" },
  { value: "leadership_team", label: "Building the leadership team" },
  { value: "delegation", label: "Delegation & time" },
  { value: "communication", label: "Communication & influence" },
  { value: "board", label: "Board & investor relationships" },
  { value: "conflict", label: "Conflict & hard conversations" },
  { value: "culture", label: "Culture & engagement" },
  { value: "growth", label: "Scaling / growth" },
  { value: "succession", label: "Succession & transition" },
  { value: "personal", label: "Energy, balance & personal effectiveness" },
];

export function buildFormTemplates(): FormTemplate[] {
  return [
    // -------------------------------------------------------------------
    // 1. Client Intake Questionnaire
    // -------------------------------------------------------------------
    {
      id: "tmpl_participant_screening_form",
      document_type: "participant_screening_form",
      title: "Client Intake Questionnaire",
      description: "Helps us make the most of our first conversation. About 15 minutes.",
      required: true,
      active: true,
      session_types: ["intake_assessment"],
      sections: [
        {
          id: "about_you",
          title: "About You",
          fields: [
            { id: "full_name", type: "short_text", label: "Name", required: true },
            { id: "email", type: "short_text", label: "Email", required: true },
            { id: "title", type: "short_text", label: "Title / role", required: true },
            { id: "company", type: "short_text", label: "Company", required: true },
            { id: "company_size", type: "short_text", label: "Number of employees and annual revenue (approximate)", required: false },
            { id: "time_in_role", type: "short_text", label: "How long have you been in this role?", required: false },
          ],
        },
        {
          id: "context",
          title: "Your Context",
          fields: [
            { id: "reports", type: "long_text", label: "Who reports to you, and who do you report to (board, investors, owners)?", required: false },
            { id: "priorities", type: "long_text", label: "What are the company's top three priorities for the next 12 months?", required: true },
            { id: "challenges", type: "long_text", label: "What are the biggest challenges you are facing right now — in the business and as a leader?", required: true },
          ],
        },
        {
          id: "coaching",
          title: "Coaching",
          fields: [
            { id: "why_now", type: "long_text", label: "Why coaching, and why now?", required: true },
            { id: "focus_areas", type: "multi_select", label: "Which areas would you most like to work on?", options: FOCUS_AREA_OPTIONS, required: false },
            { id: "success", type: "long_text", label: "Twelve months from now, what would make this coaching a clear success?", required: true },
            { id: "prior_coaching", type: "long_text", label: "Have you worked with a coach before? What worked and what didn't?", required: false },
            { id: "assessments_taken", type: "long_text", label: "Have you taken any assessments (DISC, Enneagram, StrengthsFinder, Hogan, 360)? Share results if you have them.", required: false },
            { id: "feedback_style", type: "long_text", label: "How do you like to receive feedback?", required: false },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------
    // 2. Confidentiality & Consent
    // -------------------------------------------------------------------
    {
      id: "tmpl_informed_consent",
      document_type: "informed_consent",
      title: "Confidentiality & Consent",
      description: "How we handle what you share, recordings, and the client portal.",
      required: true,
      active: true,
      session_types: ["intake_assessment"],
      sections: [
        {
          id: "terms",
          title: "Confidentiality",
          body:
            "Everything you share in coaching is confidential. I will not share what we discuss with your company, board, investors, or anyone else without your written permission.\n\n" +
            "Exceptions: if I believe there is a risk of serious harm to you or someone else, or if disclosure is required by law.\n\n" +
            "If your company is paying for coaching, I may share only attendance and the general areas we are working on — never the content of our conversations — unless you agree otherwise.",
          fields: [{ id: "ack_confidentiality", type: "initial", label: "I understand the confidentiality terms", required: true }],
        },
        {
          id: "recording",
          title: "Recording & AI Notes",
          body:
            "With your permission, sessions may be recorded (Zoom, Fathom, or a Plaud recorder) so I can produce an accurate summary and action list. Recordings and summaries are stored securely and used only for your coaching. You can ask me to stop recording or delete a recording at any time.",
          fields: [{ id: "consent_recording", type: "yes_no", label: "I consent to sessions being recorded and summarized", required: true }],
        },
        {
          id: "not_therapy",
          title: "Coaching Is Not Therapy",
          body:
            "Coaching is not therapy, counseling, or medical, legal, or financial advice. If issues come up that are better served by another professional, I will tell you and help you find the right support.",
          fields: [{ id: "ack_not_therapy", type: "initial", label: "I understand coaching is not therapy or professional advice", required: true }],
        },
        {
          id: "signature",
          title: "Signature",
          fields: [{ id: "client_signature", type: "signature", label: "Client Signature", required: true }],
        },
      ],
    },

    // -------------------------------------------------------------------
    // 3. Coaching Engagement Agreement
    // -------------------------------------------------------------------
    {
      id: "tmpl_harm_reduction_services_agreement",
      document_type: "harm_reduction_services_agreement",
      title: "Coaching Engagement Agreement",
      description: "The scope, cadence, and commitments for our work together.",
      required: true,
      active: true,
      session_types: ["intake_assessment"],
      sections: [
        {
          id: "engagement",
          title: "The Engagement",
          body:
            "Richland Advisors will provide executive coaching to the Client for the term below. Coaching sessions are typically 60 minutes, held by Zoom or in person, plus reasonable email and text support between sessions.",
          fields: [
            { id: "client_name", type: "short_text", label: "Client Name", required: true },
            { id: "start_date", type: "short_text", label: "Start date", required: true },
            { id: "term", type: "select", label: "Term", options: [
              { value: "3", label: "3 months" },
              { value: "6", label: "6 months" },
              { value: "12", label: "12 months" },
            ], required: true },
            { id: "cadence", type: "select", label: "Session cadence", options: [
              { value: "weekly", label: "Weekly" },
              { value: "biweekly", label: "Every two weeks" },
              { value: "monthly", label: "Monthly" },
            ], required: true },
          ],
        },
        {
          id: "commitments",
          title: "Mutual Commitments",
          body:
            "Coach commits to: preparing for every session, being direct and honest, keeping your confidence, and holding you to what you say you will do.\n\n" +
            "Client commits to: showing up prepared, completing agreed action items or explaining what got in the way, giving honest feedback on what is and isn't working, and completing short check-ins between sessions.",
          fields: [{ id: "ack_commitments", type: "initial", label: "I agree to these commitments", required: true }],
        },
        {
          id: "signature",
          title: "Signature",
          fields: [{ id: "client_signature", type: "signature", label: "Client Signature", required: true }],
        },
      ],
    },

    // -------------------------------------------------------------------
    // 4. Fees, Scheduling & Cancellation
    // -------------------------------------------------------------------
    {
      id: "tmpl_client_services_agreement",
      document_type: "client_services_agreement",
      title: "Fees, Scheduling & Cancellation",
      description: "Investment, payment terms, and how rescheduling works.",
      required: true,
      active: true,
      session_types: ["intake_assessment"],
      sections: [
        {
          id: "fees",
          title: "Investment",
          // The fee autofills from the client's package value on their record.
          fields: [
            { id: "total_fee", type: "fee", label: "Total Fee", helpText: "Set from this client's package value on their client record.", required: true },
          ],
        },
        {
          id: "terms",
          title: "Terms",
          body:
            "Payment: 50% at signing and 50% at the midpoint of the engagement, unless otherwise agreed in writing.\n\n" +
            "Rescheduling: sessions can be moved with 24 hours' notice. Sessions cancelled with less notice may count as used.\n\n" +
            "Ending early: either party may end the engagement with 30 days' written notice. Fees for sessions already delivered are non-refundable.",
          fields: [{ id: "ack_terms", type: "initial", label: "I agree to these terms", required: true }],
        },
        {
          id: "signature",
          title: "Signature",
          fields: [{ id: "client_signature", type: "signature", label: "Client Signature", required: true }],
        },
      ],
    },

    // -------------------------------------------------------------------
    // 5. Leadership Self-Assessment
    // -------------------------------------------------------------------
    {
      id: "tmpl_leadership_self_assessment",
      document_type: "leadership_self_assessment",
      title: "Leadership Self-Assessment",
      description: "A quick baseline we can revisit at the end of the engagement. About 10 minutes.",
      required: true,
      active: true,
      session_types: ["intake_assessment"],
      sections: [
        {
          id: "ratings",
          title: "How often is this true of you today?",
          fields: [
            { id: "vision", type: "select", label: "I communicate a clear direction my team can repeat back.", options: RATING_OPTIONS, required: true },
            { id: "delegation", type: "select", label: "I delegate outcomes, not just tasks, and don't take them back.", options: RATING_OPTIONS, required: true },
            { id: "feedback", type: "select", label: "I give direct feedback promptly, including when it's uncomfortable.", options: RATING_OPTIONS, required: true },
            { id: "listening", type: "select", label: "I ask questions before giving answers.", options: RATING_OPTIONS, required: true },
            { id: "decisions", type: "select", label: "I make decisions at the right speed and they stay made.", options: RATING_OPTIONS, required: true },
            { id: "priorities", type: "select", label: "My calendar reflects my real priorities.", options: RATING_OPTIONS, required: true },
            { id: "team", type: "select", label: "I have the right people in the right seats.", options: RATING_OPTIONS, required: true },
            { id: "energy", type: "select", label: "I have the energy to do my best work.", options: RATING_OPTIONS, required: true },
          ],
        },
        {
          id: "reflection",
          title: "Reflection",
          fields: [
            { id: "strengths", type: "long_text", label: "What would your team say is your greatest strength?", required: false },
            { id: "blind_spot", type: "long_text", label: "What would they say gets in your way?", required: false },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------
    // 6. Goals & Vision Worksheet
    // -------------------------------------------------------------------
    {
      id: "tmpl_preparation_navigation_plan",
      document_type: "preparation_navigation_plan",
      title: "Goals & Vision Worksheet",
      description: "Complete before our Goals & Agreement session. We'll refine it together.",
      required: true,
      active: true,
      session_types: ["preparation"],
      sections: [
        {
          id: "vision",
          title: "Vision",
          fields: [
            { id: "vision_3yr", type: "long_text", label: "Describe the company — and your role in it — three years from now.", required: true },
            { id: "leader", type: "long_text", label: "What kind of leader do you need to become to get there?", required: true },
          ],
        },
        {
          id: "goals",
          title: "Goals for This Engagement",
          body: "Pick two to four. Make each one specific enough that we'll both know whether it happened.",
          fields: [
            { id: "goal_1", type: "long_text", label: "Goal 1 — and how we'll measure it", required: true },
            { id: "goal_2", type: "long_text", label: "Goal 2 — and how we'll measure it", required: false },
            { id: "goal_3", type: "long_text", label: "Goal 3 — and how we'll measure it", required: false },
            { id: "goal_4", type: "long_text", label: "Goal 4 — and how we'll measure it", required: false },
          ],
        },
        {
          id: "obstacles",
          title: "What Could Get in the Way",
          fields: [
            { id: "obstacles", type: "long_text", label: "What has stopped you from making this progress before?", required: false },
            { id: "stakeholders", type: "long_text", label: "Who else needs to be involved or informed (team, board, family)?", required: false },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------
    // 7. Between-Session Check-In
    // -------------------------------------------------------------------
    {
      id: "tmpl_check_in_12hr_form",
      document_type: "check_in_12hr_form",
      title: "Between-Session Check-In",
      description: "Two minutes before each session so we can start where it matters.",
      required: true,
      active: true,
      session_types: ["coaching"],
      sections: [
        {
          id: "check_in",
          title: "Since our last session",
          fields: [
            { id: "commitments_done", type: "long_text", label: "Which commitments did you complete?", required: true },
            { id: "commitments_open", type: "long_text", label: "Which didn't happen, and what got in the way?", required: false },
            { id: "wins", type: "long_text", label: "A win worth noting", required: false },
            { id: "focus_next", type: "long_text", label: "What do you most want to work on next session?", required: true },
            { id: "energy", type: "select", label: "Energy this week", options: [
              { value: "low", label: "Low" },
              { value: "ok", label: "OK" },
              { value: "good", label: "Good" },
              { value: "great", label: "Great" },
            ], required: false },
          ],
        },
      ],
    },

    // -------------------------------------------------------------------
    // 8. Engagement Review
    // -------------------------------------------------------------------
    {
      id: "tmpl_post_integration_form",
      document_type: "post_integration_form",
      title: "Engagement Review",
      description: "Used at the midpoint and the end of the engagement.",
      required: false,
      active: true,
      session_types: ["coaching"],
      sections: [
        {
          id: "review",
          title: "Looking Back",
          fields: [
            { id: "changed", type: "long_text", label: "What has changed since we started?", required: true },
            { id: "goals_progress", type: "long_text", label: "Progress on each goal — where are you now?", required: true },
            { id: "unresolved", type: "long_text", label: "What still feels unresolved?", required: false },
            { id: "coaching_feedback", type: "long_text", label: "What should I do more of, or less of, as your coach?", required: false },
            { id: "next", type: "long_text", label: "What do you want the next phase to focus on?", required: false },
          ],
        },
      ],
    },
  ];
}
