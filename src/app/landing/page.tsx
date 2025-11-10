
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import StatCard from '@/components/stat-card'
import { todoItems, participationData } from '@/data/mock'
import { ParticipationPie } from '@/components/charts'
import Image from "next/image";
import BannerCarousel from '@/components/banner-carousel';

const slides = [
  /* { src: "/sitaa-banner.png",
    alt: "SITAA_UIDAI",
    href: 'https://sitaa-ready.vercel.app/',
  }, */
  {
    src: "/face-liveness.png",
    alt: "SITAA — Face Liveness Detection",
    href: '/challenge/face-liveness/startups',
  },
  {
    src: "/contactless-fingerprint.png",
    alt: "SITAA — Contactless Fingerprint Authentication",
    href: '/challenge/contactless-fingerprint/startups',
  },
  {
    src: "/presentation-attack.png",
    alt: "SITAA — Presentation Attack Detection",
    href: '/challenge/presentation-attack/startups',
  },
];

export default function Landing(){
  return (
    <main className="min-h-screen">
      <Header/>
      <div className="container-max flex gap-6 mt-6">
        <Sidebar/>
        <section className="flex-2 space-y-6">
          <div className="card p-0 overflow-hidden">
              <BannerCarousel slides={slides} fullBleed={false} />
              <div className="card p-0 overflow-hidden">            
</div>    
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold">Challenges</h2>
            <div className="overflow-x-auto mt-4">
              <table className="table">
                <thead>
                  <tr className="th">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Challenge</th>
                    <th className="py-2 px-3">Entity name</th>
                    <th className="py-2 px-3">Stage</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3">Action Required</th>
                  </tr>
                </thead>
                <tbody>
                  {todoItems.map((t,i)=>(
                    <tr key={t.id} className="td">
                      <td className="py-2 px-3">{i+1}</td>
                      <td className="py-2 px-3">{t.challenge}</td>
                      <td className="py-2 px-3">{t.entity}</td>
                      <td className="py-2 px-3">{t.stage}</td>
                      <td className="py-2 px-3">{t.status}</td>
                      <td className="py-2 px-3">
                        <a className="btn btn-outline" href={`/challenge/${t.challengeSlug}/startups`}>Review</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Participation Overview</h2>
              <span className="text-sm text-slate-500">Submissions by challenge</span>
            </div>
            <ParticipationPie data={participationData}/>
          </div>
        </section>
      </div>
    </main>
  )
}
