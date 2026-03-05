import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import path from "node:path";

async function run() {
  const outdir = path.join(process.cwd(), "widget", "dist");
  await mkdir(outdir, { recursive: true });

  await build({
    entryPoints: [path.join(process.cwd(), "widget", "src", "index.ts")],
    outfile: path.join(outdir, "widget.js"),
    bundle: true,
    minify: true,
    format: "iife",
    target: ["es2019"],
    platform: "browser",
    sourcemap: false,
    legalComments: "none"
  });
}

run().catch((error) => {
  console.error("[FitView] Widget build failed");
  console.error(error);
  process.exitCode = 1;
});
