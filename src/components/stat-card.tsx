
type Props={label:string;value:string|number;sub?:string}
export default function StatCard({label,value,sub}:Props){
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-2">{sub}</div>}
    </div>
  )
}
