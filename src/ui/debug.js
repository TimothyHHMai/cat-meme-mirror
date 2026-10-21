// Debug drawer: live bars for the strongest blendshapes and head roll, for tuning thresholds.
const TOP_N = 12;

export function createDebugDrawer(root) {
  root.innerHTML = `
    <summary>Debug</summary>
    <p class="debug-roll">Head roll: <span>–</span></p>
    <ol class="debug-bars"></ol>
  `;
  const roll = root.querySelector('.debug-roll span');
  const bars = root.querySelector('.debug-bars');

  return function update(features) {
    if (!root.open) return;
    if (!features) {
      roll.textContent = 'no face';
      bars.innerHTML = '';
      return;
    }
    roll.textContent = `${features.headRoll.toFixed(1)}°`;
    bars.innerHTML = Object.entries(features.blendshapes)
      .filter(([name]) => name !== '_neutral')
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(
        ([name, score]) => `
          <li>
            <span class="debug-name">${name}</span>
            <span class="debug-bar"><span style="width: ${(score * 100).toFixed(0)}%"></span></span>
            <span class="debug-value">${score.toFixed(2)}</span>
          </li>`,
      )
      .join('');
  };
}
