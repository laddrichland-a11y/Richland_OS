import AppShell from "@/components/layout/AppShell";
import {
  getClient,
  getDocuments,
  getAiSummaries,
  getFormTemplates,
  getFormSubmissionsForClient,
  getMilestones,
  getSessions,
  pickPhaseSession,
  getStageNotes,
  getStageRecordings,
  ensureClientFormDocuments,
} from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import IntakeWorkspace from "@/components/client/IntakeWorkspace";
import MilestoneToggleBanner from "@/components/client/MilestoneToggleBanner";
import ClientPhaseNav from "@/components/client/ClientPhaseNav";
import ClientPhaseWorkspace from "@/components/client/ClientPhaseWorkspace";
import PhasePrepareMe from "@/components/client/PhasePrepareMe";
import { getJourneyStageWorkspaceState } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function IntakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Attach any Form Library form this client doesn't have yet (e.g. one
  // added after they became a client) so it shows under Forms for This Session.
  await ensureClientFormDocuments(id);
  const client = await getClient(id);
  if (!client) notFound();

  const [documents, summaries, formTemplates, formSubmissions, milestones, sessions, stageNotes, stageRecordings] = await Promise.all([
    getDocuments(id),
    getAiSummaries(id, "client_assessment_summary"),
    getFormTemplates(),
    getFormSubmissionsForClient(id),
    getMilestones(id),
    getSessions(id),
    getStageNotes(id, "intake"),
    getStageRecordings(id, "intake"),
  ]);

  const session = pickPhaseSession(sessions, "intake_assessment");
  if (session) redirect(`/clients/${id}/sessions/${session.id}`);

  const milestone = milestones.find((m) => m.milestone_key === "intake_complete");
  const stage = getJourneyStageWorkspaceState(client, milestones, "intake", "intake_complete");

  return (
    <AppShell title={client.full_name} variant="wellnest-client">
      <ClientPhaseWorkspace clientId={id} showClientHeader>
      <ClientPhaseNav clientId={id} current="intake" />
      <MilestoneToggleBanner
        clientId={id}
        milestoneKey="intake_complete"
        label="Intake & Assessments"
        meta="Stage 1 · Intake call and assessments"
        initialCompleted={milestone?.completed ?? false}
        stageStatus={stage.status}
        canMarkComplete={stage.canMarkComplete}
        canPrepare={stage.canPrepare}
      />
      <PhasePrepareMe readOnly={!stage.canPrepare} clientId={id} sessionTypeLabel="Intake & Assessments" sessionType="intake_assessment" />
      <IntakeWorkspace
        clientId={id}
        clientName={client.full_name}
        documents={documents}
        formTemplates={formTemplates}
        formSubmissions={formSubmissions}
        existingSummaries={summaries}
        initialNotes={stageNotes?.content ?? ""}
        initialRecordings={stageRecordings}
        canCompleteStage={stage.canCompleteStage}
      />
      </ClientPhaseWorkspace>
    </AppShell>
  );
}
