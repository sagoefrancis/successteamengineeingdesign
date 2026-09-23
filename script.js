const requestButton = document.getElementById('requestButton');
const previewModal = document.getElementById('previewModal');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');
const previewImage = document.getElementById('previewImage');
const previewImageAsset = document.getElementById('previewImageAsset');
const previewLabel = document.getElementById('previewLabel');
const previewTitle = document.getElementById('previewTitle');
const previewMeta = document.getElementById('previewMeta');
const previewAbstract = document.getElementById('previewAbstract');
const previewIndex = document.getElementById('previewIndex');
const previousProposal = document.getElementById('previousProposal');
const nextProposal = document.getElementById('nextProposal');
const carouselDots = document.getElementById('carouselDots');
const modalProposalTitle = document.getElementById('modalProposalTitle');
const whatsappRequest = document.getElementById('whatsappRequest');
let proposals = [];
let activeProposal = 0;

async function loadProposals() {
  proposals = await getProposals();
  renderProposal();
}

function renderProposal() {
  const proposal = proposals[activeProposal];
  const hasProposal = Boolean(proposal);
  previewImage.classList.remove('carousel-enter');
  previewTitle.classList.remove('carousel-enter');
  previewAbstract.classList.remove('carousel-enter');
  requestAnimationFrame(() => {
    previewImage.classList.add('carousel-enter');
    previewTitle.classList.add('carousel-enter');
    previewAbstract.classList.add('carousel-enter');
  });
  previewImageAsset.src = hasProposal ? proposal.imageData : '';
  previewImageAsset.alt = hasProposal ? `${proposal.title} design image` : 'No uploaded proposal design';
  previewImage.classList.toggle('has-upload', hasProposal);
  previewLabel.textContent = hasProposal ? `UPLOADED / ${String(activeProposal + 1).padStart(2, '0')}` : 'UPLOADED / 00';
  previewTitle.textContent = hasProposal ? proposal.title : 'No proposals published yet';
  previewMeta.textContent = hasProposal ? `${proposal.topic} / ${proposal.year}` : 'Publish a proposal from the admin platform';
  previewAbstract.textContent = hasProposal ? `${proposal.abstract.slice(0, 190)}${proposal.abstract.length > 190 ? '...' : ''}` : 'The selected proposal abstract will appear here.';
  previewIndex.textContent = hasProposal ? `${activeProposal + 1} / ${proposals.length}` : '0 / 0';
  requestButton.disabled = !hasProposal;
  previousProposal.disabled = proposals.length < 2;
  nextProposal.disabled = proposals.length < 2;
  carouselDots.innerHTML = proposals.map((_, index) => `<button type="button" class="carousel-dot${index === activeProposal ? ' active' : ''}" aria-label="Show proposal ${index + 1}" data-index="${index}"></button>`).join('');
  carouselDots.querySelectorAll('button').forEach((dot) => dot.addEventListener('click', () => { activeProposal = Number(dot.dataset.index); renderProposal(); }));
}

function moveProposal(direction) {
  if (proposals.length < 2) return;
  activeProposal = (activeProposal + direction + proposals.length) % proposals.length;
  renderProposal();
}

function openRequest() {
  previewModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  const proposal = proposals[activeProposal];
  if (!proposal) return;
  modalProposalTitle.textContent = proposal.title.toUpperCase();
  whatsappRequest.href = `https://wa.me/233558775196?text=${encodeURIComponent(`Hello S.T.E.D, I would like to request the full file for the proposal: ${proposal.title}.`)}`;
}

function closePreview() {
  previewModal.classList.add('hidden');
  document.body.style.overflow = '';
}

requestButton.addEventListener('click', openRequest);
previousProposal.addEventListener('click', () => moveProposal(-1));
nextProposal.addEventListener('click', () => moveProposal(1));
modalClose.addEventListener('click', closePreview);
modalBackdrop.addEventListener('click', closePreview);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !previewModal.classList.contains('hidden')) closePreview();
});
loadProposals();
