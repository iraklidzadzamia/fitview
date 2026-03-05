import { Hero } from "@/components/marketing/Hero";

export default function MarketingPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-12">
      <Hero />

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Install</h3>
          <p className="mt-2 text-sm text-slate-300">Paste one script tag and mark product buttons with `data-fitview-item`.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Upload</h3>
          <p className="mt-2 text-sm text-slate-300">Customer uploads a photo from desktop, drag-and-drop, or camera on mobile.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-lg font-semibold text-white">Convert</h3>
          <p className="mt-2 text-sm text-slate-300">Widget polls async API and shows generated result with download action.</p>
        </article>
      </section>
    </main>
  );
}
