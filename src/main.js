// App shell: layout, webcam, render loop.
import './ui/style.css';
import { renderLayout, createMemeView } from './ui/layout.js';
import { createDebugDrawer } from './ui/debug.js';
import { startCamera, CameraError } from './camera.js';
import { createFaceTracker } from './face.js';
import { createHandTracker } from './hands.js';
import { predict } from './classifiers/rules.js';

const app = document.querySelector('#app');
const manifest = await fetch(`${import.meta.env.BASE_URL}cats/manifest.json`).then((r) => r.json());

renderLayout(app, manifest);
const video = document.querySelector('#webcam');
const status = document.querySelector('#camera-panel .status');
const updateDebug = createDebugDrawer(document.querySelector('#debug'));
const showMeme = createMemeView(app, manifest);

try {
  await startCamera(video);
  status.textContent = 'Loading face and hand trackers…';
  const [detectFace, detectHands] = await Promise.all([createFaceTracker(), createHandTracker()]);
  status.textContent = '';
  run(detectFace, detectHands);
} catch (err) {
  status.textContent = err instanceof CameraError ? err.message : `Something went wrong: ${err.message}`;
  status.classList.add('error');
  console.error(err);
}

function run(detectFace, detectHands) {
  let lastVideoTime = -1;
  const tick = () => {
    // Only run detection on new video frames.
    if (video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const now = performance.now();
      const face = detectFace(video, now);
      const hands = detectHands(video, now);
      status.textContent = face ? '' : 'No face found';
      showMeme(predict({ face, hands }).label);
      updateDebug(face, hands);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
