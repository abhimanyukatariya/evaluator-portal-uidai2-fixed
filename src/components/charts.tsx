
'use client'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'

export function ParticipationPie({ data }: { data: { name: string, value: number }[] }) {
  const COLORS = ['#1F4EB4','#F28B30','#2EAE70','#7C3AED','#0EA5E9']
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={120} label={(e)=>`${e.name} (${e.value})`}>
            {data.map((_,i)=> <Cell key={i} fill={COLORS[i%COLORS.length]} stroke="white" strokeWidth={2} />)}
          </Pie>
          <Tooltip contentStyle={{background:'rgba(255,255,255,0.95)', borderRadius:12, border:'1px solid #e5e7eb'}}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function MonthlyBar({ data }: { data: { month: string, submissions: number }[] }) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="submissions" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
