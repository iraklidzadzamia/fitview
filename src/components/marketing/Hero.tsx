export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-8 shadow-2xl">
      <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" aria-hidden />
      <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" aria-hidden />

      <div className="relative z-10 space-y-6">
        <p className="inline-flex rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-300">
          FitView AI Try-On
        </p>
        <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight text-white md:text-6xl">
          See it on <span className="text-cyan-300">YOU</span> before you buy.
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          One script tag for stores. Upload customer photo, run virtual try-on, and return the result in seconds.
        </p>
        <div className="flex flex-wrap gap-3">
          <a className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5" href="/dashboard/catalog">
            Open Dashboard Demo
          </a>
          <a className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-800/60" href="/demo">
            View Widget Flow
          </a>
        </div>
      </div>
    </section>
  );
}
