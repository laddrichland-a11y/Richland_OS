import { redirect } from "next/navigation";

// Heartful OS stage page. Richland OS folds this into the ongoing Coaching
// stage, so old links land on the coaching session list.
export default async function LegacyStageRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/clients/${id}/coaching`);
}
