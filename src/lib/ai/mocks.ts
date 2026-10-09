// Deterministic sample answers, used only when RICHLAND_ALLOW_MOCK_AI=1 is
// set (e.g. recording a demo with no Anthropic key). Keys match prompts.ts.

export function mockAssessmentSummary(transcript: string, clientName: string) {
  const hasContent = transcript.trim().length > 20;
  return {
    client_goals: hasContent
      ? `${clientName} wants sharper strategic focus, a stronger leadership team, and more time on the work only they can do.`
      : `${clientName} has not shared intake notes yet — goals to be confirmed after the intake call.`,
    role_and_context: "Role, company stage, team size, and the key relationships (board, co-founders, direct reports) discussed on the call.",
    current_challenges: "The specific pressures they named — growth, hiring, delegation, conflict, or their own bandwidth.",
    leadership_strengths: "Strengths that came through in the conversation and any assessment results.",
    development_areas: "The growth edges they named or the assessments highlight.",
    assessment_insights: "No assessments provided yet.",
    watch_outs: "Anything to keep in mind going into goal-setting — time constraints, sensitivities, or blind spots.",
    follow_up_recommendations: "Send the goals worksheet and schedule the Goals & Agreement session.",
  };
}

export function mockJourneyBrief(clientName: string) {
  return {
    client_summary: `${clientName} is starting a coaching engagement focused on leading the company through its next stage of growth.`,
    goals: "1. Build a leadership team that runs the business week to week.\n2. Protect two strategy days a month.\n3. Have the hard performance conversation that has been put off.",
    success_measures: "Weekly leadership meeting runs without the CEO driving it; strategy days kept; the conversation held within 30 days.",
    themes: "Letting go of control; clarity of roles; courage in difficult conversations.",
    potential_obstacles: "Defaulting back into operations when things get busy.",
    coaching_approach: "Bi-weekly 60-minute sessions with a short check-in between; direct challenge with clear accountability.",
    accountability_commitments: "Client reports progress on each commitment at the start of every session.",
  };
}

export function mockJourneySummary(clientName: string) {
  return {
    major_themes: `Main themes from ${clientName}'s coaching session.`,
    important_events: "Decisions made and notable moments in the session.",
    potential_breakthroughs: "Insights the client reached during the session.",
    suggested_integration_topics: "Topics to pick up next session.",
  };
}

export function mockJourneyManualNotesSummary(clientName: string) {
  return {
    key_observations: `Key observations from the coach's notes on ${clientName}'s session.`,
    notable_moments: "Moments worth flagging from the session.",
    themes: "Threads visible across the notes.",
    follow_up_considerations: "What to check on next session.",
  };
}

export function mockSessionCallSummary(transcript: string, clientName: string) {
  const providedTranscript = transcript.trim();
  const actionItems = providedTranscript
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => /\b(will|should|plans? to|agreed to|committed to|follow[ -]?up|next step|send|schedule|try)\b/i.test(sentence));
  return {
    summary: `A transcript was provided for ${clientName}'s session. It records:\n\n${providedTranscript}`,
    action_items: actionItems.length ? actionItems.map((item) => `- ${item}`).join("\n") : "None mentioned.",
  };
}

export function mockCheckInSummary(clientName: string) {
  return {
    summary: `${clientName} is making steady progress on their commitments since the last session.`,
    flags: "Nothing needing attention before the next session.",
  };
}

export function mockIntegration1Brief(clientName: string) {
  return {
    original_intentions: "The goals agreed at the start of the engagement.",
    key_themes: "Themes connecting recent sessions to the reflection form.",
    emerging_insights: "New insights the client has named since the last session.",
    areas_for_exploration: "Areas worth opening up further in this session.",
    suggested_questions: `What got done since we last spoke, ${clientName}?\nWhat didn't, and what got in the way?\nWhat decision are you avoiding?\nWhat would the best version of you as a leader do here?\nWhat will you commit to before our next session?`,
  };
}

export function mockIntegrationSummary(sessionNumber: 1 | 2, clientName: string) {
  return {
    summary: `Follow-up session ${sessionNumber} with ${clientName} focused on progress against goals and next commitments.`,
    key_takeaways: "Progress on delegation is visible.\nStrategy time is still being squeezed.\nNew commitment set for the next two weeks.",
  };
}

export function mockGrowthActionPlan(clientName: string) {
  return {
    thirty_day_commitments: [
      `${clientName} blocks two strategy days this month and keeps them.`,
      "Hand off ownership of the weekly leadership meeting.",
    ],
    behavioral_experiments: [
      "Ask one question before giving an answer in every 1:1 this week.",
      "Decline one meeting that someone else should own.",
    ],
    daily_practices: ["10-minute planning block before email.", "End-of-day review of commitments."],
    reflection_questions: [
      "Where did I step in when I should have stepped back?",
      "What would make next week a win?",
    ],
    accountability_commitments: [
      "Progress update at the start of each coaching session.",
      "30-day review of this plan with the coach.",
    ],
  };
}

export function mockPrepareMeBriefing(clientName: string, sessionTypeLabel: string, revision = 1) {
  // Without an AI key, keep each regenerated briefing a little different so
  // the "regenerate" interaction still behaves like a fresh read.
  const alternatives = [
    {
      whyAreTheyHere: "What they are working on right now.",
      intentions: "Goals agreed at the start of the engagement and how they are tracking.",
      insights: "Key insights and themes across sessions so far.",
      focus: `For this ${sessionTypeLabel}, start with accountability on last session's commitments, then move to ${clientName}'s top goal.`,
    },
    {
      whyAreTheyHere: "Revisit their goals and notice which one is most urgent now.",
      intentions: "Prioritize the goal with the most momentum — or the one most stuck.",
      insights: "Look for new themes alongside the established ones.",
      focus: `For this ${sessionTypeLabel}, take a fresh read of where ${clientName} is before choosing what to push on.`,
    },
    {
      whyAreTheyHere: "Identify what is stalled and why.",
      intentions: "Use the client's own words to choose one goal for today.",
      insights: "Note what has shifted since the last session and what has not.",
      focus: `For this ${sessionTypeLabel}, open with what ${clientName} has been avoiding.`,
    },
    {
      whyAreTheyHere: "Connect today's session to the overall engagement goals.",
      intentions: "Ask the client what would make this hour most useful.",
      insights: "Hold both their strengths and the open questions.",
      focus: `For this ${sessionTypeLabel}, let ${clientName} name the most useful outcome, then hold them to a concrete next step.`,
    },
  ];
  const alternative = alternatives[(Math.max(1, revision) - 1) % alternatives.length];

  return {
    who_is_this_client: `${clientName} is a coaching client. Review their full record for specifics.`,
    why_are_they_here: alternative.whyAreTheyHere,
    their_intentions: alternative.intentions,
    risks_to_hold: "Anything flagged at intake or in prior sessions to keep in mind.",
    insights_so_far: alternative.insights,
    commitments_made: "Open commitments from prior sessions and their status.",
    focus_for_today: alternative.focus,
  };
}

export function mockLivingJourneySummary(clientName: string) {
  return {
    narrative_summary: `${clientName} has engaged consistently across intake, goal-setting, and coaching sessions, with clear progress on the agreed goals.`,
    core_intentions: "The goals that have held across the engagement.",
    recurring_themes: "Themes that show up repeatedly across sessions and forms.",
    growth_observed: "Concrete progress against goals.",
    open_threads: "Open topics and commitments.",
  };
}

export function mockAiConversationReply(clientName: string, practitionerMessage: string) {
  return {
    reply: `I'm looking at ${clientName}'s coaching record. For "${practitionerMessage}", I'd start with the latest session summary and any open commitments, then decide what to carry into the next session.`,
  };
}
