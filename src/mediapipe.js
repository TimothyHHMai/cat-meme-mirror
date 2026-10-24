// Shared MediaPipe task setup: wasm fileset + GPU-with-CPU-fallback creation.
import { FilesetResolver } from '@mediapipe/tasks-vision';

// Pinned to the installed package version so the wasm matches the JS bundle.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';

let filesetPromise;

export async function createVisionTask(TaskClass, modelUrl, options) {
  filesetPromise ??= FilesetResolver.forVisionTasks(WASM_URL);
  const fileset = await filesetPromise;
  const withDelegate = (delegate) => ({
    baseOptions: { modelAssetPath: modelUrl, delegate },
    runningMode: 'VIDEO',
    ...options,
  });

  try {
    return await TaskClass.createFromOptions(fileset, withDelegate('GPU'));
  } catch {
    return TaskClass.createFromOptions(fileset, withDelegate('CPU'));
  }
}
