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
cat-meme-mirror/
├── index.html
├── package.json
├── public/
│   └── cats/
│       ├── manifest.json        maps label ids to meme names, sources, licenses
│       ├── confused/            meme images, one folder per label id
│       ├── happy/
│       ├── neutral/
│       ├── sad/
│       ├── shocked/
│       ├── smug/
│       └── unimpressed/
├── src/
│   ├── main.js                  app shell, render loop
│   ├── camera.js                webcam access + error messages
│   ├── mediapipe.js             shared MediaPipe wasm/task setup
│   ├── face.js                  face landmarks, feature extraction
│   ├── hands.js                 hand landmarks, gesture recognition
│   ├── smoothing.js             score smoothing + hysteresis
│   ├── recorder.js              recording mode, JSON export/import
│   ├── classifiers/             both export predict(features), returning { label, scores }
│   │   ├── rules.js
│   │   └── trained.js
│   └── ui/
│       ├── layout.js            webcam + meme panels
│       ├── debug.js             debug drawer
│       └── style.css
├── data/
│   └── recordings/              exported feature JSON
├── notebooks/                   training notebook
└── models/                      trained model JSON
```
