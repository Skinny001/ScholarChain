import { Check, Wallet, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletConnected: boolean;
  amount: string;
  setAmount: (amount: string) => void;
  onDonate: () => void;
}

export function DonationModal({ isOpen, onClose, walletConnected, amount, setAmount, onDonate }: DonationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/40 p-5 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="donate-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Support a student</p>
            <h2 id="donate-title" className="mt-1 text-2xl font-semibold">Make an impact</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close donation dialog"><X className="size-5" /></button>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-500">Your donation is held in escrow and released across verified academic milestones.</p>
        <label className="mt-6 block text-sm font-medium text-slate-700" htmlFor="amount">Donation amount</label>
        <div className="relative mt-2">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-slate-400">$</span>
          <input id="amount" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 pl-9 pr-4 text-lg font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="mt-3 flex gap-2">
          {['100', '250', '500'].map((preset) => <button key={preset} onClick={() => setAmount(preset)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${amount === preset ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}`}>${preset}</button>)}
        </div>
        <Button onClick={onDonate} className="mt-6 h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700">{walletConnected ? <><Check data-icon="inline-start" />Confirm donation</> : <><Wallet data-icon="inline-start" />Connect wallet to continue</>}</Button>
        <p className="mt-3 text-center text-xs text-slate-400">USDT · BOT Chain Testnet · Secure escrow</p>
      </div>
    </div>
  )
}
