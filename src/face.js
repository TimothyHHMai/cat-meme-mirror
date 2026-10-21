// MediaPipe Face Landmarker setup and feature extraction (blendshapes + head roll).
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Pinned to the installed package version so the wasm matches the JS bundle.
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// Outer eye corners in the 478-point face mesh (subject's right, subject's left).
const RIGHT_EYE_OUTER = 33;
const LEFT_EYE_OUTER = 263;

export async function createFaceTracker() {
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
  const options = (delegate) => ({
    baseOptions: { modelAssetPath: MODEL_URL, delegate },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: true,
  });

  let landmarker;
  try {
    landmarker = await FaceLandmarker.createFromOptions(fileset, options('GPU'));
  } catch {
    landmarker = await FaceLandmarker.createFromOptions(fileset, options('CPU'));
  }

  // Returns { blendshapes: { name: score }, headRoll } or null when no face is found.
  // Pass the unmirrored video: blendshape Left/Right refer to the subject's face.
  return function detect(video, timestamp) {
    const result = landmarker.detectForVideo(video, timestamp);
    if (!result.faceLandmarks.length || !result.faceBlendshapes.length) return null;

    const blendshapes = {};
    for (const { categoryName, score } of result.faceBlendshapes[0].categories) {
      blendshapes[categoryName] = score;
    }
    const headRoll = computeHeadRoll(result.faceLandmarks[0], video.videoWidth, video.videoHeight);
    return { blendshapes, headRoll };
  };
}

// Degrees; positive when the head tilts toward the subject's left shoulder.
// Landmarks are normalized per axis, so rescale to pixels before taking the angle.
function computeHeadRoll(landmarks, width, height) {
  const r = landmarks[RIGHT_EYE_OUTER];
  const l = landmarks[LEFT_EYE_OUTER];
  return (Math.atan2((l.y - r.y) * height, (l.x - r.x) * width) * 180) / Math.PI;
}
