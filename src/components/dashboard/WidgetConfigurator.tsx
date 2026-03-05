"use client";

import React, { useEffect, useState } from "react";

type StoreData = {
  id: string;
  name: string;
  apiKeyPrefix: string;
  plan: string;
  tryonsThisMonth: number;
} | null;

export function WidgetConfigurator() {
  const [store, setStore] = useState<StoreData>(null);
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/store")
      .then((r) => r.json())
      .then((body) => {
        if (body.data) setStore(body.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const createStore = async () => {
    if (!storeName.trim()) return;
    setMessage(null);
    const res = await fetch("/api/dashboard/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: storeName })
    });
    const body = await res.json();
    if (body.data?.apiKey) {
      setApiKey(body.data.apiKey);
      setStore(body.data);
      setMessage("Store created! Copy your API key below — it will only be shown once.");
    } else {
      setMessage(body.error || "Failed to create store");
    }
  };

  const generateKey = async () => {
    setMessage(null);
    setApiKey(null);
    const res = await fetch("/api/dashboard/api-key", { method: "POST" });
    const body = await res.json();
    if (body.data?.apiKey) {
      setApiKey(body.data.apiKey);
      setStore((prev) => prev ? { ...prev, apiKeyPrefix: body.data.apiKeyPrefix } : prev);
      setMessage("New API key generated! Copy it — it will only be shown once.");
    } else {
      setMessage(body.error || "Failed to generate key");
    }
  };

  const embedSnippet = `<script
  src="https://cdn.fitview.ai/widget.js"
  data-api-key="${apiKey ?? store?.apiKeyPrefix + "...redacted" ?? "YOUR_API_KEY"}"
  data-button-text="Try it on"
  data-button-color="#2563eb"
  async
></script>`;

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>;

  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <header>
        <h2 className="text-xl font-semibold text-white">Widget Settings</h2>
        <p className="mt-1 text-sm text-slate-300">
          Generate API key, define allowed origins, and copy installation snippet.
        </p>
      </header>

      {message && (
        <p className={`rounded-lg px-3 py-2 text-sm ${message.includes("Failed") || message.includes("error") ? "border border-rose-800/60 bg-rose-950/30 text-rose-200" : "border border-emerald-800/60 bg-emerald-950/30 text-emerald-200"}`}>
          {message}
        </p>
      )}

      {!store ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">Create your store to get started:</p>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            placeholder="Store name (e.g. My Dance Boutique)"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
          <button
            onClick={createStore}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Create Store & Generate API Key
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1 text-sm">
              <span className="text-slate-400">Store</span>
              <p className="text-slate-100 font-medium">{store.name}</p>
            </div>
            <div className="space-y-1 text-sm">
              <span className="text-slate-400">Current key prefix</span>
              <p className="font-mono text-slate-100">{store.apiKeyPrefix}...</p>
            </div>
            <div className="space-y-1 text-sm">
              <span className="text-slate-400">Plan</span>
              <p className="text-slate-100">{store.plan}</p>
            </div>
            <div className="space-y-1 text-sm">
              <span className="text-slate-400">Try-ons this month</span>
              <p className="text-slate-100">{store.tryonsThisMonth}</p>
            </div>
          </div>

          <p className="rounded-lg border border-cyan-800/60 bg-cyan-950/30 px-3 py-2 text-sm text-cyan-200">
            Usage resets on the 1st of each month (UTC)
          </p>

          {apiKey && (
            <div className="space-y-1">
              <p className="text-sm text-emerald-300 font-semibold">Your API key (copy now — shown only once):</p>
              <pre className="overflow-auto rounded-lg border border-emerald-800 bg-slate-950 p-3 text-xs text-emerald-300 select-all">
                {apiKey}
              </pre>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-slate-300">Install snippet</p>
            <pre className="overflow-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200">
              <code>{embedSnippet}</code>
            </pre>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={generateKey}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950"
            >
              Generate New API Key
            </button>
          </div>
        </>
      )}
    </section>
  );
}
