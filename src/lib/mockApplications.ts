export type StartupApplication = {
  slug: string;
  startup: {
    id: string;
    name: string;
    city: string;
    industry: string;
    trl: string;
    website?: string;
  };
  summary: string;
  sections: {
    title: string;
    fields: { key: string; label: string; value: string | string[] }[];
  }[];
  uploads: {
    name: string;
    url: string;
  }[];
};

export const APPLICATIONS: StartupApplication[] = [
  {
    slug: "face-liveness",
    startup: {
      id: "ylw-msg",
      name: "Predulive Labs",
      city: "Bengaluru",
      industry: "AI",
      trl: "TRL 7",
      website: "https://predulive.example.com",
    },
    summary:
      "Passive face liveness SDK that combines texture analysis, micro-motion cues and challenge-response; on-device inference with fallback to server.",
    sections: [
      {
        title: "Company Overview",
        fields: [
          { key: "incorp", label: "Incorporation Year", value: "2019" },
          { key: "founders", label: "Founders", value: ["A. Kumar", "R. Mehta"] },
          { key: "team", label: "Team Size", value: "42" },
        ],
      },
      {
        title: "Problem Alignment",
        fields: [
          {
            key: "uidai-fit",
            label: "Alignment to UIDAI Problem",
            value:
              "Detect spoofing (photos, videos, 3D masks) under low-light and motion. Works with commodity front cameras.",
          },
          {
            key: "objectives",
            label: "Objectives / OKRs",
            value: [
              ">= 99.5% PAD on standard benchmarks",
              "<= 400 ms end-to-end on mid-tier Android",
              "<= 10 MB SDK footprint",
            ],
          },
        ],
      },
      {
        title: "Technology & Architecture",
        fields: [
          { key: "stack", label: "Tech Stack", value: "PyTorch -> TorchScript (Android), CoreML (iOS)" },
          { key: "arch", label: "Architecture", value: "Two-stage CNN with micro-motion temporal head" },
          { key: "innov", label: "Innovations", value: "Temporal micro-motion head + specular map consistency" },
          { key: "security", label: "Security", value: "On-device processing, encrypted model, anti-tamper checks" },
        ],
      },
      {
        title: "Product & Roadmap",
        fields: [
          { key: "trl", label: "Current TRL", value: "TRL 7 (pilot with 3 finservs)" },
          { key: "roadmap", label: "Roadmap (6–12 mo)", value: ["Depth-free 3D cues", "Edge quantization", "SDK hardening"] },
          { key: "metrics", label: "Key Metrics", value: ["APCER < 0.5%", "NPCER < 0.3%", "Latency P95: 380 ms"] },
        ],
      },
      {
        title: "Compliance & Aadhaar",
        fields: [
          { key: "dpdp", label: "DPDP / Privacy", value: "Consent flows, minimal data, audit logs, data localization" },
          { key: "aadhaar", label: "Aadhaar Integration Plan", value: "SDK for KUA ASA partners; consent artifacts handed to RP" },
        ],
      },
      {
        title: "Business",
        fields: [
          { key: "pricing", label: "Pricing", value: "Tiered MAU; enterprise on-prem option" },
          { key: "funding", label: "Funding", value: "Seed $1.2M" },
          { key: "pilots", label: "Pilots", value: ["NBFC-A (live)", "E-KYC vendor (pilot)"] },
        ],
      },
    ],
    uploads: [
      { name: "Pitch.pdf", url: "/files/yellow/Pitch.pdf" },
      { name: "TechSpec.pdf", url: "/files/yellow/TechSpec.pdf" },
      { name: "SDK-API.md", url: "/files/yellow/SDK-API.md" },
    ],
  },

  // Add more startups here later (contactless-fingerprint, PAD/presentation-attack, etc.)
];

export function getApplication(slug: string, id: string) {
  // Try matching slug + id
  let app = APPLICATIONS.find((a) => a.slug === slug && a.startup.id === id);

  // Fallback: just return first application for now (for demo)
  if (!app) {
    app = APPLICATIONS.find((a) => a.slug === slug) || APPLICATIONS[0];
  }

  return app;
}

