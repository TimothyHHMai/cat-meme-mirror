// App shell: layout, webcam, render loop.
import './ui/style.css';
import { renderLayout } from './ui/layout.js';
import { createDebugDrawer } from './ui/debug.js';
import { startCamera, CameraError } from './camera.js';
import { createFaceTracker } from './face.js';

const app = document.querySelector('#app');
const manifest = await fetch(`${import.meta.env.BASE_URL}cats/manifest.json`).then((r) => r.json());

renderLayout(app, manifest);
const video = document.querySelector('#webcam');
const status = document.querySelector('#camera-panel .status');
const updateDebug = createDebugDrawer(document.querySelector('#debug'));

try {
  await startCamera(video);
  status.textContent = 'Loading face tracker…';
  const detect = await createFaceTracker();
  status.textContent = '';
  run(detect);
} catch (err) {
  status.textContent = err instanceof CameraError ? err.message : `Something went wrong: ${err.message}`;
  status.classList.add('error');
  console.error(err);
}

function run(detect) {
  let lastVideoTime = -1;
  const tick = () => {
    // Only run detection on new video frames.
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const features = detect(video, performance.now());
      status.textContent = features ? '' : 'No face found';
      updateDebug(features);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
