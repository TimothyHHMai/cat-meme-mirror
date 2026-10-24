// MediaPipe Gesture Recognizer setup: per-hand canned gesture + landmarks.
import { GestureRecognizer } from '@mediapipe/tasks-vision';
import { createVisionTask } from './mediapipe.js';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

export async function createHandTracker() {
  const recognizer = await createVisionTask(GestureRecognizer, MODEL_URL, { numHands: 2 });

  // Returns [{ handedness, gesture, gestureScore, landmarks }], empty when no hands are found.
  // gesture is one of None, Closed_Fist, Open_Palm, Pointing_Up, Thumb_Down, Thumb_Up,
  // Victory, ILoveYou, plus Shaka (detected from landmarks below). landmarks are the 21 normalized hand points.
  return function detect(video, timestamp) {
    const result = recognizer.recognizeForVideo(video, timestamp);
    return result.landmarks.map((landmarks, i) => {
      const [gesture] = result.gestures[i];
      const shaka = isShaka(landmarks);
      return {
        // Already refers to the subject's own hand for the unmirrored video we pass.
        handedness: result.handedness[i][0].categoryName,
        gesture: shaka ? 'Shaka' : gesture.categoryName,
        gestureScore: shaka ? 1 : gesture.score,
        landmarks,
      };
    });
  };
}

// Hand landmark indices: wrist, then [tip, pip] per finger, and the thumb's tip / IP / index knuckle.
const WRIST = 0;
const THUMB_TIP = 4;
const THUMB_IP = 3;
const INDEX_MCP = 5;
const FINGERS = { index: [8, 6], middle: [12, 10], ring: [16, 14], pinky: [20, 18] };

// Thumb and pinky out, the middle three curled. Not one of the recognizer's canned gestures.
function isShaka(lm) {
  const extended = ([tip, pip]) => dist(lm[WRIST], lm[tip]) > dist(lm[WRIST], lm[pip]);
  const thumbOut = dist(lm[THUMB_TIP], lm[INDEX_MCP]) > dist(lm[THUMB_IP], lm[INDEX_MCP]) * 1.3;
  return (
    thumbOut &&
    extended(FINGERS.pinky) &&
    !extended(FINGERS.index) &&
    !extended(FINGERS.middle) &&
    !extended(FINGERS.ring)
  );
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
