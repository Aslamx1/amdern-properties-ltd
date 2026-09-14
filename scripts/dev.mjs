import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const serverDir = path.resolve(rootDir, "server");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";
const npxCmd = isWindows ? "npx.cmd" : "npx";

console.log("\n=======================================================");
console.log("  Starting Amdern Properties SMC Full-Stack Environment");
console.log("  Frontend: http://localhost:5173");
console.log("  Backend:  http://localhost:5000");
console.log("=======================================================\n");

function startProcess(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "pipe",
    shell: true,
  });

  child.stdout.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        console.log(`[${name}] ${line}`);
      }
    }
  });

  child.stderr.on("data", (data) => {
    const lines = data.toString().trim().split("\n");
    for (const line of lines) {
      if (line.trim()) {
        console.error(`[${name}] ${line}`);
      }
    }
  });

  child.on("error", (err) => {
    console.error(`[${name}] Failed to start:`, err.message);
  });

  child.on("exit", (code) => {
    console.log(`[${name}] Exited with code ${code}`);
  });

  return child;
}

const backendProcess = startProcess("backend", npmCmd, ["run", "dev"], serverDir);
const frontendProcess = startProcess("frontend", npxCmd, ["vite", "dev"], rootDir);

function cleanup() {
  console.log("\nShutting down servers...");
  try {
    if (isWindows) {
      if (backendProcess.pid) spawn("taskkill", ["/pid", backendProcess.pid.toString(), "/f", "/t"]);
      if (frontendProcess.pid) spawn("taskkill", ["/pid", frontendProcess.pid.toString(), "/f", "/t"]);
    } else {
      backendProcess.kill("SIGTERM");
      frontendProcess.kill("SIGTERM");
    }
  } catch (err) {
    // Ignore cleanup error on exit
  }
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
