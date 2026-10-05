import { useState } from 'react'
import { Check, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ApplyModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [program, setProgram] = useState('')
  const [school, setSchool] = useState('')
  const [wallet, setWallet] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  if (submitted) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Check className="size-6" /></div>
          <h2 className="mt-4 text-xl font-semibold">Application Received!</h2>
          <p className="mt-2 text-sm text-slate-500">The ScholarChain team will review your details and reach out soon.</p>
          <Button onClick={() => { setSubmitted(false); onClose(); }} className="mt-6 w-full rounded-xl bg-slate-950 text-white">Done</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div><p className="text-sm font-medium text-blue-600">Students</p><h2 className="mt-1 text-2xl font-semibold">Apply for Funding</h2></div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button>
        </div>
        
        <div className="mt-6 space-y-4">
          <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Full Name</label><input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Email Address</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Program</label><input value={program} onChange={e => setProgram(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">School</label><input value={school} onChange={e => setSchool(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500" /></div>
          </div>
          <div><label className="mb-1.5 block text-xs font-semibold text-slate-700">Wallet Address (optional)</label><input value={wallet} onChange={e => setWallet(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-blue-500" /></div>
        </div>
        
        <Button onClick={() => setSubmitted(true)} className="mt-6 h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"><FileText className="mr-2 size-4" />Submit Application</Button>
      </div>
    </div>
  )
}
