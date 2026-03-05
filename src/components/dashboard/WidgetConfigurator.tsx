import React from "react";

const EXAMPLE_API_KEY = "fv_live_************************";

export function WidgetConfigurator() {
  const embedSnippet = `<script
  src="https://cdn.fitview.ai/widget.js"
  data-api-key="${EXAMPLE_API_KEY}"
  data-button-text="Try it on"
  data-button-color="#2563eb"
  async
></script>`;

  return (
    <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <header>
        <h2 className="text-xl font-semibold text-white">Widget Settings</h2>
        <p className="mt-1 text-sm text-slate-300">
          Generate API key, define allowed origins, and copy installation snippet.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Allowed origin</span>
          <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" defaultValue="https://store.example.com" />
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Button color</span>
          <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" defaultValue="#2563eb" />
        </label>
      </div>

      <p className="rounded-lg border border-cyan-800/60 bg-cyan-950/30 px-3 py-2 text-sm text-cyan-200">
        Usage resets on the 1st of each month (UTC)
      </p>

      <div className="space-y-2">
        <p className="text-sm text-slate-300">Install snippet</p>
        <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
          <code>{embedSnippet}</code>
        </pre>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950">Generate New API Key</button>
        <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200">Revoke Current Key</button>
      </div>
    </section>
  );
}
