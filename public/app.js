const { presets } = await (await fetch('/api/factors')).json();
const ids = ["diffLines", "changedPathCovered", "rollbackRehearsed", "featureFlag", "someoneWatching"];
const inputs = () => Object.fromEntries(
  ids.map((id) => [id, id === 'diffLines' ? +document.getElementById(id).value : document.getElementById(id).checked]),
);

const presetsEl = document.getElementById('presets');
for (const [key, p] of Object.entries(presets)) {
  const b = document.createElement('button');
  b.textContent = p.label;
  b.onclick = () => {
    document.getElementById('diffLines').value = p.diffLines;
    for (const id of ids) if (id !== 'diffLines') document.getElementById(id).checked = p[id];
    go();
  };
  presetsEl.appendChild(b);
}

async function go() {
  const body = JSON.stringify(inputs());
  const [r, s] = await Promise.all([
    (await fetch('/api/score', { method: 'POST', body })).json(),
    (await fetch('/api/simulate', { method: 'POST', body })).json(),
  ]);
  document.getElementById('result').hidden = false;
  document.getElementById('sim').hidden = false;
  const el = document.getElementById('score');
  el.textContent = r.score + ' / 100';
  el.className = 'score ' + (r.score >= 45 ? 'high' : r.score >= 25 ? 'mid' : 'low');
  document.getElementById('verdict').textContent = 'verdict: ' + r.verdict;
  document.getElementById('drivers').innerHTML = r.drivers.map((d) =>
    `<div class="drv"><span class="pts">+${d.points}</span><span>${d.factor} <span class="det">— ${d.detail}</span></span></div>`).join('')
    || '<div class="drv"><span class="det">no risk drivers — deploy is boring, ship it</span></div>';
  document.getElementById('events').innerHTML = s.events.map((e) =>
    `<div class="ev"><span class="st">${e.step}.</span>${e.text} → <span class="out">${e.outcome}</span></div>`).join('');
}
document.getElementById('go').onclick = go;
