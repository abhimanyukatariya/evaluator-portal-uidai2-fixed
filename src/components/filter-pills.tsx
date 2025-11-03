
'use client'
type Option={label:string,value:string}
type Props={label:string;options:Option[];value:string;onChange:(v:string)=>void}
export default function FilterPill({label,options,value,onChange}:Props){
  return (
    <div className="pill">
      <span className="text-xs">{label}</span>
      <select className="bg-transparent outline-none" value={value} onChange={(e)=>onChange(e.target.value)}>
        {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
