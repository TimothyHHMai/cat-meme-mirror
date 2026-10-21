// Webcam access with friendly messages for the ways it can fail.
export async function startCamera(video) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new CameraError("This browser can't access a camera. Try a recent Chrome, Firefox or Safari.");
  }
  try {
    video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
  } catch (err) {
    throw new CameraError(messageFor(err));
  }
  await video.play();
}

function messageFor(err) {
  switch (err.name) {
    case 'NotAllowedError':
      return 'Camera access was blocked. Allow it in your browser\'s site settings and reload. Nothing leaves your device.';
    case 'NotFoundError':
      return 'No camera found. Plug one in and reload.';
    case 'NotReadableError':
      return 'Your camera is busy in another app. Close it there and reload.';
    default:
      return `Couldn't start the camera (${err.name}).`;
  }
}

export class CameraError extends Error {}
