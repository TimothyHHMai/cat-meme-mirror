// Rule-based meme classifier. predict(features) → { label, scores }
// features: { face: { blendshapes, headRoll } | null, hands: [{ gesture, gestureScore, ... }] }

// Blendshapes that mean the face is doing *something*; all must stay low for a neutral face.
const EXPRESSIVE = [
  'mouthSmileLeft',
  'mouthSmileRight',
  'mouthFrownLeft',
  'mouthFrownRight',
  'jawOpen',
  'browInnerUp',
  'browDownLeft',
  'browDownRight',
  'eyeWideLeft',
  'eyeWideRight',
];
const NEUTRAL_MAX = 0.35;
const GESTURE_MIN = 0.6;
const SHOCKED_JAW_MIN = 0.4;
const SHOCKED_BROWS_UP_MIN = 0.4;
const HAPPY_SMILE_MIN = 0.5;
const EVIL_JAW_MIN = 0.3;
const RIGBY_TONGUE_MIN = 0.2;
const RIGBY_JAW_MIN = 0.2;
const SIDE_EYE_ROLL_MIN = 15;
const SIDE_EYE_JAW_MAX = 0.2;
const ANGRY_BROW_DOWN_MIN = 0.25;
const SIDE_EYE_SQUINT_MIN = 0.2; // absolute fallback until the eye baseline settles
const SIDE_EYE_SQUINT_DELTA = 0.12; // how far past the resting baseline counts as a squint
const SIDE_EYE_BLINK_MAX = 0.8;
const BASELINE_ROLL_MAX = 8;
const BASELINE_RATE = 0.05;
const BASELINE_MIN_FRAMES = 30;

// Resting eye narrowness, learned from relaxed, level frames so the squint check
// adapts to each face and lighting.
const eyeBaseline = { value: 0, frames: 0 };

export function predict({ face, hands }) {
  const pointingUp = hands.some((h) => h.gesture === 'Pointing_Up' && h.gestureScore >= GESTURE_MIN);
  if (pointingUp && face && isNeutral(face.blendshapes)) {
    return { label: 'erm_actually', scores: { erm_actually: 1 } };
  }
  const shaka = hands.some((h) => h.gesture === 'Shaka');
  if (shaka && face && isTongueOut(face.blendshapes)) {
    return { label: 'rigby', scores: { rigby: 1 } };
  }
  if (face) updateEyeBaseline(face);
  if (face && isEvil(face.blendshapes)) {
    return { label: 'evil', scores: { evil: 1 } };
  }
  if (face && isSideEye(face)) {
    return { label: 'side_eye', scores: { side_eye: 1 } };
  }
  if (face && isAngry(face.blendshapes)) {
    return { label: 'angry', scores: { angry: 1 } };
  }
  if (face && isShocked(face.blendshapes)) {
    return { label: 'shocked', scores: { shocked: 1 } };
  }
  if (face && isHappy(face.blendshapes)) {
    return { label: 'happy', scores: { happy: 1 } };
  }
  return { label: 'neutral', scores: { neutral: 1 } };
}

// Open mouth plus raised eyebrows: either the inner brows or both outer brows (averaged
// so a slight asymmetry still counts).
function isShocked(b) {
  const outerUp = ((b.browOuterUpLeft ?? 0) + (b.browOuterUpRight ?? 0)) / 2;
  const browsUp = Math.max(b.browInnerUp ?? 0, outerUp);
  return (b.jawOpen ?? 0) >= SHOCKED_JAW_MIN && browsUp >= SHOCKED_BROWS_UP_MIN;
}

// MediaPipe's tongueOut blendshape barely fires in practice, so an open jaw also counts;
// the shaka requirement keeps this from triggering on its own.
function isTongueOut(b) {
  return (b.tongueOut ?? 0) >= RIGBY_TONGUE_MIN || (b.jawOpen ?? 0) >= RIGBY_JAW_MIN;
}

// Head tilted either way, mouth closed, eyes narrowed but not shut. MediaPipe often reports
// narrowed eyes as a partial blink rather than a squint, so either counts.
function isSideEye({ blendshapes: b, headRoll }) {
  return (
    Math.abs(headRoll) >= SIDE_EYE_ROLL_MIN &&
    (b.jawOpen ?? 0) < SIDE_EYE_JAW_MAX &&
    isSquinting(b) &&
    eyeBlink(b) < SIDE_EYE_BLINK_MAX
  );
}

function isSquinting(b) {
  if (eyeBaseline.frames < BASELINE_MIN_FRAMES) return eyeNarrowness(b) >= SIDE_EYE_SQUINT_MIN;
  return eyeNarrowness(b) - eyeBaseline.value >= SIDE_EYE_SQUINT_DELTA;
}

// Only learn from relaxed, level frames that aren't already squinting, so holding a
// squint doesn't drag the baseline up with it.
function updateEyeBaseline({ blendshapes: b, headRoll }) {
  if (Math.abs(headRoll) > BASELINE_ROLL_MAX || !isNeutral(b) || eyeBlink(b) >= SIDE_EYE_BLINK_MAX) return;
  const narrow = eyeNarrowness(b);
  if (eyeBaseline.frames >= BASELINE_MIN_FRAMES && narrow - eyeBaseline.value >= SIDE_EYE_SQUINT_DELTA) return;
  eyeBaseline.value = eyeBaseline.frames ? eyeBaseline.value + (narrow - eyeBaseline.value) * BASELINE_RATE : narrow;
  eyeBaseline.frames++;
}

function eyeNarrowness(b) {
  const squint = ((b.eyeSquintLeft ?? 0) + (b.eyeSquintRight ?? 0)) / 2;
  return Math.max(squint, eyeBlink(b));
}

function eyeBlink(b) {
  return ((b.eyeBlinkLeft ?? 0) + (b.eyeBlinkRight ?? 0)) / 2;
}

// Both brows pulled down (averaged so a slight asymmetry still counts).
function isAngry(b) {
  const browDown = ((b.browDownLeft ?? 0) + (b.browDownRight ?? 0)) / 2;
  return browDown >= ANGRY_BROW_DOWN_MIN;
}

// A smile with the jaw dropped open. Checked before shocked and happy, since it's a
// stricter version of happy and a grin can also lift the brows.
function isEvil(b) {
  return isHappy(b) && (b.jawOpen ?? 0) >= EVIL_JAW_MIN;
}

// Smile on both sides of the mouth (averaged so a slight asymmetry still counts).
function isHappy(b) {
  const smile = ((b.mouthSmileLeft ?? 0) + (b.mouthSmileRight ?? 0)) / 2;
  return smile >= HAPPY_SMILE_MIN;
}

function isNeutral(blendshapes) {
  return EXPRESSIVE.every((name) => (blendshapes[name] ?? 0) < NEUTRAL_MAX);
}
