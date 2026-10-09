import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Richland OS",
    short_name: "Richland OS",
    description: "Coaching operating system for Richland Advisors — sessions, accountability, and client portal.",
    // "/" redirects to /dashboard, which is practitioner-only — so a client
    // who added the portal to their home screen used to launch straight into
    // the practitioner gate. It also can't carry the per-client query the
    // portal needs. /portal is the right entry point for both roles;
    // middleware rebuilds ?client=<id> from a cookie for real clients, and
    // practitioners get the in-app picker as before.
    start_url: "/portal",
    display: "standalone",
    background_color: "#F7F7F6",
    theme_color: "#1F3A4D",
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
