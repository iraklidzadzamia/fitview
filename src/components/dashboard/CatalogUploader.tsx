export function CatalogUploader() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="text-xl font-semibold text-white">Catalog</h2>
      <p className="mt-2 text-sm text-slate-300">
        Upload clothing images, assign categories, and keep product try-on availability in sync.
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Item name</span>
          <input className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100" placeholder="Classic Denim Jacket" />
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-slate-300">Category</span>
          <select className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100">
            <option>TOP</option>
            <option>BOTTOM</option>
            <option>DRESS</option>
            <option>OUTERWEAR</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-5 text-center text-sm text-slate-400">
        Drag and drop product image or click to upload
        <input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" />
      </label>

      <div className="mt-4 flex gap-3">
        <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950">Save Item</button>
        <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200">Toggle Active</button>
      </div>
    </section>
  );
}
