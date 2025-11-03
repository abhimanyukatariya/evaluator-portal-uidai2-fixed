// src/app/challenge/[slug]/startup/[id]/page.tsx
import Link from "next/link";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { getApplicationById } from "@/lib/admin_api";


function val(x: unknown): string {
  if (x == null) return "—";
  if (Array.isArray(x)) return x.join(", ");
  return String(x);
}
function isHttpUrl(x: unknown): x is string {
  return typeof x === "string" && /^https?:\/\//i.test(x);
}
function nice(label: string) {
  return label
    .replace(/\s+/g, " ")
    .replace(/_/g, " ")
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Some common keys your API uses (based on your curl output)
const OVERVIEW_KEYS = [
  { key: "companyname", label: "Company" },
  { key: "cityc", label: "Location" },
  { key: "industryc", label: "Industry" },
  { key: "yearc", label: "Incorporation Year" },
  { key: "teamsize", label: "Team Size" },
  { key: "more", label: "Founders" },
  { key: "titlem", label: "Applicant Title" },
];

const CONTACT_KEYS = [
  { key: "emailm", label: "Email" },
  { key: "websitem", label: "Website" }, // sometimes the API uses 'website' or 'websitem'
  { key: "website", label: "Website (alt)" },
  { key: "phone", label: "Phone" },
];

const SOCIAL_KEYS = [
  { key: "linkedin_company", label: "LinkedIn (Company)" },
  { key: "twitterm", label: "Twitter / X" },
  { key: "facebook", label: "Facebook" },
  { key: "insta", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
];

// File uploads (exact keys from your payload; keep adding here as needed)
const FILE_KEYS = [
  {
    key: "Upload the research solution document (technical details).",
    label: "Technical Details (PDF)",
  },
  {
    key: "Upload a solution benefits document (impact, value proposition).",
    label: "Benefits / Value Proposition (PDF)",
  },
  {
    key: "Upload the research deliverables with a short description for each.",
    label: "Deliverables (PDF)",
  },
  {
    key: "Upload the resumes of research team members.",
    label: "Team CVs (PDF)",
  },
  {
    key: "Upload your challenge proposal document.",
    label: "Proposal (PDF)",
  },
  // image keys observed in curl:
  { key: "path", label: "Company/Logo Image" },
  { key: "url", label: "Landing Image" },
];

// Long answer / descriptive questions (text)
const LONG_ANSWER_KEYS = [
  { key: "Describe the innovation in your proposed solution", label: "Innovation" },
  {
    key: "List the research deliverables with a short description for each.",
    label: "Research Deliverables",
  },
  {
    key: "Provide a proposed timeline / phases for executing your research/solution.",
    label: "Proposed Timeline",
  },
  {
    key: "What are the product-level advantages (performance, usability, accuracy, etc.)?",
    label: "Product-Level Advantages",
  },
  {
    key: "List the key challenges you anticipate and your mitigation plan to address them.",
    label: "Key Challenges & Mitigation",
  },
  {
    key: "Mention the key technologies (5–6 keywords) that will be used in your solution.",
    label: "Technologies",
  },
  {
    key: "Explain your research details – including approach, architecture, and feasibility.",
    label: "Approach / Architecture / Feasibility",
  },
  {
    key: "What are the commercial advantages (scalability, cost-effectiveness, adoption potential)?",
    label: "Commercial Advantages",
  },
  {
    key:
      "Provide details of your relevant past experience in biometrics, AI/ML, or related research.",
    label: "Relevant Past Experience",
  },
];

// ---- page -------------------------------------------------------------------
export default async function ApplicationPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  // Fetch the full application by ID from your Admin API
  let app: any | null = null;
  try {
    const res = await getApplicationById(params.id);
    // your detail endpoint may return { result: {...} } or { results: [{...}] }
    if (res && typeof res === "object") {
      if ("result" in res) app = (res as any).result;
      else if ("results" in res && Array.isArray((res as any).results)) {
        app = (res as any).results[0] ?? null;
      } else {
        app = res;
      }
    }
  } catch (e) {
    // swallow and show skeleton below
    console.error("[review] getApplicationById failed:", e);
  }

  // handy helpers for pulling values regardless of exact key spelling
  const get = (k: string) => (app ? app[k] : null);
  const firstNonEmpty = (...ks: string[]) => {
    for (const k of ks) {
      const v = get(k);
      if (v != null && String(v).trim() !== "") return v;
    }
    return null;
  };

  const companyName =
    firstNonEmpty("companyname", "name", "startup_name") ?? "—";
  const subtitleParts = [
    firstNonEmpty("cityc", "city"),
    firstNonEmpty("industryc", "industry"),
    firstNonEmpty("yearc"),
  ].filter(Boolean);

  return (
    <main className="min-h-screen">
      <Header />
      <div className="container-max flex gap-6 mt-6">
        <Sidebar />

        <section className="flex-1 space-y-6">
          {/* Page header */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold">
                {val(companyName)} — Application
              </h1>

              <div className="flex gap-3">
                <a className="btn btn-outline" href={`/challenge/${params.slug}/startups`}>
                  Back
                </a>
                <Link className="btn" href={`/review/${params.id}`}>
                  Go to Scoring
                </Link>
              </div>
            </div>
          </div>

          {/* Tagline / subtitle */}
          <div className="card p-6">
            <div className="text-muted-foreground">
              {subtitleParts.length ? subtitleParts.join(" • ") : "—"}
            </div>
            <div className="mt-2">
              {val(firstNonEmpty("descriptionDetail", "summary", "more_info"))}
            </div>
          </div>

          {/* Overview */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Company Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {OVERVIEW_KEYS.map(({ key, label }) => (
                <div key={key}>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    {label}
                  </div>
                  <div className="mt-1">{val(get(key))}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Contacts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CONTACT_KEYS.map(({ key, label }) => {
                const v = get(key);
                const display = val(v);
                const href = isHttpUrl(v) ? String(v) : undefined;
                return (
                  <div key={key}>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {label}
                    </div>
                    <div className="mt-1">
                      {href ? (
                        <a className="link" href={href} target="_blank">
                          {display}
                        </a>
                      ) : (
                        display
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Social Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SOCIAL_KEYS.map(({ key, label }) => {
                const v = get(key);
                const display = val(v);
                const href = isHttpUrl(v) ? String(v) : undefined;
                return (
                  <div key={key}>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">
                      {label}
                    </div>
                    <div className="mt-1">
                      {href ? (
                        <a className="link" href={href} target="_blank">
                          {display}
                        </a>
                      ) : (
                        display
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Long answers */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Proposal & Answers</h2>
            <div className="space-y-6">
              {LONG_ANSWER_KEYS.map(({ key, label }) => {
                const v = get(key);
                if (!v || String(v).trim() === "") return null;
                return (
                  <div key={key}>
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      {label}
                    </div>
                    <div className="whitespace-pre-wrap">{val(v)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Files / uploads */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Uploads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FILE_KEYS.map(({ key, label }) => {
                const v = get(key);
                if (!v) return null;
                const urls = Array.isArray(v) ? v : [v];
                const valid = urls.filter(isHttpUrl) as string[];
                if (!valid.length) return null;

                return (
                  <div key={key} className="p-3 rounded-lg border bg-white">
                    <div className="font-medium mb-2">{nice(label)}</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {valid.map((u, i) => (
                        <li key={i}>
                          <a className="link" href={u} target="_blank">
                            {u}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
