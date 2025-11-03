
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import { ParticipationPie, MonthlyBar } from '@/components/charts'
import { participationData, monthlyData } from '@/data/mock'

export default function Analytics(){
  return (
    <main className="min-h-screen">
      <Header/>
      <div className="container-max flex gap-6 mt-6">
        <Sidebar/>
        <section className="flex-1 space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Participation by Challenge</h2>
            <ParticipationPie data={participationData}/>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold">Month-wise Submissions</h2>
            <MonthlyBar data={monthlyData}/>
          </div>
        </section>
      </div>
    </main>
  )
}
