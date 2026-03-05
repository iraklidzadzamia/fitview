import http from "node:http";
import { createTryOnWorker } from "./src/lib/queue/worker";

const worker = createTryOnWorker();

console.log("FitView worker started, listening for jobs...");

// Railway requires a service to bind to PORT to be considered healthy
const PORT = process.env.PORT ?? "3001";
const healthServer = http.createServer((req, res) => {
    if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", worker: "running" }));
    } else {
        res.writeHead(404);
        res.end();
    }
});

healthServer.listen(PORT, () => {
    console.log(`Worker health server listening on port ${PORT}`);
});

async function shutdown() {
    console.log("Shutting down worker...");
    await worker.close();
    healthServer.close();
    process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
