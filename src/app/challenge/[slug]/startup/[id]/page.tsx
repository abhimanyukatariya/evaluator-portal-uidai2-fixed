export const dynamic = "force-dynamic";
export const revalidate = 0;

import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { getApplication, listEvaluatorScores, listScoreCriteria } from "@/lib/admin_api";
import ApplicationView from "./ui/ApplicationView";

type Params = {
  params: { slug: string; id: string };
};

export default async function StartupDetailPage({ params }: Params) {
  const { slug, id } = params;

  // Fetch detail
  let app: any = null;
  let criteria: any[] = [];
  let evaluatorScores: any[] = [];

  try {
    app = await getApplication(id);
  } catch (e) {
    console.error("[detail] getApplication failed:", e);
  }

  try {
    criteria = await listScoreCriteria(id);
  } catch (e) {
    // scoring is optional per role; ignore if 404
  }

  try {
    evaluatorScores = await listEvaluatorScores(id);
  } catch (e) {
    // optional for evaluator role
  }

  return (
    <main className="min-h-screen flex">
      <aside className="hidden md:block w-64 border-r bg-white/60">
        <Sidebar />
      </aside>

      <section className="flex-1 p-4 md:p-8 space-y-6">
        <Header title="Application details" showBack />

        <ApplicationView
          slug={slug}
          app={app}
          criteria={Array.isArray(criteria) ? criteria : []}
          evaluatorScores={Array.isArray(evaluatorScores) ? evaluatorScores : []}
        />
      </section>
    </main>
  );
}
