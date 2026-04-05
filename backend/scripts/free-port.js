const { execSync } = require('child_process');

const port = Number(process.env.PORT) || 5000;

function run(command) {
  return execSync(command, {
    stdio: ['ignore', 'pipe', 'ignore'],
    encoding: 'utf8'
  }).trim();
}

function killWindowsListeners(targetPort) {
  let output = '';
  try {
    output = run(`netstat -ano -p tcp | findstr :${targetPort}`);
  } catch {
    return;
  }

  const pids = new Set();

  for (const line of output.split(/\r?\n/)) {
    const normalized = line.trim().replace(/\s+/g, ' ');
    if (!normalized) continue;
    if (!normalized.includes('LISTENING')) continue;

    const parts = normalized.split(' ');
    const pid = Number(parts[parts.length - 1]);
    if (!pid || pid === process.pid) continue;

    pids.add(pid);
  }

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`[prestart] Freed port ${targetPort} by stopping PID ${pid}`);
    } catch {
      // Ignore failures, startup will still report if port remains busy.
    }
  }
}

function killUnixListeners(targetPort) {
  let output = '';
  try {
    output = run(`lsof -ti tcp:${targetPort}`);
  } catch {
    return;
  }

  for (const pidText of output.split(/\r?\n/)) {
    const pid = Number(pidText.trim());
    if (!pid || pid === process.pid) continue;

    try {
      process.kill(pid, 'SIGKILL');
      console.log(`[prestart] Freed port ${targetPort} by stopping PID ${pid}`);
    } catch {
      // Ignore failures, startup will still report if port remains busy.
    }
  }
}

if (process.platform === 'win32') {
  killWindowsListeners(port);
} else {
  killUnixListeners(port);
}
