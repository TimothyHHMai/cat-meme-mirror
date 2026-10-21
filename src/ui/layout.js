// Two panels: mirrored webcam on the left, matched cat meme on the right.
export function renderLayout(root, manifest) {
  root.innerHTML = `
    <header><h1>Cat Meme Mirror</h1></header>
    <main class="panels">
      <section class="panel" id="camera-panel">
        <video id="webcam" playsinline muted></video>
        <p class="status">Starting camera…</p>
      </section>
      <section class="panel" id="meme-panel">
        <div class="meme-card">${manifest.neutral.name}</div>
        <ul class="scores">
          ${Object.entries(manifest)
            .map(([label, { name }]) => `<li data-label="${label}">${name}</li>`)
            .join('')}
        </ul>
      </section>
    </main>
    <details class="debug" id="debug"></details>
  `;
}
