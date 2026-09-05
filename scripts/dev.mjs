import { spawn } from "node:child_process";

const backend = spawn(process.execPath, ["--watch", "server.mjs"], {
  stdio: "inherit",
});
const frontend = spawn(process.execPath, ["node_modules/vite/bin/vite.js"], {
  stdio: "inherit",
});
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  backend.kill();
  frontend.kill();
  process.exitCode = code;
}
for (const child of [backend, frontend]) {
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => stop(code || 0));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
