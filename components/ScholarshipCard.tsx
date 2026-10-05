import { ArrowUpRight, BadgeCheck, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Scholarship } from '@/lib/data'

export function ScholarshipCard({ scholarship, onDonate }: { scholarship: Scholarship; onDonate: () => void }) {
  const percentage = Math.round((scholarship.raised / scholarship.target) * 100)
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${scholarship.color} text-sm font-bold text-white shadow-sm`}>{scholarship.initials}</div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700"><BadgeCheck className="size-3.5" /> Verified</span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{scholarship.name}</h3>
      <p className="mt-1 text-sm text-slate-500">{scholarship.program} · {scholarship.school}</p>
      <div className="mt-6">
        <div className="flex items-end justify-between text-sm"><span className="font-semibold text-slate-900">${scholarship.raised.toLocaleString()}</span><span className="text-slate-500">of ${scholarship.target.toLocaleString()}</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${percentage}%` }} /></div>
        <div className="mt-2 flex justify-between text-xs font-medium text-slate-500"><span>{percentage}% funded</span><span>{scholarship.deadline}</span></div>
      </div>
      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <Button className="flex-1 rounded-xl bg-slate-950 text-white hover:bg-slate-800" onClick={onDonate}>Support student <ArrowUpRight data-icon="inline-end" /></Button>
        <Button variant="outline" size="icon" className="rounded-xl" aria-label={`View ${scholarship.name}`}><ExternalLink /></Button>
      </div>
    </article>
  )
}
