const documentList = document.getElementById('documentList');

function addPublishedProposal(proposal, index) {
  const card = document.createElement('article');
  card.className = `document-card${index % 2 ? ' reverse' : ''}`;
  const visual = document.createElement('div');
  visual.className = 'document-visual uploaded-visual';
  if (proposal.imageData) {
    const image = document.createElement('img');
    image.src = proposal.imageData;
    image.alt = `${proposal.title} design image`;
    visual.appendChild(image);
  }
  const visualLabel = document.createElement('span');
  visualLabel.className = 'visual-label';
  visualLabel.textContent = `PUBLISHED / ${String(index + 1).padStart(2, '0')}`;
  visual.appendChild(visualLabel);
  const copy = document.createElement('div');
  copy.className = 'document-copy';
  copy.innerHTML = `<div class="document-meta"><span>STED / ADMIN UPLOAD</span><span>${proposal.year}</span></div><h2></h2><p class="topic"></p><p class="abstract"></p>`;
  copy.querySelector('h2').textContent = proposal.title;
  copy.querySelector('.topic').textContent = `Topic / ${proposal.topic}`;
  copy.querySelector('.abstract').textContent = proposal.abstract;
  const request = document.createElement('a');
  request.className = 'request-link';
  request.href = `https://wa.me/233558775196?text=${encodeURIComponent(`Hello S.T.E.D, I would like to request the proposal document: ${proposal.title}.`)}`;
  request.target = '_blank';
  request.rel = 'noopener';
  request.innerHTML = 'Request on WhatsApp <span>↗</span>';
  copy.appendChild(request);
  if (proposal.documentData) {
    const download = document.createElement('a');
    download.className = 'document-download';
    download.href = `https://wa.me/233558775196?text=${encodeURIComponent(`Hello S.T.E.D, I would like to receive the file "${proposal.documentName}" for the proposal "${proposal.title}".`)}`;
    download.target = '_blank';
    download.rel = 'noopener';
    download.textContent = 'Request file on WhatsApp';
    copy.appendChild(download);
  }
  card.append(visual, copy);
  documentList.appendChild(card);
}

async function loadProposals() {
  const proposals = await getProposals();
  proposals.reverse().forEach((proposal, index) => addPublishedProposal(proposal, index));
}

loadProposals();
