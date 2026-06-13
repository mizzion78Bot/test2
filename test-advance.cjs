import { JSDOM } from 'jsdom';
import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { url: 'https://mizzion78bot.github.io/test2/', resources: 'usable', pretendToBeVisual: true, runScripts: 'dangerously' });

setTimeout(() => {
  const { document, window } = dom;

  // Make timers fast-forwardable manually
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
  window.cancelAnimationFrame = clearTimeout;
  const pendingTimers = new Map();
  let timerId = 0;
  const originalSetTimeout = window.setTimeout;
  const originalClearTimeout = window.clearTimeout;
  window.setTimeout = (cb, ms) => {
    const id = ++timerId;
    pendingTimers.set(id, { cb, ms, createdAt: performance.now() });
    return id;
  };
  window.clearTimeout = (id) => pendingTimers.delete(id);

  function runTimers() {
    for (const [id, { cb, ms, createdAt }] of pendingTimers.entries()) {
      if (performance.now() - createdAt >= ms) {
        pendingTimers.delete(id);
        try { cb(); } catch (e) { console.error('[timer error]', e.message); }
      }
    }
  }

  for (let i = 0; i < 100; i++) { runTimers(); }

  const msgEl = document.getElementById('message');
  let currentPigs = () => 0;

  // Small harness
  const start = performance.now();
  while (performance.now() - start < 500) { runTimers(); }

  // After loadLevel should have Level 1 active
  const m1 = msgEl?.textContent?.trim() || '';
  console.log('Start message:', m1);

  // Simulate clearing all pigs and advance
  if (typeof window.__test_killAllPigs === 'function') {
    window.__test_killAllPigs();
  }
  for (let i = 0; i < 200; i++) { runTimers(); }

  const mAfter = msgEl?.textContent?.trim() || '';
  console.log('After kill message:', mAfter);

  // Force windows - check if a level change occurred
  console.log('Advance test ended.');
}, 300);
