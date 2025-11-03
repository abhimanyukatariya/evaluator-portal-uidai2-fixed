import Link from "next/link"
import Header  from "@/components/header"
export default function Home(){
  return (
    <main className="min-h-screen">
      <Header/>
      <section className="container-max mt-12">
        <div className="glass rounded-2xl p-8">
          <h1 className="text-3xl font-semibold">Welcome, Evaluator</h1>
          <p className="text-slate-600 mt-2">Use the buttons below to explore the flow.</p>
          <div className="mt-6 flex gap-4">
            <Link href="/login" className="px-5 py-2.5 rounded-xl bg-mshBlue text-white font-medium hover:opacity-90">Go to Login</Link>
            <Link href="/landing" className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:opacity-90">Skip to Landing</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
