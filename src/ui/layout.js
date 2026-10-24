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
        <figure class="meme-card">
          <img alt="" hidden />
          <figcaption></figcaption>
        </figure>
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

// Shows the meme for label in the card and highlights it in the list.
export function createMemeView(root, manifest) {
  const img = root.querySelector('.meme-card img');
  const caption = root.querySelector('.meme-card figcaption');
  const items = root.querySelectorAll('.scores li');
  let current;
  const lastImage = {};

  // Random image for the label, avoiding the one it showed last time when there are several.
  function pickImage(label, images) {
    const choices = images.length > 1 ? images.filter((i) => i !== lastImage[label]) : images;
    lastImage[label] = choices[Math.floor(Math.random() * choices.length)];
    return lastImage[label];
  }

  function show(label) {
    if (label === current) return;
    current = label;
    const { name, images } = manifest[label];
    caption.textContent = name;
    img.hidden = !images.length;
    if (images.length) {
      img.src = `${import.meta.env.BASE_URL}cats/${label}/${encodeURIComponent(pickImage(label, images))}`;
      img.alt = name;
    }
    for (const li of items) li.classList.toggle('active', li.dataset.label === label);
  }

  show('neutral');
  return show;
}
