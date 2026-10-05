import { ArrowUpRight, BookOpen, CheckCircle2, Globe2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LandingPage({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#081326] text-white">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5" aria-label="ScholarChain home">
          <span className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20"><img src="/logo.jpg" alt="ScholarChain Logo" className="size-full object-cover" /></span>
          <span className="text-xl font-bold tracking-tight">Scholar<span className="text-blue-400">Chain</span></span>
        </button>
        <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex" aria-label="Landing page navigation">
          <a href="#how-it-works" className="transition hover:text-white">How it works</a>
          <a href="#impact" className="transition hover:text-white">Our impact</a>
          <a href="#trust" className="transition hover:text-white">Trust model</a>
        </nav>
        <Button onClick={onEnter} variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">Open app <ArrowUpRight data-icon="inline-end" /></Button>
      </header>

      <main>
        <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="pointer-events-none absolute -right-40 -top-32 size-[34rem] rounded-full bg-blue-500/15 blur-3xl" />
          <div className="relative grid items-center gap-16 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-2 text-xs font-semibold text-blue-200"><Globe2 className="size-3.5" /> A more accountable way to give</div>
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-7xl">Fund potential.<br /><span className="text-blue-400">See progress.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-slate-300">ScholarChain connects students with supporters through transparent, milestone-based scholarships. Your generosity becomes visible progress, from first contribution to graduation.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button onClick={onEnter} size="lg" className="h-13 rounded-xl bg-blue-500 px-6 text-base font-semibold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-400">Explore scholarships <ArrowUpRight data-icon="inline-end" /></Button><a href="#how-it-works" className="inline-flex h-13 items-center justify-center rounded-xl border border-white/15 px-6 text-sm font-semibold text-slate-200 transition hover:bg-white/5">Learn how it works</a></div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400"><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-400" /> Verified students</span><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-400" /> Escrowed funds</span><span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-emerald-400" /> On-chain records</span></div>
            </div>
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/10 blur-2xl" />
              <div className="relative rounded-[1.75rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">ScholarChain impact</p><p className="mt-2 text-2xl font-semibold">A visible chain of trust</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300"><ShieldCheck className="size-5" /></span></div>
                <div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/5 p-4"><p className="text-3xl font-semibold">0%</p><p className="mt-1 text-xs text-slate-400">milestones on track</p></div><div className="rounded-2xl bg-white/5 p-4"><p className="text-3xl font-semibold">$0</p><p className="mt-1 text-xs text-slate-400">funded transparently</p></div></div>
                <div className="mt-6 rounded-2xl bg-slate-950/60 p-5"><div className="flex items-center justify-between"><p className="text-sm font-medium">Scholarship Example</p><span className="text-xs font-semibold text-emerald-300">0% funded</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[0%] rounded-full bg-blue-400" /></div><div className="mt-5 flex items-center justify-between text-xs text-slate-400"><span className="flex items-center gap-2"><BookOpen className="size-3.5" /> Program Name</span><span>Milestone 0 of 0</span></div></div>
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/15 bg-emerald-400/5 p-4"><CheckCircle2 className="size-5 shrink-0 text-emerald-300" /><p className="text-sm leading-5 text-slate-300">Every release is tied to verified academic progress.</p></div>
              </div>
            </div>
          </div>
        </section>

        <section id="impact" className="border-y border-white/10 bg-white/[0.03] px-5 py-12 lg:px-8"><div className="mx-auto grid max-w-7xl gap-8 sm:grid-cols-3"><div><p className="text-3xl font-semibold">0</p><p className="mt-1 text-sm text-slate-400">students supported</p></div><div><p className="text-3xl font-semibold">0</p><p className="mt-1 text-sm text-slate-400">programs represented</p></div><div><p className="text-3xl font-semibold">0%</p><p className="mt-1 text-sm text-slate-400">funds held in escrow</p></div></div></section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8 lg:py-28"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Simple by design</p><h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">Give with clarity, not guesswork.</h2><p className="mt-5 text-lg leading-8 text-slate-400">ScholarChain turns a donation into a relationship built on evidence, updates, and shared milestones.</p></div><div className="mt-12 grid gap-5 md:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><span className="text-sm font-semibold text-blue-300">01</span><h3 className="mt-10 text-xl font-semibold">Discover</h3><p className="mt-3 text-sm leading-6 text-slate-400">Browse verified students, their goals, and the milestones that matter to their journey.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><span className="text-sm font-semibold text-blue-300">02</span><h3 className="mt-10 text-xl font-semibold">Support</h3><p className="mt-3 text-sm leading-6 text-slate-400">Contribute through a secure smart-contract escrow that keeps every transaction accountable.</p></div><div id="trust" className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"><span className="text-sm font-semibold text-blue-300">03</span><h3 className="mt-10 text-xl font-semibold">Follow progress</h3><p className="mt-3 text-sm leading-6 text-slate-400">See verified academic progress and know when funds are released at each milestone.</p></div></div></section>

        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28"><div className="flex flex-col items-start justify-between gap-8 rounded-3xl bg-blue-500 p-8 md:flex-row md:items-center md:p-12"><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Start where impact begins</p><h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight md:text-4xl">Help a student take the next step.</h2></div><Button onClick={onEnter} size="lg" className="h-13 shrink-0 rounded-xl bg-white px-6 text-base font-semibold text-slate-950 hover:bg-blue-50">Enter ScholarChain <ArrowUpRight data-icon="inline-end" /></Button></div></section>
      </main>
      <footer className="border-t border-white/10 px-5 py-8 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
          <p className="font-medium text-slate-400">
            Powered by <span className="font-bold text-white">BOT Chain</span>
          </p>
          <div className="flex items-center justify-center gap-6 text-sm font-medium">
            <a href="https://botchain.ai" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">botchain.ai</a>
            <a href="https://scan.botchain.ai" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">scan.botchain.ai</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
