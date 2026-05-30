import { execSync } from 'node:child_process';

const cwd = normalizePath(process.cwd());
const currentPid = String(process.pid);

function normalizePath(input) {
  return input.replace(/\\/g, '/').toLowerCase();
}

function listProcesses() {
  try {
    if (process.platform === 'win32') {
      const output = execSync(
        'powershell -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId,Name,CommandLine | ConvertTo-Json -Compress"',
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
      ).trim();

      if (!output) {
        return [];
      }

      const parsed = JSON.parse(output);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      return rows.map((row) => ({
        pid: String(row.ProcessId || ''),
        name: String(row.Name || ''),
        commandLine: String(row.CommandLine || ''),
      }));
    }

    const output = execSync('ps -ax -o pid=,comm=,args=', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    if (!output) {
      return [];
    }

    return output
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const match = line.match(/^(\d+)\s+(\S+)\s+(.+)$/);
        if (!match) {
          return null;
        }

        return {
          pid: match[1],
          name: match[2],
          commandLine: match[3],
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function isNextDevProcess(commandLine, name) {
  const normalizedCommand = normalizePath(commandLine);
  const normalizedName = normalizePath(name);

  if (!normalizedCommand.includes(cwd)) {
    return false;
  }

  const hasNextBinary =
    normalizedCommand.includes('/next/dist/bin/next') ||
    normalizedCommand.includes('\\next\\dist\\bin\\next') ||
    normalizedCommand.includes(' next dev') ||
    normalizedName === 'next' ||
    normalizedName === 'next.exe';

  return hasNextBinary && /\bdev\b/.test(normalizedCommand);
}

const processes = listProcesses();
const blocking = processes.filter((processInfo) => {
  if (!processInfo || !processInfo.commandLine) {
    return false;
  }

  if (processInfo.pid === currentPid) {
    return false;
  }

  return isNextDevProcess(processInfo.commandLine, processInfo.name);
});

if (blocking.length > 0) {
  const processSummary = blocking
    .map((processInfo) => `pid=${processInfo.pid} command=${processInfo.commandLine}`)
    .join('\n');

  console.error('[build-guard] 检测到当前项目已有 next dev 进程在运行。');
  console.error('[build-guard] 请先停止开发服务，再执行 pnpm build。');
  console.error(processSummary);
  process.exit(1);
}

console.info('[build-guard] 未发现运行中的 next dev 进程，允许继续构建。');
