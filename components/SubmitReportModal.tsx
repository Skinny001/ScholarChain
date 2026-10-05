import { useState } from 'react'
import { Check, X, FileUp, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SubmitReportModalProps {
  isOpen: boolean
  onClose: () => void
  walletConnected: boolean
  onSubmit: (uri: string) => Promise<void>
}

export function SubmitReportModal({ isOpen, onClose, walletConnected, onSubmit }: SubmitReportModalProps) {
  const [uri, setUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!uri) {
      setError('Please provide a document URI/link.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await onSubmit(uri)
    } catch (e: any) {
      setError(e.reason || e.message || 'Failed to submit proof')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm">
      <div role="dialog" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-600">Student Portal</p>
            <h2 className="mt-1 text-2xl font-semibold">Submit Milestone Proof</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="size-5" /></button>
        </div>
        
        <p className="mt-3 text-sm leading-6 text-slate-500">Provide a link to your transcript, receipt, or progress report. The admin will verify this document to release your next tranche.</p>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">Document Link (URI)</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input value={uri} onChange={e => setUri(e.target.value)} placeholder="e.g. https://drive.google.com/..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        
        <Button onClick={handleSubmit} disabled={loading} className="mt-6 h-12 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800">
          {loading ? 'Submitting to blockchain...' : <><FileUp className="mr-2 size-4" />Submit Proof</>}
        </Button>
      </div>
    </div>
  )
}
