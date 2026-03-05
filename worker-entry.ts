import { createTryOnWorker } from "./src/lib/queue/worker";

const worker = createTryOnWorker();

console.log("FitView worker started, listening for jobs...");

process.on("SIGTERM", async () => {
    console.log("SIGTERM received, closing worker...");
    await worker.close();
    process.exit(0);
});

process.on("SIGINT", async () => {
    console.log("SIGINT received, closing worker...");
    await worker.close();
    process.exit(0);
});
