import { CatalogUploader } from "@/components/dashboard/CatalogUploader";

export default function CatalogPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard / Catalog</h1>
        <p className="mt-2 text-sm text-slate-300">Manage clothing items available for virtual try-on.</p>
      </header>
      <CatalogUploader />
    </main>
  );
}
