import {
  AiSummary,
  CheckIn,
  Client,
  ClientDocument,
  ClientMemoryItem,
  DocumentType,
  GrowthActionPlan,
  JourneyMilestone,
  Message,
  Payment,
  PortalAssignment,
  PostIntegrationForm,
  PreparationPlan,
  Profile,
  Prospect,
  ReferralSource,
  Session,
  SessionNote,
  Task,
  Transcript,
  MILESTONE_TEMPLATE,
} from "@/lib/types";

// Use a global to survive Next.js dev-server hot reload of this module — the
// same trick store.ts uses for the store singleton. Without this, editing any
// file during dev resets this counter to 1 while the (persisted) store still
// has client_0001..client_0005 in it, so the very next "new" record collides
// with an existing one and you end up looking at someone else's record.
//
// Seed IDs must remain stable across server restarts. A random per-process salt
// made every bookmarked client/session URL turn into a 404 after each restart.
// The counter is already kept on globalThis for hot reload safety; a fixed demo
// namespace keeps the generated seed graph deterministic in every worker.
const DEMO_ID_NAMESPACE = "demo";
const globalForId = globalThis as unknown as { __richlandIdCounter?: number };
if (globalForId.__richlandIdCounter === undefined) {
  globalForId.__richlandIdCounter = 1;
}
export function nextId(prefix: string) {
  const n = globalForId.__richlandIdCounter!++;
  return `${prefix}_${DEMO_ID_NAMESPACE}${n.toString().padStart(4, "0")}`;
}

// Anchor the demo timeline when the in-memory store is created instead of to
// a calendar date that inevitably goes stale. A fresh demo server therefore
// always starts with the same believable mix of recent and upcoming activity.
const now = new Date();
function daysAgo(n: number) {
  return new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();
}
function daysFromNow(n: number) {
  return new Date(now.getTime() + n * 24 * 60 * 60 * 1000).toISOString();
}
function hoursAgo(n: number) {
  return new Date(now.getTime() - n * 60 * 60 * 1000).toISOString();
}
function hoursFromNow(n: number) {
  return new Date(now.getTime() + n * 60 * 60 * 1000).toISOString();
}

export const PRACTITIONER: Profile = {
  id: "prac_001",
  role: "practitioner",
  full_name: "Ladd Richland",
  email: "ladd.richland@gmail.com",
  practice_name: "Richland Advisors",
  title: "Executive & CEO Coach",
};

export const REFERRAL_SOURCES: ReferralSource[] = [
  { id: "ref_001", practitioner_id: PRACTITIONER.id, name: "Client Referral", category: "Returning / Referral" },
  { id: "ref_002", practitioner_id: PRACTITIONER.id, name: "Vistage / CEO Peer Group", category: "Community" },
  { id: "ref_003", practitioner_id: PRACTITIONER.id, name: "LinkedIn", category: "Web" },
  { id: "ref_004", practitioner_id: PRACTITIONER.id, name: "Board / Investor Introduction", category: "Returning / Referral" },
];

function milestonesFor(clientId: string, completedKeys: string[]): JourneyMilestone[] {
  return MILESTONE_TEMPLATE.map((m) => ({
    id: nextId("ms"),
    client_id: clientId,
    milestone_key: m.key,
    label: m.label,
    sort_order: m.sort_order,
    completed: completedKeys.includes(m.key),
    completed_at: completedKeys.includes(m.key) ? daysAgo(MILESTONE_TEMPLATE.length - m.sort_order + 1) : undefined,
  }));
}

function docSet(
  clientId: string,
  overrides: Partial<Record<DocumentType, ClientDocument["status"]>>
): ClientDocument[] {
  const base: { type: DocumentType; required: boolean }[] = [
    { type: "participant_screening_form", required: true },
    { type: "informed_consent", required: true },
    { type: "harm_reduction_services_agreement", required: true },
    { type: "client_services_agreement", required: true },
    { type: "preparation_navigation_plan", required: true },
    { type: "post_integration_form", required: false },
    { type: "session_notes", required: false },
    { type: "journey_brief", required: false },
    { type: "growth_action_plan", required: false },
  ];
  const docs = base.map(({ type, required }) => {
    const legacyIntegrationStatus = type === "integration_session_1"
      ? overrides.post_integration_form
      : type === "integration_session_2"
        ? overrides.post_integration_form_updated
        : undefined;
    const inferredCompletedStatus =
      legacyIntegrationStatus && legacyIntegrationStatus !== "missing"
        ? "reviewed"
        : type === "preparation_education_session" && overrides.preparation_navigation_plan && overrides.preparation_navigation_plan !== "missing"
          ? "reviewed"
          : type === "participant_screening_form" && overrides.harm_reduction_services_agreement === "signed"
            ? "reviewed"
            : undefined;
    const status = overrides[type] ?? inferredCompletedStatus ?? "missing";
    const versions =
      status === "missing"
        ? []
        : [
            {
              id: nextId("docv"),
              document_id: "",
              version_number: 1,
              file_url: `/mock-files/${clientId}/${type}-v1.pdf`,
              file_name: `${type}-v1.pdf`,
              file_size_bytes: 245000,
              mime_type: "application/pdf",
              uploaded_by_role: "practitioner" as const,
              created_at: daysAgo(20),
            },
          ];
    const docId = nextId("doc");
    versions.forEach((v) => (v.document_id = docId));
    return {
      id: docId,
      client_id: clientId,
      document_type: type,
      title: type,
      required,
      status,
      versions,
      current_version_id: versions[0]?.id,
    };
  });
  // Check-In form, only for clients whose check-in is done. Uses fixed
  // ids (not nextId) so adding it doesn't shift every later demo id — bookmarked
  // client/session URLs stay valid.
  const checkInStatus = overrides.check_in_12hr_form;
  if (checkInStatus && checkInStatus !== "missing") {
    const docId = `doc_${clientId}_check_in_12hr`;
    docs.push({
      id: docId,
      client_id: clientId,
      document_type: "check_in_12hr_form",
      title: "check_in_12hr_form",
      required: true,
      status: checkInStatus,
      versions: [
        {
          id: `${docId}_v1`,
          document_id: docId,
          version_number: 1,
          file_url: `/mock-files/${clientId}/check_in_12hr_form-v1.pdf`,
          file_name: "check_in_12hr_form-v1.pdf",
          file_size_bytes: 120000,
          mime_type: "application/pdf",
          uploaded_by_role: "practitioner" as const,
          created_at: daysAgo(4),
        },
      ],
      current_version_id: `${docId}_v1`,
    });
  }
  return docs;
}

// Demo prospects so the Prospects pipeline isn't empty in the demo.
export function buildDemoProspects(): Prospect[] {
  const base = { practitioner_id: PRACTITIONER.id };
  return [
    {
      ...base,
      id: nextId("prospect"),
      full_name: "Jordan Ellis",
      email: "jordan.ellis@example.com",
      phone: "(720) 555-0142",
      referral_source: "Client Referral",
      status: "new",
      notes: "Founder of a 40-person logistics startup. Referred by Sarah Klein. Just raised a Series A and feels stretched thin.",
      created_at: daysAgo(1),
      updated_at: daysAgo(1),
    },
    {
      ...base,
      id: nextId("prospect"),
      full_name: "Alana Brooks",
      email: "alana.brooks@example.com",
      phone: "(303) 555-0177",
      referral_source: "Vistage / CEO Peer Group",
      status: "intro_complete",
      notes: "CEO of a regional healthcare group, newly promoted from COO. Intro call done — wants help with board relationships. Send proposal and engagement agreement.",
      intro_call_at: daysAgo(2),
      created_at: daysAgo(4),
      updated_at: daysAgo(2),
    },
    {
      ...base,
      id: nextId("prospect"),
      full_name: "Tom Reyes",
      email: "tom.reyes@example.com",
      referral_source: "LinkedIn",
      status: "considering",
      notes: "Second-generation owner of a family distribution business. Weighing coaching against a COO hire. Follow up next week.",
      intro_call_at: daysAgo(6),
      created_at: daysAgo(9),
      updated_at: daysAgo(6),
    },
  ];
}

export interface SeedBundle {
  client: Client;
  milestones: JourneyMilestone[];
  documents: ClientDocument[];
  sessions: Session[];
  transcripts: Transcript[];
  aiSummaries: AiSummary[];
  memory: ClientMemoryItem[];
  sessionNotes: SessionNote[];
  preparationPlan?: PreparationPlan;
  checkIns: CheckIn[];
  postIntegrationForms: PostIntegrationForm[];
  growthActionPlan?: GrowthActionPlan;
  tasks: Task[];
  messages: Message[];
  portalAssignments: PortalAssignment[];
  payments: Payment[];
}

function client(
  partial: Pick<Client, "full_name" | "email" | "phone" | "status" | "current_phase"> &
    Partial<Client>
): Client {
  const id = partial.id ?? nextId("client");
  return {
    id,
    practitioner_id: PRACTITIONER.id,
    portal_user_id: `${id}_portal`,
    date_of_birth: "1978-04-12",
    address: "Denver, CO",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    referral_source_id: REFERRAL_SOURCES[0].id,
    notes: "",
    package_name: "Executive Coaching — 6 Months",
    package_value: 12000,
    amount_paid: 6000,
    created_at: daysAgo(40),
    updated_at: daysAgo(1),
    ...partial,
  };
}

function coachingSession(
  clientId: string,
  scheduledAt: string,
  status: Session["status"],
  location = "Zoom",
): Session {
  return {
    id: nextId("sess"),
    client_id: clientId,
    practitioner_id: PRACTITIONER.id,
    session_type: "coaching",
    scheduled_at: scheduledAt,
    duration_minutes: 60,
    status,
    location,
  };
}

function callSummary(clientId: string, session: Session, summary: string, actionItems: string): AiSummary {
  return {
    id: nextId("ai"),
    client_id: clientId,
    session_id: session.id,
    summary_type: "session_call_summary",
    title: "Session Summary",
    content: { summary, action_items: actionItems },
    model: "demo",
    created_at: session.scheduled_at ?? now.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// CLIENT 1 — Maya Chen — new client, intake call scheduled
// ---------------------------------------------------------------------------
function buildMaya(): SeedBundle {
  const c = client({
    full_name: "Maya Chen",
    email: "maya.chen@example.com",
    phone: "(415) 555-0102",
    status: "intake_scheduled",
    current_phase: "intake",
    referral_source_id: REFERRAL_SOURCES[3].id,
    notes: "CEO, Brightline Health (Series A SaaS, 55 people). Introduced by her lead investor.",
    amount_paid: 3000,
    created_at: daysAgo(5),
  });
  return {
    client: c,
    milestones: milestonesFor(c.id, []),
    documents: docSet(c.id, {
      informed_consent: "signed",
      client_services_agreement: "signed",
    }),
    sessions: [
      {
        id: nextId("sess"),
        client_id: c.id,
        practitioner_id: PRACTITIONER.id,
        session_type: "intake_assessment",
        scheduled_at: daysFromNow(2),
        duration_minutes: 90,
        status: "scheduled",
        location: "Zoom",
      },
    ],
    transcripts: [],
    aiSummaries: [],
    memory: [],
    sessionNotes: [],
    checkIns: [],
    postIntegrationForms: [],
    tasks: [
      { id: nextId("task"), client_id: c.id, practitioner_id: PRACTITIONER.id, title: "Complete Client Intake Questionnaire", task_type: "form", due_at: daysFromNow(1), status: "pending", assigned_to: "client" },
      { id: nextId("task"), client_id: c.id, practitioner_id: PRACTITIONER.id, title: "Complete DISC assessment", task_type: "form", due_at: daysFromNow(1), status: "pending", assigned_to: "client" },
    ],
    messages: [
      { id: nextId("msg"), client_id: c.id, sender: "client", body: "Signed the agreement. Looking forward to Thursday — I'll have the questionnaire done before then.", created_at: daysAgo(1) },
      { id: nextId("msg"), client_id: c.id, sender: "practitioner", body: "Got it, Maya. The DISC link is in your portal too — about 15 minutes. See you Thursday at 10.", created_at: hoursAgo(20) },
    ],
    portalAssignments: [
      { id: nextId("pa"), client_id: c.id, assignment_type: "form", title: "Client Intake Questionnaire", status: "pending", due_at: daysFromNow(1) },
      { id: nextId("pa"), client_id: c.id, assignment_type: "form", title: "DISC Assessment", status: "pending", due_at: daysFromNow(1) },
    ],
    payments: [{ id: nextId("pay"), client_id: c.id, amount: 3000, paid_at: daysAgo(5).slice(0, 10), method: "Bank Transfer" }],
  };
}

// ---------------------------------------------------------------------------
// CLIENT 2 — Daniel Ortiz — intake done, setting goals & agreement
// ---------------------------------------------------------------------------
function buildDaniel(): SeedBundle {
  const c = client({
    full_name: "Daniel Ortiz",
    email: "daniel.ortiz@example.com",
    phone: "(312) 555-0188",
    status: "preparation",
    current_phase: "preparation",
    referral_source_id: REFERRAL_SOURCES[1].id,
    notes: "Founder & CEO, Ortiz Build Co. (commercial construction, 120 employees).",
    created_at: daysAgo(25),
  });

  const intakeSummary: AiSummary = {
    id: nextId("ai"),
    client_id: c.id,
    summary_type: "client_assessment_summary",
    title: "Client Intake Summary",
    content: {
      client_goals: "Step out of day-to-day project management so he can lead the business; build a leadership team he trusts; get home for dinner three nights a week.",
      role_and_context: "Founder & CEO of Ortiz Build Co., grown from 8 to 120 people in six years. Three project directors report to him; no COO. Wife (Elena) runs finance part-time.",
      current_challenges: "Every major decision routes through him. Two project directors are clashing over resources. He is the bottleneck on bids and knows it.",
      leadership_strengths: "Strong client relationships, high integrity, decisive under pressure. DISC: high D / high I.",
      development_areas: "Delegation, letting others make mistakes, giving direct feedback without taking over. DISC flags impatience with slower, process-driven people.",
      assessment_insights: "DISC (D/I) explains both his speed and why his more methodical project director (Luis) feels steamrolled.",
      watch_outs: "Says he wants to delegate but measures his own worth by being the one who saves the day.",
      follow_up_recommendations: "Send goals worksheet; in the Goals & Agreement session, define what 'out of the weeds' looks like in measurable terms.",
    },
    model: "demo",
    created_at: daysAgo(20),
  };

  const goalsPlan: PreparationPlan = {
    id: nextId("prep"),
    client_id: c.id,
    intentions: "1. Hire or promote an operations lead within 90 days.\n2. Stop approving bids under $250k.\n3. Resolve the conflict between Luis and Kara.",
    desired_outcomes: "Bids under $250k go out without me. Weekly leadership meeting runs on an agenda I didn't write. Home for dinner 3 nights a week.",
    fears: "Quality slips. Clients notice I'm less available.",
    support_systems: "Elena (wife, finance). Vistage group meets monthly.",
    updated_at: daysAgo(6),
  };

  return {
    client: c,
    milestones: milestonesFor(c.id, ["intake_complete"]),
    documents: docSet(c.id, {
      participant_screening_form: "reviewed",
      informed_consent: "signed",
      harm_reduction_services_agreement: "uploaded",
      client_services_agreement: "signed",
      preparation_navigation_plan: "uploaded",
    }),
    sessions: [
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "intake_assessment", scheduled_at: daysAgo(20), duration_minutes: 90, status: "completed", location: "Zoom" },
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "preparation", scheduled_at: daysFromNow(3), duration_minutes: 90, status: "scheduled", location: "Ortiz Build Co. office" },
    ],
    transcripts: [
      { id: nextId("tr"), client_id: c.id, source: "paste", raw_text: "[Intake call — Daniel describes growing the company, the bid bottleneck, and the tension between Luis and Kara...]", created_at: daysAgo(20) },
    ],
    aiSummaries: [intakeSummary],
    memory: [
      { id: nextId("mem"), client_id: c.id, item_type: "intention", content: "Get out of day-to-day project management and lead the business.", phase: "intake", status: "carried_forward", created_at: daysAgo(20) },
      { id: nextId("mem"), client_id: c.id, item_type: "theme", content: "Measures his value by being the one who saves the day.", phase: "intake", status: "open", created_at: daysAgo(20) },
      { id: nextId("mem"), client_id: c.id, item_type: "challenge", content: "Conflict between project directors Luis and Kara over crews and equipment.", phase: "intake", status: "open", created_at: daysAgo(20) },
    ],
    sessionNotes: [],
    preparationPlan: goalsPlan,
    checkIns: [],
    postIntegrationForms: [],
    tasks: [
      { id: nextId("task"), client_id: c.id, practitioner_id: PRACTITIONER.id, title: "Send coaching engagement agreement for signature", task_type: "follow_up", due_at: daysFromNow(1), status: "pending", assigned_to: "practitioner" },
      { id: nextId("task"), client_id: c.id, practitioner_id: PRACTITIONER.id, title: "Finish goals worksheet", task_type: "form", due_at: daysFromNow(2), status: "pending", assigned_to: "client" },
    ],
    messages: [
      { id: nextId("msg"), client_id: c.id, sender: "client", body: "Started the goals worksheet. Writing 'stop approving small bids' down made me nervous, which probably means it's the right one.", created_at: daysAgo(2) },
      { id: nextId("msg"), client_id: c.id, sender: "practitioner", body: "That's exactly the signal. Bring that nervousness to our session Monday — we'll make it concrete.", created_at: daysAgo(2) },
    ],
    portalAssignments: [
      { id: nextId("pa"), client_id: c.id, assignment_type: "form", title: "DISC Assessment", status: "completed", completed_at: daysAgo(21) },
      { id: nextId("pa"), client_id: c.id, assignment_type: "homework", title: "Goals & Vision Worksheet", status: "in_progress" },
    ],
    payments: [
      { id: nextId("pay"), client_id: c.id, amount: 6000, paid_at: daysAgo(25).slice(0, 10), method: "Bank Transfer" },
    ],
  };
}

// ---------------------------------------------------------------------------
// CLIENT 3 — Priya Patel — active coaching, check-in overdue
// ---------------------------------------------------------------------------
function buildPriya(): SeedBundle {
  const c = client({
    full_name: "Priya Patel",
    email: "priya.patel@example.com",
    phone: "(206) 555-0143",
    status: "journey_scheduled",
    current_phase: "harm_reduction_session",
    referral_source_id: REFERRAL_SOURCES[2].id,
    notes: "COO, Ledgerly (fintech, 200 people). Being groomed for CEO in 18 months.",
    amount_paid: 12000,
    created_at: daysAgo(60),
  });

  const s1 = coachingSession(c.id, daysAgo(28), "completed");
  const s2 = coachingSession(c.id, daysAgo(14), "completed");
  const s3 = coachingSession(c.id, daysFromNow(2), "scheduled");

  return {
    client: c,
    milestones: milestonesFor(c.id, ["intake_complete", "preparation_complete"]),
    documents: docSet(c.id, {
      participant_screening_form: "reviewed",
      informed_consent: "signed",
      harm_reduction_services_agreement: "signed",
      client_services_agreement: "signed",
      preparation_navigation_plan: "reviewed",
      journey_brief: "reviewed",
      session_notes: "uploaded",
    }),
    sessions: [
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "intake_assessment", scheduled_at: daysAgo(58), duration_minutes: 90, status: "completed", location: "Zoom" },
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "preparation", scheduled_at: daysAgo(44), duration_minutes: 90, status: "completed", location: "Zoom" },
      s1,
      s2,
      s3,
    ],
    transcripts: [],
    aiSummaries: [
      callSummary(c.id, s1, "Reviewed the first two weeks against her goals. Priya presented the Q3 ops plan to the CEO; she felt she over-explained and lost the room. Discussed leading with the decision, then the reasoning. She raised frustration that the CFO keeps reopening decisions after exec meetings.", "- [Priya] Open each exec update with the decision in one sentence\n- [Priya] Ask the CFO for a 1:1 to agree how decisions get closed\n- [Coach] Send article on decision rights (RAPID)"),
      callSummary(c.id, s2, "Priya had the 1:1 with the CFO — it went better than expected; they agreed decisions are final once logged in the exec notes. Board prep is next: she presents to the board for the first time in five weeks. Talked through her habit of saying yes to every escalation from her team.", "- [Priya] Draft board narrative outline and share before next session\n- [Priya] Push back on two escalations this week and log what happened\n- [Coach] Share board presentation template"),
    ],
    memory: [
      { id: nextId("mem"), client_id: c.id, item_type: "intention", content: "Be ready to step into the CEO role within 18 months.", phase: "preparation", status: "carried_forward", created_at: daysAgo(44) },
      { id: nextId("mem"), client_id: c.id, item_type: "insight", content: "Leads with the reasoning instead of the decision — loses senior audiences.", phase: "harm_reduction_session", status: "in_progress", created_at: daysAgo(28) },
      { id: nextId("mem"), client_id: c.id, item_type: "commitment", content: "First board presentation in five weeks — outline due before next session.", phase: "harm_reduction_session", status: "open", created_at: daysAgo(14) },
    ],
    sessionNotes: [],
    checkIns: [],
    postIntegrationForms: [],
    tasks: [
      { id: nextId("task"), client_id: c.id, practitioner_id: PRACTITIONER.id, title: "Between-session check-in", task_type: "form", due_at: hoursAgo(6), status: "overdue", assigned_to: "client" },
      { id: nextId("task"), client_id: c.id, practitioner_id: PRACTITIONER.id, title: "Board narrative outline", task_type: "reflection", due_at: daysFromNow(1), status: "pending", assigned_to: "client" },
    ],
    messages: [
      { id: nextId("msg"), client_id: c.id, sender: "practitioner", body: "Quick nudge on the check-in form — and how did pushing back on those escalations go?", created_at: hoursAgo(10) },
    ],
    portalAssignments: [
      { id: nextId("pa"), client_id: c.id, assignment_type: "form", title: "Between-Session Check-In", status: "pending", due_at: hoursAgo(6) },
      { id: nextId("pa"), client_id: c.id, assignment_type: "action_item", title: "Draft board narrative outline", status: "in_progress", due_at: daysFromNow(1) },
    ],
    payments: [
      { id: nextId("pay"), client_id: c.id, amount: 12000, paid_at: daysAgo(58).slice(0, 10), method: "Bank Transfer" },
    ],
  };
}

// ---------------------------------------------------------------------------
// CLIENT 4 — Marcus Webb — active coaching, session tomorrow
// ---------------------------------------------------------------------------
function buildMarcus(): SeedBundle {
  const c = client({
    full_name: "Marcus Webb",
    email: "marcus.webb@example.com",
    phone: "(720) 555-0177",
    status: "journey_scheduled",
    current_phase: "harm_reduction_session",
    referral_source_id: REFERRAL_SOURCES[1].id,
    notes: "CEO, Webb Precision (third-generation family manufacturer, 85 people). Took over from his father 18 months ago.",
    created_at: daysAgo(45),
  });

  const s1 = coachingSession(c.id, daysAgo(21), "completed");
  const s2 = coachingSession(c.id, daysAgo(7), "completed");
  const s3 = coachingSession(c.id, daysFromNow(1), "scheduled");

  const checkIn: CheckIn = {
    id: nextId("ci"),
    client_id: c.id,
    check_in_type: "48_hour_reflection",
    immediate_insights: "Held the line with Dad on the equipment decision. He wasn't happy but didn't override me.",
    support_needs: "Want to talk about how to keep him involved without him running things.",
    submitted_by: "client",
    submitted_at: daysAgo(3),
  };

  return {
    client: c,
    milestones: milestonesFor(c.id, ["intake_complete", "preparation_complete"]),
    documents: docSet(c.id, {
      participant_screening_form: "reviewed",
      informed_consent: "signed",
      harm_reduction_services_agreement: "signed",
      client_services_agreement: "signed",
      preparation_navigation_plan: "reviewed",
      journey_brief: "reviewed",
    }),
    sessions: [
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "intake_assessment", scheduled_at: daysAgo(44), duration_minutes: 90, status: "completed", location: "Zoom" },
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "preparation", scheduled_at: daysAgo(35), duration_minutes: 90, status: "completed", location: "Webb Precision" },
      s1,
      s2,
      s3,
    ],
    transcripts: [],
    aiSummaries: [
      callSummary(c.id, s1, "Marcus described his father (former CEO, still chairman) walking the floor daily and giving direction to supervisors. Employees aren't sure who is in charge. Marcus wants to keep his father's respect but needs clear authority.", "- [Marcus] Write down the three decisions that are his alone as CEO\n- [Marcus] Schedule a sit-down with his father about roles"),
      callSummary(c.id, s2, "Marcus had the roles conversation; his father agreed in principle but overrode him on a $400k equipment purchase two days later. Marcus did not push back in the moment. Worked on a script for holding the decision.", "- [Marcus] Revisit the equipment decision with his father using the script\n- [Marcus] Announce the decision to the plant managers himself\n- [Coach] Send succession governance examples"),
    ],
    memory: [
      { id: nextId("mem"), client_id: c.id, item_type: "intention", content: "Establish clear CEO authority while keeping his father engaged as chairman.", phase: "preparation", status: "carried_forward", created_at: daysAgo(35) },
      { id: nextId("mem"), client_id: c.id, item_type: "theme", content: "Avoids conflict with his father in the moment, then resents it later.", phase: "harm_reduction_session", status: "in_progress", created_at: daysAgo(21) },
      { id: nextId("mem"), client_id: c.id, item_type: "commitment", content: "Revisit the equipment decision with his father.", phase: "harm_reduction_session", status: "resolved", created_at: daysAgo(7) },
    ],
    sessionNotes: [],
    checkIns: [checkIn],
    postIntegrationForms: [],
    tasks: [
      { id: nextId("task"), client_id: c.id, practitioner_id: PRACTITIONER.id, title: "Review Marcus's check-in before tomorrow", task_type: "session_prep", due_at: daysFromNow(1), status: "pending", assigned_to: "practitioner" },
    ],
    messages: [
      { id: nextId("msg"), client_id: c.id, sender: "client", body: "Did it. Used the script almost word for word. Talk tomorrow.", created_at: daysAgo(3) },
      { id: nextId("msg"), client_id: c.id, sender: "practitioner", body: "Huge step, Marcus. We'll look at what made it work so you can do it again.", created_at: daysAgo(3) },
    ],
    portalAssignments: [
      { id: nextId("pa"), client_id: c.id, assignment_type: "action_item", title: "Revisit equipment decision with Dad", status: "completed", completed_at: daysAgo(3) },
      { id: nextId("pa"), client_id: c.id, assignment_type: "action_item", title: "Announce decision to plant managers", status: "in_progress" },
    ],
    payments: [
      { id: nextId("pay"), client_id: c.id, amount: 6000, paid_at: daysAgo(44).slice(0, 10), method: "Bank Transfer" },
    ],
  };
}

// ---------------------------------------------------------------------------
// CLIENT 5 — Sarah Klein — engagement complete, 30-day follow-up booked
// ---------------------------------------------------------------------------
function buildSarah(): SeedBundle {
  const c = client({
    full_name: "Sarah Klein",
    email: "sarah.klein@example.com",
    phone: "(512) 555-0166",
    status: "journey_closed",
    current_phase: "closed",
    referral_source_id: REFERRAL_SOURCES[0].id,
    notes: "Founder & CEO, Kiln & Co. (consumer brand, 30 people). Completed a 6-month engagement.",
    amount_paid: 12000,
    created_at: daysAgo(200),
  });

  const plan: GrowthActionPlan = {
    id: nextId("gap"),
    client_id: c.id,
    thirty_day_commitments: [
      "Run the monthly leadership review without stepping in to solve problems.",
      "Finalize the VP of Sales hire by the end of the month.",
      "Take the full Friday off every other week.",
    ],
    behavioral_experiments: [
      "In every 1:1, ask 'What do you recommend?' before offering an answer.",
      "Hold one decision for 24 hours instead of deciding in the meeting.",
    ],
    daily_practices: [
      "15-minute planning block before opening email.",
      "Write the day's one most important outcome on a sticky note.",
    ],
    reflection_questions: [
      "Where did I rescue someone today instead of coaching them?",
      "What am I doing that someone on my team should own?",
    ],
    accountability_commitments: [
      "Monthly check-in with her Vistage chair on the plan.",
      "30-day follow-up call with the coach.",
    ],
    created_at: daysAgo(8),
  };

  const planSummary: AiSummary = {
    id: nextId("ai"),
    client_id: c.id,
    summary_type: "growth_action_plan",
    title: "Action Plan",
    content: plan as unknown as Record<string, unknown>,
    model: "demo",
    created_at: daysAgo(8),
  };

  return {
    client: c,
    milestones: milestonesFor(c.id, [
      "intake_complete",
      "preparation_complete",
      "journey_complete",
      "growth_action_plan_complete",
      "journey_closed",
    ]),
    documents: docSet(c.id, {
      participant_screening_form: "reviewed",
      informed_consent: "signed",
      harm_reduction_services_agreement: "signed",
      client_services_agreement: "signed",
      preparation_navigation_plan: "reviewed",
      journey_brief: "reviewed",
      session_notes: "uploaded",
      post_integration_form: "reviewed",
      growth_action_plan: "uploaded",
    }),
    sessions: [
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "intake_assessment", scheduled_at: daysAgo(195), duration_minutes: 90, status: "completed", location: "Zoom" },
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "preparation", scheduled_at: daysAgo(180), duration_minutes: 90, status: "completed", location: "Zoom" },
      coachingSession(c.id, daysAgo(150), "completed"),
      coachingSession(c.id, daysAgo(120), "completed"),
      coachingSession(c.id, daysAgo(90), "completed"),
      coachingSession(c.id, daysAgo(60), "completed"),
      coachingSession(c.id, daysAgo(30), "completed"),
      coachingSession(c.id, daysAgo(10), "completed"),
      { id: nextId("sess"), client_id: c.id, practitioner_id: PRACTITIONER.id, session_type: "other", scheduled_at: daysFromNow(3), duration_minutes: 45, status: "scheduled", location: "Zoom" },
    ],
    transcripts: [
      { id: nextId("transcript"), client_id: c.id, source: "upload", raw_text: "Final session transcript (Fathom) uploaded for coach review.", created_at: daysAgo(10) },
    ],
    aiSummaries: [planSummary],
    memory: [
      { id: nextId("mem"), client_id: c.id, item_type: "theme", content: "Rescues her team instead of coaching them.", phase: "harm_reduction_session", status: "resolved", created_at: daysAgo(120) },
      { id: nextId("mem"), client_id: c.id, item_type: "commitment", content: "Hire a VP of Sales so she can step back from deals.", phase: "harm_reduction_session", status: "in_progress", created_at: daysAgo(30) },
      { id: nextId("mem"), client_id: c.id, item_type: "integration_outcome", content: "Leadership team now runs the monthly review; she attends as a participant.", phase: "closed", status: "resolved", created_at: daysAgo(10) },
    ],
    sessionNotes: [],
    checkIns: [],
    postIntegrationForms: [
      { id: nextId("pif"), client_id: c.id, integration_session: 2, responses: { "What has changed since we started?": "I'm no longer in every decision. The team is making calls I would have made — and some better ones.", "What still feels unresolved?": "Sales still leans on me for big deals. The VP hire should fix that." }, submitted_at: daysAgo(12) },
    ],
    growthActionPlan: plan,
    tasks: [
      { id: nextId("task"), client_id: c.id, practitioner_id: PRACTITIONER.id, title: "30-Day Follow-Up Call", task_type: "follow_up", due_at: daysFromNow(3), status: "pending", assigned_to: "practitioner" },
    ],
    messages: [
      { id: nextId("msg"), client_id: c.id, sender: "client", body: "Signed the VP of Sales offer today. Two Fridays off so far — the business didn't fall apart.", created_at: daysAgo(3) },
      { id: nextId("msg"), client_id: c.id, sender: "practitioner", body: "That's the whole engagement in two sentences. Proud of you — see you on the 30-day call.", created_at: daysAgo(3) },
    ],
    portalAssignments: [
      { id: nextId("pa"), client_id: c.id, assignment_type: "action_item", title: "Finalize VP of Sales hire", status: "completed", completed_at: daysAgo(3) },
      { id: nextId("pa"), client_id: c.id, assignment_type: "homework", title: "Every-other-Friday off", status: "in_progress" },
    ],
    payments: [
      { id: nextId("pay"), client_id: c.id, amount: 6000, paid_at: daysAgo(195).slice(0, 10), method: "Bank Transfer" },
      { id: nextId("pay"), client_id: c.id, amount: 6000, paid_at: daysAgo(100).slice(0, 10), method: "Bank Transfer" },
    ],
  };
}

export function buildSeedData(): SeedBundle[] {
  return [buildMaya(), buildDaniel(), buildPriya(), buildMarcus(), buildSarah()];
}
