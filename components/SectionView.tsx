import { CircleDollarSign, HeartHandshake, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Scholarship } from '@/lib/data'
import { ScholarshipCard } from '@/components/ScholarshipCard'
import { StatCard } from '@/components/StatCard'

export function SectionView({ activeNav, scholarships, onDonate }: { activeNav: string; scholarships: Scholarship[]; onDonate: (id?: string) => void }) {
  if (activeNav === 'Scholarships') {
    return (
      <section className="space-y-8">
        <div className="max-w-2xl"><p className="text-sm font-semibold text-blue-600">Explore opportunities</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Scholarships</h1><p className="mt-3 text-slate-500">Support verified students through transparent, milestone-based funding.</p></div>
        <div className="grid gap-4 lg:grid-cols-3">{scholarships.map((scholarship) => <ScholarshipCard key={scholarship.id} scholarship={scholarship} onDonate={() => onDonate(scholarship.id)} />)}</div>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="max-w-2xl"><p className="text-sm font-semibold text-blue-600">Your impact</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">My giving</h1><p className="mt-3 text-slate-500">Track the students and milestones your contributions are helping move forward.</p></div>
      <div className="grid gap-4 md:grid-cols-3"><StatCard label="Total given" value="$0" detail="Across 0 contributions" icon={CircleDollarSign} tone="blue" /><StatCard label="Active support" value="0" detail="No milestones in progress" icon={HeartHandshake} tone="green" /><StatCard label="Impact score" value="0%" detail="Awaiting data" icon={BarChart3} tone="purple" /></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">Recent contributions</h2><p className="mt-1 text-sm text-slate-500">Your latest on-chain giving activity.</p></div><Button onClick={() => onDonate()} className="rounded-xl bg-blue-600 text-white hover:bg-blue-700">Give again</Button></div><div className="mt-6 flex flex-col gap-3">{scholarships.map((scholarship) => <div key={scholarship.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-4"><div><p className="font-semibold text-slate-950">{scholarship.name}</p><p className="mt-1 text-sm text-slate-500">{scholarship.program} · Milestone 2 of 3</p></div><span className="font-semibold text-emerald-700">Funded</span></div>)}</div></div>
    </section>
  )
}
