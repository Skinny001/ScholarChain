'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  ArrowUpRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Scholarship } from '@/lib/data'
import { LandingPage } from '@/components/LandingPage'
import { SectionView } from '@/components/SectionView'
import { DonationModal } from '@/components/DonationModal'
import { CreateScholarshipModal } from '@/components/CreateScholarshipModal'
import { SubmitReportModal } from '@/components/SubmitReportModal'
import { ApplyModal } from '@/components/ApplyModal'
import { StatCard } from '@/components/StatCard'
import { ScholarshipCard } from '@/components/ScholarshipCard'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Scholarships', icon: GraduationCap },
  { label: 'My giving', icon: HeartHandshake },
]

function App() {
  const [showLanding, setShowLanding] = useState(true)
  const [activeNav, setActiveNav] = useState('Overview')
  const [walletConnected, setWalletConnected] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [donationOpen, setDonationOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [reportsMap, setReportsMap] = useState<Record<string, any[]>>({})
  const [trancheIndices, setTrancheIndices] = useState<Record<string, number>>({})
  const [amount, setAmount] = useState('250')
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [selectedScholarshipId, setSelectedScholarshipId] = useState('0')
  const [scholarships, setScholarships] = useState<Scholarship[]>([])

  useEffect(() => {
    import('@/lib/web3').then((m) => m.fetchScholarships()).then(setScholarships).catch(console.error)
  }, [])

  const filtered = useMemo(() => scholarships.filter((item) => `${item.name} ${item.program} ${item.school}`.toLowerCase().includes(search.toLowerCase())), [search, scholarships])

  const totalFunded = useMemo(() => scholarships.reduce((sum, s) => sum + s.raised, 0), [scholarships])
  const studentsSupported = scholarships.length

  const [walletAddress, setWalletAddress] = useState('')

  async function handleConnectWallet() {
    try {
      const { connectWallet: connectWeb3, checkIsAdmin } = await import('@/lib/web3')
      const { address } = await connectWeb3()
      setWalletConnected(true)
      setWalletAddress(address)
      setIsAdmin(await checkIsAdmin(address))
      setToast('Wallet connected · BOT Chain Testnet')
      setTimeout(() => setToast(''), 3200)
    } catch (error: any) {
      setToast(error.message || 'Failed to connect wallet')
      setTimeout(() => setToast(''), 3200)
    }
  }

  async function donate() {
    try {
      const { processDonation, fetchScholarships } = await import('@/lib/web3')
      setToast('Awaiting wallet confirmation...')
      const hash = await processDonation(selectedScholarshipId, amount)
      setDonationOpen(false)
      setToast(`Donation successful! Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`)
      setTimeout(() => setToast(''), 5000)
      
      // Refresh scholarships so the UI reflects the new raised amount
      const data = await fetchScholarships()
      setScholarships(data)
    } catch (error: any) {
      setToast(`Donation failed: ${error.reason || error.message || 'Unknown error'}`)
      setTimeout(() => setToast(''), 5000)
    }
  }

  async function handleCreateScholarship(student: string, target: string, duration: string, metadata: { name: string, program: string, school: string }) {
    try {
      const { createScholarship, fetchScholarships } = await import('@/lib/web3')
      setToast('Awaiting wallet confirmation...')
      const hash = await createScholarship(student, target, duration, metadata)
      setCreateOpen(false)
      setToast(`Scholarship created! Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`)
      setTimeout(() => setToast(''), 5000)
      
      // Refresh scholarships
      const data = await fetchScholarships()
      setScholarships(data)
    } catch (error: any) {
      setToast(`Creation failed: ${error.reason || error.message || 'Unknown error'}`)
      setTimeout(() => setToast(''), 5000)
    }
  }

  async function handleMint() {
    try {
      const { mintTestUSDT } = await import('@/lib/web3')
      setToast('Minting 10,000 USDT... check your wallet.')
      const hash = await mintTestUSDT()
      setToast(`Minted 10,000 USDT! Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`)
      setTimeout(() => setToast(''), 5000)
    } catch (error: any) {
      setToast(`Mint failed: ${error.reason || error.message || 'Unknown error'}`)
      setTimeout(() => setToast(''), 5000)
    }
  }

  async function handleSubmitReport(uri: string) {
    try {
      const { submitMilestoneProof } = await import('@/lib/web3')
      setToast('Awaiting wallet confirmation...')
      const hash = await submitMilestoneProof(selectedScholarshipId, uri)
      setReportOpen(false)
      setToast(`Proof submitted! Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`)
      setTimeout(() => setToast(''), 5000)
    } catch (error: any) {
      setToast(`Submission failed: ${error.reason || error.message || 'Unknown error'}`)
      setTimeout(() => setToast(''), 5000)
    }
  }

  async function handleRelease(scholarshipId: string) {
    const trancheIndex = trancheIndices[scholarshipId]
    if (trancheIndex === -1) {
      setToast('All tranches already released.')
      return
    }
    try {
      const { releaseTranche } = await import('@/lib/web3')
      setToast('Awaiting wallet confirmation...')
      const hash = await releaseTranche(scholarshipId, trancheIndex)
      setToast(`Tranche released! Tx: ${hash.slice(0, 6)}...${hash.slice(-4)}`)
      setTimeout(() => setToast(''), 5000)
      
      // Refresh admin view
      const { fetchReports, getNextTrancheIndex } = await import('@/lib/web3')
      setReportsMap(prev => ({ ...prev, [scholarshipId]: [] })) // Temp visual clear
      const rMap = { ...reportsMap, [scholarshipId]: await fetchReports(scholarshipId) }
      const tMap = { ...trancheIndices, [scholarshipId]: await getNextTrancheIndex(scholarshipId) }
      setReportsMap(rMap)
      setTrancheIndices(tMap)
    } catch (error: any) {
      setToast(`Release failed: ${error.reason || error.message || 'Unknown error'}`)
      setTimeout(() => setToast(''), 5000)
    }
  }

  useEffect(() => {
    if (isAdmin && activeNav === 'Admin Review') {
      import('@/lib/web3').then(async ({ fetchReports, getNextTrancheIndex }) => {
        const rMap: Record<string, any[]> = {}
        const tMap: Record<string, number> = {}
        for (const s of scholarships) {
          rMap[s.id] = await fetchReports(s.id)
          tMap[s.id] = await getNextTrancheIndex(s.id)
        }
        setReportsMap(rMap)
        setTrancheIndices(tMap)
      })
    }
  }, [isAdmin, activeNav, scholarships])

  const isStudent = walletAddress && scholarships.some(s => s.studentAddress.toLowerCase() === walletAddress.toLowerCase())
  const dynamicNavItems = [...navItems]
  if (isStudent) {
    dynamicNavItems.push({ label: 'My Scholarship', icon: GraduationCap })
  }
  if (isAdmin) {
    dynamicNavItems.push({ label: 'Admin Review', icon: ShieldCheck })
  }

  if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-[1400px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-10">
            <button className="flex items-center gap-2.5" onClick={() => { setActiveNav('Overview'); setShowLanding(true) }} aria-label="ScholarChain home">
              <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-blue-600 text-white shadow-sm"><img src="/logo.jpg" alt="ScholarChain Logo" className="size-full object-cover" /></span>
              <span className="text-lg font-bold tracking-tight">Scholar<span className="text-blue-600">Chain</span></span>
            </button>
            <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
              {dynamicNavItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => setActiveNav(label)} className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition ${activeNav === label ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="size-4" />{label}</button>)}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 md:flex"><span className="size-2 rounded-full bg-emerald-500" /> BOT Chain Testnet</div>
            {walletConnected && (
              <Button variant="outline" onClick={handleMint} className="hidden h-9 items-center rounded-xl border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 md:flex">Get Test USDT</Button>
            )}
            <Button onClick={handleConnectWallet} className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">{walletConnected ? <><Wallet data-icon="inline-start" />{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</> : <><Wallet data-icon="inline-start" />Connect wallet</>}</Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X /> : <Menu />}</Button>
          </div>
        </div>
        {mobileOpen && <nav className="flex flex-col gap-1 border-t border-slate-100 bg-white p-4 lg:hidden">{dynamicNavItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActiveNav(label); setMobileOpen(false) }} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-600"><Icon className="size-4" />{label}</button>)}</nav>}
      </header>

      <main className="mx-auto max-w-[1400px] px-5 py-8 lg:px-8 lg:py-10">
        {activeNav === 'Admin Review' ? (
          <section className="space-y-8">
            <div className="max-w-2xl"><p className="text-sm font-semibold text-blue-600">Admin Dashboard</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Review Proofs</h1><p className="mt-3 text-slate-500">Verify student reports and release funds.</p></div>
            <div className="grid gap-4 lg:grid-cols-3">
              {scholarships.map(s => {
                const reports = reportsMap[s.id] || []
                const nextTranche = trancheIndices[s.id] ?? -1
                return (
                  <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold">{s.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{s.program} · {s.school}</p>
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <h4 className="font-semibold text-slate-700 text-sm">Submitted Reports ({reports.length})</h4>
                      <ul className="mt-2 space-y-2">
                        {reports.map((r, i) => (
                          <li key={i} className="text-xs">
                            <a href={r.uri} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">View Document {i+1}</a>
                          </li>
                        ))}
                      </ul>
                      {reports.length === 0 && <p className="text-xs text-slate-400 mt-2">No reports submitted yet.</p>}
                    </div>
                    {nextTranche !== -1 ? (
                      <Button onClick={() => handleRelease(s.id)} className="mt-5 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700">Release Tranche {nextTranche + 1}</Button>
                    ) : (
                      <Button disabled className="mt-5 w-full rounded-xl bg-slate-100 text-slate-400">All Funds Released</Button>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ) : activeNav === 'My Scholarship' ? (
          <section className="space-y-8">
            <div className="max-w-2xl"><p className="text-sm font-semibold text-emerald-600">Student Portal</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">My Scholarship</h1><p className="mt-3 text-slate-500">Submit your milestones to unlock your funding.</p></div>
            <div className="grid gap-4 lg:grid-cols-3">
              {scholarships.filter(s => s.studentAddress.toLowerCase() === walletAddress.toLowerCase()).map(s => (
                <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{s.program} · {s.school}</p>
                  <div className="mt-6 flex items-end justify-between text-sm"><span className="font-semibold text-slate-900">${s.raised.toLocaleString()} raised</span><span className="text-slate-500">Target: ${s.target.toLocaleString()}</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round((s.raised / s.target) * 100)}%` }} /></div>
                  <Button onClick={() => { setSelectedScholarshipId(s.id); setReportOpen(true) }} className="mt-6 w-full rounded-xl bg-slate-950 text-white hover:bg-slate-800">Submit Milestone Proof</Button>
                </div>
              ))}
            </div>
          </section>
        ) : activeNav !== 'Overview' ? <SectionView activeNav={activeNav} scholarships={scholarships} onDonate={(id?: string) => { if (id) setSelectedScholarshipId(id); setDonationOpen(true) }} /> : <>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><div className="mb-3 flex items-center gap-2 text-sm font-medium text-blue-600"><Sparkles className="size-4" /> Transparent giving, measurable impact</div><h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl">Good morning, donor.</h1><p className="mt-2 max-w-xl text-slate-500">Fund a future with confidence. Every scholarship is verified, escrowed, and released as students reach their milestones.</p></div>
          <div className="flex items-center gap-3">
            {!isAdmin && <Button variant="outline" onClick={() => setApplyOpen(true)} className="rounded-xl border-slate-200 bg-white shadow-sm">Apply for funding</Button>}
            {isAdmin && <Button variant="outline" onClick={() => setCreateOpen(true)} className="rounded-xl border-slate-200 bg-white shadow-sm"><Plus className="mr-1.5 size-4" />New Scholarship</Button>}
            <Button onClick={() => { setSelectedScholarshipId('0'); setDonationOpen(true) }} className="rounded-xl bg-blue-600 px-5 text-white shadow-sm hover:bg-blue-700"><HeartHandshake className="mr-1.5 size-4" />Start giving</Button>
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-3"><StatCard label="Total funded" value={`$${totalFunded.toLocaleString()}`} detail="On-chain total" icon={CircleDollarSign} tone="blue" /><StatCard label="Students supported" value={studentsSupported.toString()} detail="Active scholarships" icon={GraduationCap} tone="green" /><StatCard label="Impact score" value={studentsSupported > 0 ? "100%" : "0%"} detail={studentsSupported > 0 ? "All milestones on track" : "Awaiting data"} icon={BarChart3} tone="purple" /></section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><h2 className="text-lg font-semibold">Funding activity</h2><p className="mt-1 text-sm text-slate-500">Your giving over the last 6 months</p></div><button className="flex items-center gap-1 text-sm font-semibold text-slate-600">Last 6 months <ChevronDown className="size-4" /></button></div><div className="mt-8 flex h-44 items-end gap-3 sm:gap-6">{[0, 0, 0, 0, 0, 0].map((height, index) => <div className="flex flex-1 flex-col items-center gap-3" key={index}><div className="w-full rounded-t-lg bg-blue-100 transition hover:bg-blue-200" style={{ height: `${height}%` }}><div className="h-2/3 w-full rounded-t-lg bg-blue-500" /></div><span className="text-xs font-medium text-slate-400">{['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'][index]}</span></div>)}</div></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Trust at every step</p><h2 className="mt-2 text-xl font-semibold">Your impact is on-chain.</h2></div><span className="flex size-10 items-center justify-center rounded-xl bg-white/10"><ShieldCheck className="size-5 text-blue-300" /></span></div><div className="mt-7 flex flex-col gap-4">{[['Funds escrowed', '100%'], ['Milestones verified', '0'], ['Scholarships completed', '0']].map(([label, value]) => <div className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0" key={label}><span className="text-sm text-slate-400">{label}</span><span className="font-semibold">{value}</span></div>)}</div><button className="mt-5 flex items-center gap-1 text-sm font-semibold text-blue-300 hover:text-blue-200">Explore the trust model <ArrowUpRight className="size-4" /></button></div>
        </section>

        <section className="mt-10"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-semibold">Scholarships seeking support</h2><p className="mt-1 text-sm text-slate-500">Verified opportunities with transparent milestones.</p></div><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search scholarships" className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none ring-blue-500 transition placeholder:text-slate-400 focus:ring-2 sm:w-56" /></div></div><div className="mt-5 grid gap-4 lg:grid-cols-3">{filtered.map((scholarship) => <ScholarshipCard key={scholarship.id} scholarship={scholarship} onDonate={() => { setSelectedScholarshipId(scholarship.id); setDonationOpen(true) }} />)}</div></section>

        <section className="mt-10 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 md:p-8"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div className="flex items-start gap-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"><FileCheck2 className="size-5" /></div><div><h2 className="font-semibold text-slate-950">Built for accountability</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">ScholarChain uses smart contracts to hold funds safely and release them only when real progress is verified by trusted reviewers.</p></div></div><Button variant="outline" className="w-fit rounded-xl border-blue-200 bg-white">How it works <ArrowUpRight data-icon="inline-end" /></Button></div></section>
        </>}
      </main>

      <DonationModal 
        isOpen={donationOpen} 
        onClose={() => setDonationOpen(false)} 
        walletConnected={walletConnected} 
        amount={amount} 
        setAmount={setAmount} 
        onDonate={donate} 
      />
      <CreateScholarshipModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        walletConnected={walletConnected}
        onCreate={handleCreateScholarship}
      />
      <SubmitReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        walletConnected={walletConnected}
        onSubmit={handleSubmitReport}
      />
      <ApplyModal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
      />
      {toast && <div role="status" className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-xl bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl"><Check className="size-4 text-emerald-400" />{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X className="size-4 text-slate-400" /></button></div>}
    </div>
  )
}

export default function Page() { return <App /> }
