// database.js — Supabase-backed data layer for the S.T.E.D site.
//
// Requires, in this order, before this script on every page:
//   1. config.js                                (defines SUPABASE_URL / SUPABASE_ANON_KEY)
//   2. https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2   (the Supabase client library)
//
// All data now lives in a real hosted database, so it is visible to every
// visitor, not just the browser that published it. All functions here are
// async — callers must use `await`.

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const PROPOSAL_IMAGE_BUCKET = 'proposal-images';
const PROPOSAL_DOCUMENT_BUCKET = 'proposal-documents';
const CAD_IMAGE_BUCKET = 'cad-images';

function uniqueFileName(file) {
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  return `${Date.now()}-${safeName}`;
}

async function uploadFile(bucket, file) {
  if (!file) return null;
  const path = uniqueFileName(file);
  const { error } = await supabaseClient.storage.from(bucket).upload(path, file);
  if (error) throw error;
  return path;
}

function publicFileUrl(bucket, path) {
  if (!path) return null;
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function removeFile(bucket, path) {
  if (!path) return;
  await supabaseClient.storage.from(bucket).remove([path]);
}

function mapProposalRow(row) {
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    abstract: row.abstract,
    imagePath: row.image_path,
    imageData: publicFileUrl(PROPOSAL_IMAGE_BUCKET, row.image_path),
    documentPath: row.document_path,
    documentName: row.document_name,
    year: row.year
  };
}

function mapCadRow(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    imagePath: row.image_path,
    imageData: publicFileUrl(CAD_IMAGE_BUCKET, row.image_path)
  };
}

// ---------------- Proposals ----------------

async function getProposals() {
  const { data, error } = await supabaseClient
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapProposalRow);
}

async function addProposal({ title, topic, abstract, imageFile, documentFile }) {
  const imagePath = await uploadFile(PROPOSAL_IMAGE_BUCKET, imageFile);
  const documentPath = await uploadFile(PROPOSAL_DOCUMENT_BUCKET, documentFile);
  const { error } = await supabaseClient.from('proposals').insert({
    title,
    topic,
    abstract,
    image_path: imagePath,
    document_path: documentPath,
    document_name: documentFile ? documentFile.name : null,
    year: new Date().getFullYear()
  });
  if (error) throw error;
}

async function updateProposalRecord(id, { title, topic, abstract, imageFile, documentFile, existing }) {
  const imagePath = imageFile ? await uploadFile(PROPOSAL_IMAGE_BUCKET, imageFile) : existing.imagePath;
  const documentPath = documentFile ? await uploadFile(PROPOSAL_DOCUMENT_BUCKET, documentFile) : existing.documentPath;
  const { error } = await supabaseClient
    .from('proposals')
    .update({
      title,
      topic,
      abstract,
      image_path: imagePath,
      document_path: documentPath,
      document_name: documentFile ? documentFile.name : existing.documentName
    })
    .eq('id', id);
  if (error) throw error;
  if (imageFile && existing.imagePath && existing.imagePath !== imagePath) {
    await removeFile(PROPOSAL_IMAGE_BUCKET, existing.imagePath);
  }
  if (documentFile && existing.documentPath && existing.documentPath !== documentPath) {
    await removeFile(PROPOSAL_DOCUMENT_BUCKET, existing.documentPath);
  }
}

async function deleteProposalRecord(id, existing) {
  const { error } = await supabaseClient.from('proposals').delete().eq('id', id);
  if (error) throw error;
  if (existing?.imagePath) await removeFile(PROPOSAL_IMAGE_BUCKET, existing.imagePath);
  if (existing?.documentPath) await removeFile(PROPOSAL_DOCUMENT_BUCKET, existing.documentPath);
}

// ---------------- CAD samples ----------------

async function getCadSamples() {
  const { data, error } = await supabaseClient
    .from('cad_samples')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(mapCadRow);
}

async function addCadSample({ title, description, imageFile }) {
  const imagePath = await uploadFile(CAD_IMAGE_BUCKET, imageFile);
  const { error } = await supabaseClient.from('cad_samples').insert({
    title,
    description,
    image_path: imagePath
  });
  if (error) throw error;
}

async function deleteCadSampleRecord(id, existing) {
  const { error } = await supabaseClient.from('cad_samples').delete().eq('id', id);
  if (error) throw error;
  if (existing?.imagePath) await removeFile(CAD_IMAGE_BUCKET, existing.imagePath);
}

// ---------------- Admin auth ----------------

async function getAdminSession() {
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

async function signInAdmin(email, password) {
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

async function signOutAdmin() {
  await supabaseClient.auth.signOut();
}

// Call at the top of any admin-only page. Redirects to the login page and
// returns null if there is no signed-in session; otherwise returns the session.
async function requireAdminSession(redirectTo = 'login.html') {
  const session = await getAdminSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}
