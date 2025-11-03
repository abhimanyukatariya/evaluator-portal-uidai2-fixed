
'use client'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import FilterPill from '@/components/filter-pills'
import { useState, useMemo } from 'react'
import { historyItems } from '@/data/mock'

export default function History(){
  const [year,setYear]=useState('All')
  const [challenge,setChallenge]=useState('All')
  const [etype,setEtype]=useState('All')
  const [stage,setStage]=useState('All')
  const [status,setStatus]=useState('All')
  const filtered = useMemo(()=> historyItems.filter(h=>
    (year==='All'||String(h.year)===year)&&
    (challenge==='All'||h.challenge===challenge)&&
    (etype==='All'||h.type===etype)&&
    (stage==='All'||h.stage===stage)&&
    (status==='All'||h.status===status)), [year,challenge,etype,stage,status])
  const opt = (vals:string[]) => [{label:'All',value:'All'},...vals.map(v=>({label:v,value:v}))]
  return (
    <main className="min-h-screen">
      <Header/>
      <div className="container-max flex gap-6 mt-6">
        <Sidebar/>
        <section className="flex-1 space-y-6">
          <h1 className="text-2xl font-semibold">History</h1>
          <div className="flex flex-wrap gap-3">
            <FilterPill label="Year" value={year} onChange={setYear} options={opt(['2025','2024'])}/>
            <FilterPill label="Challenge" value={challenge} onChange={setChallenge} options={opt(['Face Liveness Detection','Contactless Fingerprint Authentication','Presentation Attack Detection'])}/>
            <FilterPill label="Entity type" value={etype} onChange={setEtype} options={opt(['Startup','Academia'])}/>
            <FilterPill label="Stage" value={stage} onChange={setStage} options={opt(['Proposal','Pilot'])}/>
            <FilterPill label="Status" value={status} onChange={setStatus} options={opt(['Proposal reviewed','Under review','Shortlisted'])}/>
          </div>
          <div className="card p-6">
            <div className="overflow-x-auto">
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
                  {filtered.map((h,i)=>(
                    <tr key={h.id} className="td">
                      <td className="py-2 px-3">{i+1}</td>
                      <td className="py-2 px-3">{h.challenge}</td>
                      <td className="py-2 px-3">{h.entity}</td>
                      <td className="py-2 px-3">{h.stage}</td>
                      <td className="py-2 px-3">{h.status}</td>
                      <td className="py-2 px-3"><a className="btn btn-outline" href={`/review/${h.id}`}>View / Edit</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
