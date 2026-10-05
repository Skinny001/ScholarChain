import { BarChart3 } from 'lucide-react'

export function StatCard({ label, value, detail, icon: Icon = BarChart3, tone = 'blue' }: { label: string; value: string; detail: string; icon?: React.ElementType; tone?: 'blue' | 'green' | 'purple' }) {
  const tones = { blue: 'bg-blue-50 text-blue-700', green: 'bg-emerald-50 text-emerald-700', purple: 'bg-violet-50 text-violet-700' }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon className="size-5" /></div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-500">{detail}</p>
    </div>
  )
}
