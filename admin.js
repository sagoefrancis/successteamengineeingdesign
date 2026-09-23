let currentProposals = [];
let currentCadSamples = [];
let editingId = null;

const form = document.getElementById('proposalForm');
const imageInput = document.getElementById('proposalImage');
const documentInput = document.getElementById('proposalDocument');
const imageName = document.getElementById('imageName');
const documentName = document.getElementById('documentName');
const formStatus = document.getElementById('formStatus');
const proposalCount = document.getElementById('proposalCount');
const recentTable = document.getElementById('recentTable');
const formTitle = document.getElementById('formTitle');
const formBadge = document.getElementById('formBadge');
const submitLabel = document.getElementById('submitLabel');
const cancelEdit = document.getElementById('cancelEdit');
const cadForm = document.getElementById('cadForm');
const cadImage = document.getElementById('cadImage');
const cadImageName = document.getElementById('cadImageName');
const cadStatus = document.getElementById('cadStatus');
const cadAdminList = document.getElementById('cadAdminList');
const logoutButton = document.getElementById('logoutButton');

async function refreshProposals() {
  currentProposals = await getProposals();
  proposalCount.textContent = currentProposals.length;
  renderRecent();
}

function renderRecent() {
  if (!currentProposals.length) {
    recentTable.innerHTML = '<div class="recent-empty">No proposals published yet. Your next entry will appear here.</div>';
    return;
  }
  recentTable.innerHTML = '<div class="recent-row recent-header"><span>Proposal</span><span>Topic</span><span>Assets</span><span>Status</span></div>';
  currentProposals.forEach((proposal) => {
    const row = document.createElement('div');
    row.className = 'recent-row';
    row.innerHTML = `<span class="recent-title"><strong></strong><small>Published ${proposal.year}</small></span><span></span><span class="asset-count">02 files</span><span class="published-status"><i></i> Live</span><span class="row-actions"><button type="button" class="edit-proposal">Edit</button><button type="button" class="delete-proposal">Delete</button></span>`;
    row.querySelector('.recent-title strong').textContent = proposal.title;
    row.querySelectorAll('span')[1].textContent = proposal.topic;
    row.querySelector('.edit-proposal').addEventListener('click', () => startEditing(proposal.id));
    row.querySelector('.delete-proposal').addEventListener('click', () => handleDeleteProposal(proposal.id));
    recentTable.appendChild(row);
  });
}

function resetForm() {
  editingId = null;
  form.reset();
  imageName.textContent = 'Choose image';
  documentName.textContent = 'Choose document';
  formTitle.textContent = 'New proposal';
  formBadge.textContent = 'DRAFT / READY';
  submitLabel.textContent = 'Publish to proposal library';
  cancelEdit.classList.add('hidden');
}

function startEditing(id) {
  const proposal = currentProposals.find((item) => item.id === id);
  if (!proposal) return;
  editingId = id;
  document.getElementById('proposalTitle').value = proposal.title;
  document.getElementById('proposalTopic').value = proposal.topic;
  document.getElementById('proposalAbstract').value = proposal.abstract;
  imageName.textContent = proposal.imagePath || 'Current image saved';
  documentName.textContent = proposal.documentName || 'Current document saved';
  formTitle.textContent = 'Edit proposal';
  formBadge.textContent = 'EDITING / LIVE';
  submitLabel.textContent = 'Save proposal changes';
  cancelEdit.classList.remove('hidden');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function handleDeleteProposal(id) {
  const proposal = currentProposals.find((item) => item.id === id);
  if (!proposal || !confirm(`Delete "${proposal.title}" from the public library?`)) return;
  try {
    await deleteProposalRecord(id, proposal);
    if (editingId === id) resetForm();
    formStatus.textContent = 'Proposal deleted from the public library.';
    await refreshProposals();
  } catch (err) {
    formStatus.textContent = 'Could not delete the proposal. Try again.';
  }
}

imageInput.addEventListener('change', () => {
  imageName.textContent = imageInput.files[0]?.name || 'No image selected';
});
documentInput.addEventListener('change', () => {
  documentName.textContent = documentInput.files[0]?.name || 'No document selected';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const image = imageInput.files[0];
  const uploadedDocument = documentInput.files[0];
  const existing = editingId ? currentProposals.find((item) => item.id === editingId) : null;
  if (!existing && (!image || !uploadedDocument)) {
    formStatus.textContent = 'Choose both an image and a document before publishing.';
    return;
  }
  formStatus.textContent = editingId ? 'Saving proposal changes...' : 'Publishing proposal...';
  const payload = {
    title: document.getElementById('proposalTitle').value.trim(),
    topic: document.getElementById('proposalTopic').value.trim(),
    abstract: document.getElementById('proposalAbstract').value.trim(),
    imageFile: image || null,
    documentFile: uploadedDocument || null
  };
  try {
    if (existing) {
      await updateProposalRecord(editingId, { ...payload, existing });
      formStatus.textContent = 'Proposal changes saved.';
    } else {
      await addProposal(payload);
      formStatus.textContent = 'Published. The public proposal library is updated.';
    }
    resetForm();
    await refreshProposals();
  } catch (err) {
    formStatus.textContent = 'The file could not be uploaded. Try a smaller document or image.';
  }
});

cancelEdit.addEventListener('click', resetForm);

async function refreshCadSamples() {
  currentCadSamples = await getCadSamples();
  renderCadAdminList();
}

function renderCadAdminList() {
  cadAdminList.innerHTML = '';
  if (!currentCadSamples.length) {
    cadAdminList.innerHTML = '<p class="recent-empty">No CAD samples published yet.</p>';
    return;
  }
  currentCadSamples.forEach((sample) => {
    const row = document.createElement('div');
    row.className = 'cad-admin-row';
    row.innerHTML = '<span><strong></strong><small></small></span><button type="button">Delete</button>';
    row.querySelector('strong').textContent = sample.title;
    row.querySelector('small').textContent = sample.description;
    row.querySelector('button').addEventListener('click', () => handleDeleteCadSample(sample.id));
    cadAdminList.appendChild(row);
  });
}

async function handleDeleteCadSample(id) {
  const sample = currentCadSamples.find((item) => item.id === id);
  if (!sample || !confirm(`Delete "${sample.title}" from the CAD samples?`)) return;
  try {
    await deleteCadSampleRecord(id, sample);
    cadStatus.textContent = 'CAD sample deleted.';
    await refreshCadSamples();
  } catch (err) {
    cadStatus.textContent = 'Could not delete the sample. Try again.';
  }
}

cadImage.addEventListener('change', () => {
  cadImageName.textContent = cadImage.files[0]?.name || 'Choose image';
});

cadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const image = cadImage.files[0];
  if (!image) return;
  cadStatus.textContent = 'Publishing CAD sample...';
  try {
    await addCadSample({
      title: document.getElementById('cadTitle').value.trim(),
      description: document.getElementById('cadDescription').value.trim(),
      imageFile: image
    });
    cadForm.reset();
    cadImageName.textContent = 'Choose image';
    cadStatus.textContent = 'CAD sample published to the public section.';
    await refreshCadSamples();
  } catch (err) {
    cadStatus.textContent = 'The CAD image could not be uploaded. Try a smaller image.';
  }
});

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    await signOutAdmin();
    window.location.href = 'login.html';
  });
}

(async function init() {
  const session = await requireAdminSession('login.html');
  if (!session) return;
  await refreshProposals();
  await refreshCadSamples();
})();
