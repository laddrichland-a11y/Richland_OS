import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import ClientPhaseNav from "@/components/client/ClientPhaseNav";
import ClientPhaseWorkspace from "@/components/client/ClientPhaseWorkspace";
import MilestoneToggleBanner from "@/components/client/MilestoneToggleBanner";
import PhasePrepareMe from "@/components/client/PhasePrepareMe";
import { CalendarDays, ChevronRight, Plus } from "@/components/ui/RichlandIcon";
import { getClient, getMilestones, getSessions } from "@/lib/data";
import { selectCurrentOrNextSession } from "@/lib/sessionSelectors";
import type { Session } from "@/lib/types";
import { formatDateTime, getJourneyStageWorkspaceState, SESSION_TYPE_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Session types that belong to the ongoing Coaching stage. The legacy
// Heartful types are listed so any imported history still shows up here.
const COACHING_STAGE_TYPES = new Set<Session["session_type"]>([
  "coaching",
  "harm_reduction_support",
  "check_in_12hr",
  "integration_1",
  "integration_2",
  "other",
]);

const STATUS_TEXT: Record<Session["status"], string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

function SessionRow({ clientId, session }: { clientId: string; session: Session }) {
  return (
    <li>
      <Link
        href={`/clients/${clientId}/sessions/${session.id}`}
        className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 px-4 py-3 transition-colors hover:border-clay-200 hover:bg-clay-50/40"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink-900">
            {SESSION_TYPE_LABELS[session.session_type] ?? "Session"}
          </span>
          <span className="block text-xs text-ink-500">
            {session.scheduled_at ? formatDateTime(session.scheduled_at) : "No date set"}
            {session.duration_minutes ? ` · ${session.duration_minutes} min` : ""}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2 text-xs text-ink-500">
          {STATUS_TEXT[session.status] ?? session.status}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    </li>
  );
}

export default async function CoachingStagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const [sessions, milestones] = await Promise.all([getSessions(id), getMilestones(id)]);
  const coachingSessions = sessions.filter((session) => COACHING_STAGE_TYPES.has(session.session_type));
  const nextSession = selectCurrentOrNextSession(coachingSessions);
  const upcoming = coachingSessions
    .filter((session) => session.status === "scheduled")
    .sort((a, b) => (a.scheduled_at ?? "").localeCompare(b.scheduled_at ?? ""));
  const past = coachingSessions
    .filter((session) => session.status !== "scheduled")
    .sort((a, b) => (b.scheduled_at ?? "").localeCompare(a.scheduled_at ?? ""));

  const milestone = milestones.find((m) => m.milestone_key === "journey_complete");
  const stage = getJourneyStageWorkspaceState(client, milestones, "harm_reduction_session", "journey_complete");
  const addSessionHref = `/calendar?createSession=1&clientId=${encodeURIComponent(id)}`;

  return (
    <AppShell title={client.full_name} variant="wellnest-client">
      <ClientPhaseWorkspace clientId={id} showClientHeader>
        <ClientPhaseNav clientId={id} current="harm_reduction_session" />
        <MilestoneToggleBanner
          clientId={id}
          milestoneKey="journey_complete"
          label="Coaching"
          meta="Stage 3 · Ongoing — mark complete when the engagement wraps up"
          initialCompleted={milestone?.completed ?? false}
          stageStatus={stage.status}
          canMarkComplete={stage.canMarkComplete}
          canPrepare={stage.canPrepare}
        />
        {nextSession && (
          <PhasePrepareMe
            readOnly={!stage.canPrepare}
            clientId={id}
            sessionTypeLabel="Coaching Session"
            sessionId={nextSession.id}
          />
        )}

        <section className="client-surface mb-5 px-5 py-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="journey-icon-heading text-base font-semibold text-ink-900">
              <CalendarDays aria-hidden="true" />
              Coaching sessions
            </h2>
            <Link href={addSessionHref} className="dashboard-add-action">
              <Plus aria-hidden="true" /> Add session
            </Link>
          </div>

          {coachingSessions.length === 0 ? (
            <p className="text-sm text-ink-500">
              No coaching sessions yet. Add one, or sync your calendar, and it will show up here with its recording,
              summary and action items.
            </p>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Upcoming</h3>
                {upcoming.length === 0 ? (
                  <p className="text-sm text-ink-500">Nothing scheduled.</p>
                ) : (
                  <ul className="space-y-2">
                    {upcoming.map((session) => <SessionRow key={session.id} clientId={id} session={session} />)}
                  </ul>
                )}
              </div>
              {past.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">Past</h3>
                  <ul className="space-y-2">
                    {past.map((session) => <SessionRow key={session.id} clientId={id} session={session} />)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </ClientPhaseWorkspace>
    </AppShell>
  );
}
