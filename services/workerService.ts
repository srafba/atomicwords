/**
 * workerService.ts
 * Main-thread wrapper around the solver Web Worker.
 * Provides a Promise-based API so callers await results without blocking the UI.
 */

let worker: Worker | null = null;

/** Pending solve callbacks keyed by request id */
const pending = new Map<string, (words: string[]) => void>();

let idCounter = 0;

const getWorker = (): Worker => {
  if (worker) return worker;

  // `new Worker(new URL(...), { type: 'module' })` is the standard Vite + TS pattern.
  // Vite bundles the worker file at build time; TypeScript understands `new URL` imports.
  worker = new Worker(new URL('./solver.worker.ts', import.meta.url), { type: 'module' });
  worker.onmessage = (e: MessageEvent) => {
    const { type } = e.data;
    if (type === 'RESULT') {
      const resolve = pending.get(e.data.id);
      if (resolve) {
        resolve(e.data.words);
        pending.delete(e.data.id);
      }
    }
    // LARGE_READY / CUSTOM_READY are informational — nothing to do on main thread
  };
  worker.onerror = (err) => {
    console.error('[SolverWorker] error:', err);
  };

  return worker;
};

/**
 * Solve anagrams off the main thread.
 * Returns a Promise that resolves with the sorted word list.
 */
export const solveAnagramsAsync = (master: string, minLength: number = 3): Promise<string[]> => {
  const w = getWorker();
  const id = `solve_${++idCounter}`;
  return new Promise((resolve) => {
    pending.set(id, resolve);
    w.postMessage({ type: 'SOLVE', id, master, minLength });
  });
};

/**
 * Push the large CDN dictionary into the worker after it finishes loading.
 * Words are transferred as a plain array (serialized automatically).
 */
export const updateWorkerLargeDictionary = (words: string[]): void => {
  getWorker().postMessage({ type: 'UPDATE_LARGE', words });
};

/**
 * Push a custom dictionary update into the worker.
 */
export const updateWorkerCustomDictionary = (words: string[]): void => {
  getWorker().postMessage({ type: 'UPDATE_CUSTOM', words });
};
