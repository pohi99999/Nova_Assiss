#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const net = require('net');
const fs = require('fs');

function waitForPort(host, port, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function check() {
      const socket = new net.Socket();
      socket.setTimeout(2000);
      socket.once('error', () => {
        socket.destroy();
        if (Date.now() - start >= timeoutMs) return reject(new Error('timeout'));
        setTimeout(check, 200);
      });
      socket.once('timeout', () => {
        socket.destroy();
        if (Date.now() - start >= timeoutMs) return reject(new Error('timeout'));
        setTimeout(check, 200);
      });
      socket.connect(port, host, () => {
        socket.end();
        resolve();
      });
    })();
  });
}

const PORT = process.env.PORT || '3005';
const HOST = process.env.HOSTNAME || '127.0.0.1';

const standalonePath = '.next/standalone/server.js';
let server;
if (fs.existsSync(standalonePath)) {
  console.log(`[run-e2e-ci] starting standalone server on ${HOST}:${PORT}`);
  server = spawn('node', [standalonePath], {
    env: { ...process.env, PORT, HOSTNAME: HOST },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} else {
  console.log(`[run-e2e-ci] standalone server not found; falling back to dev server (node node_modules/next/dist/bin/next dev -p ${PORT})`);
  // Fall back to running the dev server so tests can run locally when standalone build is absent
  // Use direct node invocation of next CLI to avoid relying on 'npx' being present in PATH
  const nextCli = 'node';
  const nextArgs = ['node_modules/next/dist/bin/next', 'dev', '-p', PORT];
  server = spawn(nextCli, nextArgs, {
    env: { ...process.env, PORT, HOSTNAME: HOST },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

server.stdout.on('data', (d) => process.stdout.write(`[standalone] ${d}`));
server.stderr.on('data', (d) => process.stderr.write(`[standalone-err] ${d}`));

let killed = false;
function shutdown(code = 0) {
  if (!killed) {
    killed = true;
    try { server.kill(); } catch (e) { /* ignore */ }
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(137));

(async () => {
  try {
    await waitForPort(HOST, parseInt(PORT, 10), 120000);
    console.log('[run-e2e-ci] standalone server is up — running Playwright tests');
    try {
      execSync('npm run test:e2e --silent', { stdio: 'inherit' });
      shutdown(0);
    } catch (e) {
      console.error('[run-e2e-ci] tests failed', e && e.message);
      shutdown(e.status || 1);
    }
  } catch (e) {
    console.error('[run-e2e-ci] timed out waiting for server to start', e && e.message);
    shutdown(2);
  }
})();
