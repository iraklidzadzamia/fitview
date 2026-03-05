import { WidgetConfigurator } from "@/components/dashboard/WidgetConfigurator";

export default function SettingsPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard / Widget Settings</h1>
        <p className="mt-2 text-sm text-slate-300">Configure embed behavior and integration settings.</p>
      </header>
      <WidgetConfigurator />
    </main>
  );
}
