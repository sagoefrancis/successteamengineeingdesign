const cadGrid = document.getElementById('cadGrid');
const previousCad = document.getElementById('previousCad');
const nextCad = document.getElementById('nextCad');
const cadDots = document.getElementById('cadDots');
let activeCad = 0;
let cachedCadSamples = [];

async function loadCadSamples() {
  cachedCadSamples = await getCadSamples();
  renderCadSamples();
}

function renderCadSamples() {
  const samples = cachedCadSamples;
  if (!samples.length) {
    cadGrid.innerHTML = '<div class="cad-empty">CAD modeling samples will appear here when published from the admin platform.</div>';
    previousCad.disabled = true;
    nextCad.disabled = true;
    cadDots.innerHTML = '';
    return;
  }
  cadGrid.innerHTML = '';
  activeCad = Math.min(activeCad, samples.length - 1);
  const sample = samples[activeCad];
  {
    const card = document.createElement('article');
    card.className = `cad-card${activeCad % 3 === 1 ? ' featured-cad' : ''}`;
    card.innerHTML = `<div class="cad-visual uploaded-cad-visual"><img alt="${sample.title} CAD design" src="${sample.imageData}"><span>CAD / ${String(activeCad + 1).padStart(2, '0')}</span></div><div class="cad-caption"><h3></h3><p></p></div>`;
    card.querySelector('h3').textContent = sample.title;
    card.querySelector('p').textContent = sample.description;
    cadGrid.appendChild(card);
  }
  previousCad.disabled = samples.length < 2;
  nextCad.disabled = samples.length < 2;
  cadDots.innerHTML = samples.map((_, index) => `<button type="button" class="cad-dot${index === activeCad ? ' active' : ''}" aria-label="Show CAD sample ${index + 1}" data-index="${index}"></button>`).join('');
  cadDots.querySelectorAll('button').forEach((dot) => dot.addEventListener('click', () => { activeCad = Number(dot.dataset.index); renderCadSamples(); }));
}

function moveCad(direction) {
  const samples = cachedCadSamples;
  if (samples.length < 2) return;
  activeCad = (activeCad + direction + samples.length) % samples.length;
  renderCadSamples();
}

previousCad.addEventListener('click', () => moveCad(-1));
nextCad.addEventListener('click', () => moveCad(1));
loadCadSamples();
