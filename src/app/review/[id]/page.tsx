
'use client'
import React from 'react'
import Header from '@/components/header'
import Sidebar from '@/components/sidebar'
import { reviewCriteria } from '@/data/mock'
import { useMemo, useState } from 'react'

export default function ReviewPage(){
  const [scores,setScores]=useState<Record<string,number>>({})
  const totalMax = useMemo(()=> reviewCriteria.reduce((acc,g)=> acc + g.items.reduce((s,i)=>s+i.max,0),0),[])
  const totalScore = useMemo(()=> Object.values(scores).reduce((a,b)=>a+(b||0),0),[scores])
  function update(id:string,max:number,value:number){ const v=Math.max(0,Math.min(max,value)); setScores(p=>({...p,[id]:v})) }

  return (
    <main className="min-h-screen">
      <Header/>
      <div className="container-max flex gap-6 mt-6">
        <Sidebar/>
        <section className="flex-1">
          <div className="card mb-6">
            <div className="bg-accent text-white text-center py-6 text-3xl font-semibold">Review Page</div>
          </div>
          <div className="card p-0 overflow-hidden">
            <table className="table">
              <thead>
                <tr className="th">
                  <th className="py-3 px-4">Parameters</th>
                  <th className="py-3 px-4 w-32">Max Marks</th>
                  <th className="py-3 px-4 w-40">Allotted Marks</th>
                </tr>
              </thead>
              <tbody>
                {reviewCriteria.map((group, gi) => (
  <React.Fragment key={`group-${gi}-${group.title}`}>
    <tr className="bg-slate-50 border-t">
      <td className="py-3 px-4 font-semibold" colSpan={3}>{group.title}</td>
    </tr>
    {group.items.map((item, ii) => (
      <tr key={`row-${gi}-${item.id}`} className="border-t">
        <td className="py-3 px-4">{item.label}</td>
        <td className="py-3 px-4">{item.max}</td>
        <td className="py-3 px-4">
                          <input type="number" className="input" value={Number.isFinite(scores[item.id])?scores[item.id]:''} min={0} max={item.max} placeholder={`0 - ${item.max}`} onChange={(e)=>update(item.id,item.max,Number(e.target.value))}/>
                        </td>
      </tr>
    ))}
  </React.Fragment>
))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-600">Total: <span className="font-semibold">{totalScore}</span> / {totalMax}</div>
            <div className="flex gap-3">
              <button className="btn btn-outline">Save Draft</button>
              <button className="btn btn-primary">Submit</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
