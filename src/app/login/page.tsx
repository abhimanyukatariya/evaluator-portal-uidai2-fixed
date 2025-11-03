import Link from "next/link"
import Header from "@/components/header"
export default function LoginPage(){
  return (
    <main className="min-h-screen">
      <Header/>
      <section className="container-max mt-12 grid md:grid-cols-2 gap-8 items-center">
        <div className="glass rounded-2xl p-8">
          <h1 className="text-3xl font-semibold">Evaluator Login</h1>
          <p className="text-slate-600 mt-2">Use your email and password to continue.</p>
          <form className="mt-6 space-y-4">
            <input className="w-full px-4 py-3 rounded-xl border" placeholder="Work email" />
            <input className="w-full px-4 py-3 rounded-xl border" type="password" placeholder="Password" />
            <button className="w-full px-5 py-3 rounded-xl bg-mshBlue text-white font-medium hover:opacity-90">Login</button>
          </form>
          <p className="text-xs text-slate-500 mt-3">* Demo only — no backend auth wired yet.</p>
          <div className="mt-6"><Link href="/landing" className="text-sm underline">Skip to Landing</Link></div>
        </div>
        <div className="rounded-2xl p-8 glass">
          <h2 className="text-xl font-semibold">Why this portal?</h2>
          <ul className="mt-3 list-disc pl-5 text-slate-700 space-y-1">
            <li>Evaluate startups efficiently with filters & analytics.</li>
            <li>Leadership-ready insights with beautiful dashboards.</li>
            <li>Built for longevity — even after 5 years, pick up instantly.</li>
          </ul>
        </div>
      </section>
    </main>
  )
}
