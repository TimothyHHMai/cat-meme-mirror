# Cat Meme Mirror

Make a face at the webcam and the page shows which cat meme you're doing, in real time.
Everything runs locally in the browser; no video leaves the device.

## Run

```sh
npm install
npm run dev
```

## Layout

```
public/cats/<label-id>/   meme images; manifest.json maps label id → meme name, sources, licenses
src/main.js               app shell, webcam, render loop
src/mediapipe.js          shared MediaPipe wasm/task setup
src/face.js               face landmarks, feature extraction
src/hands.js              hand landmarks, gesture recognition
src/classifiers/          rules.js and trained.js, both predict(features) → { label, scores }
src/smoothing.js          score smoothing + hysteresis
src/recorder.js           recording mode, JSON export/import
src/ui/                   panels, debug drawer, snapshot
data/recordings/          exported feature JSON
notebooks/                training notebook
models/                   trained model JSON
```
