import { useState } from 'react'
import { Plus, X, GraduationCap, ShieldCheck, Clock, CircleDollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CreateScholarshipModalProps {
  isOpen: boolean
  onClose: () => void
  walletConnected: boolean
  onCreate: (student: string, target: string, duration: string, metadata: { name: string, program: string, school: string }) => Promise<void>
}

export function CreateScholarshipModal({ isOpen, onClose, walletConnected, onCreate }: CreateScholarshipModalProps) {
  const [student, setStudent] = useState('')
  const [name, setName] = useState('')
  const [program, setProgram] = useState('')
  const [school, setSchool] = useState('')
  const [target, setTarget] = useState('')
  const [duration, setDuration] = useState('365')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleCreate = async () => {
    if (!student || !name || !program || !school || !target || !duration) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onCreate(student, target, duration, { name, program, school })
    } catch (e: any) {
      setError(e.reason || e.message || 'Failed to create scholarship')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600"><Plus className="size-4" /></div>
            <h2 className="font-semibold text-slate-950">New Scholarship</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"><X className="size-4" /></button>
        </div>
        
        <div className="p-6">
          <p className="mb-6 text-sm text-slate-500">Create a new milestone-based scholarship. You must be the contract owner to perform this action.</p>
          
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Student Wallet Address</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input value={student} onChange={e => setStudent(e.target.value)} placeholder="0x..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Student Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Amina Mensah" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Program of Study</label>
                <input value={program} onChange={e => setProgram(e.target.value)} placeholder="e.g. Computer Science" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Institution / School</label>
                <input value={school} onChange={e => setSchool(e.target.value)} placeholder="e.g. KNUST" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Target (USDT)</label>
                <div className="relative">
                  <CircleDollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="5000" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">Duration (Days)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="365" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-xs font-medium text-red-500">{error}</p>}
          
          <Button 
            disabled={!walletConnected || loading} 
            onClick={handleCreate} 
            className="mt-8 w-full rounded-xl bg-blue-600 py-6 text-base font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            {loading ? 'Confirming in Wallet...' : !walletConnected ? 'Connect wallet to create' : 'Create Scholarship'}
          </Button>
        </div>
      </div>
    </div>
  )
}
