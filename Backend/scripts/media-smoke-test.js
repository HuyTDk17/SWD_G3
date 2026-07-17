/**
 * Media API smoke test — run with backend on :9999 and MongoDB available.
 * Usage: node scripts/media-smoke-test.js
 */
const fs = require('fs');
const path = require('path');

const BASE = process.env.API_BASE_URL || 'http://localhost:9999';
const unique = Date.now();

const request = async (url, options = {}) => {
  const response = await fetch(`${BASE}${url}`, options);
  const text = await response.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: response.status, body, headers: response.headers };
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const run = async () => {
  console.log('Media smoke test starting...');

  const configRes = await request('/api/v1/media/config');
  assert(configRes.status === 200, 'config should return 200');
  assert(configRes.body.data.provider === 'local', 'provider should be local');

  const email = `media.${unique}@example.com`;
  const password = 'Password1!';

  const registerRes = await request('/api/v1/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fullName: 'Media Tester' })
  });
  assert(registerRes.status === 201, 'register should succeed');

  const verifyRes = await request('/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp: '123456' })
  });
  assert(verifyRes.status === 200, 'verify otp should succeed');

  const loginRes = await request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  assert(loginRes.status === 200, 'login should succeed');
  const token = loginRes.body.data.accessToken;
  const authHeader = { Authorization: `Bearer ${token}` };

  const tinyPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  const imageForm = new FormData();
  imageForm.append('file', new Blob([tinyPng], { type: 'image/png' }), 'avatar.png');
  imageForm.append('purpose', 'avatar');

  const imageUploadRes = await request('/api/v1/media/upload', {
    method: 'POST',
    headers: authHeader,
    body: imageForm
  });
  assert(imageUploadRes.status === 201, 'image upload should succeed');
  const imageAsset = imageUploadRes.body.data;

  const badForm = new FormData();
  badForm.append('file', new Blob(['not-a-pdf'], { type: 'text/plain' }), 'bad.txt');
  badForm.append('purpose', 'general');
  const badUploadRes = await request('/api/v1/media/upload', {
    method: 'POST',
    headers: authHeader,
    body: badForm
  });
  assert(badUploadRes.status >= 400, 'invalid mime should fail');

  const avatarRes = await request('/api/v1/users/me/avatar', {
    method: 'PATCH',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetId: imageAsset.id })
  });
  assert(avatarRes.status === 200, 'set avatar should succeed');
  assert(avatarRes.body.data.avatarAssetId, 'avatarAssetId should be set');

  const contentRes = await request(`/api/v1/media/${imageAsset.id}/content`);
  assert(contentRes.status === 200, 'public avatar content should be readable');

  const pdfPath = path.join(__dirname, 'sample.pdf');
  fs.writeFileSync(pdfPath, '%PDF-1.4\n% smoke test pdf\n');
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfForm = new FormData();
  pdfForm.append('file', new Blob([pdfBytes], { type: 'application/pdf' }), 'credential.pdf');
  pdfForm.append('purpose', 'credential');

  const pdfUploadRes = await request('/api/v1/media/upload', {
    method: 'POST',
    headers: authHeader,
    body: pdfForm
  });
  assert(pdfUploadRes.status === 201, 'pdf upload should succeed');
  const pdfAsset = pdfUploadRes.body.data;

  await request('/api/v1/users/me', {
    method: 'PATCH',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bio: 'Experienced language teacher with more than five years of classroom practice.',
      nativeLanguage: 'English',
      targetLanguages: ['Vietnamese']
    })
  });

  const applicationRes = await request('/api/v1/users/teacher-application', {
    method: 'POST',
    headers: { ...authHeader, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      credentials: 'I have taught English and Vietnamese for more than five years in schools.',
      languagesTaught: ['English', 'Vietnamese'],
      documentAssetIds: [pdfAsset.id]
    })
  });
  assert(applicationRes.status === 201, 'teacher application should succeed');

  const deleteAttachedRes = await request(`/api/v1/media/${imageAsset.id}`, {
    method: 'DELETE',
    headers: authHeader
  });
  assert(deleteAttachedRes.status >= 400, 'deleting attached asset should fail');

  const deletePdfRes = await request(`/api/v1/media/${pdfAsset.id}`, {
    method: 'DELETE',
    headers: authHeader
  });
  assert(deletePdfRes.status >= 400, 'deleting attached pdf should fail');

  const orphanForm = new FormData();
  orphanForm.append('file', new Blob([tinyPng], { type: 'image/png' }), 'orphan.png');
  orphanForm.append('purpose', 'general');
  const orphanUploadRes = await request('/api/v1/media/upload', {
    method: 'POST',
    headers: authHeader,
    body: orphanForm
  });
  const orphanAsset = orphanUploadRes.body.data;
  const deleteOrphanRes = await request(`/api/v1/media/${orphanAsset.id}`, {
    method: 'DELETE',
    headers: authHeader
  });
  assert(deleteOrphanRes.status === 200, 'deleting orphan asset should succeed');

  fs.unlinkSync(pdfPath);
  console.log('Media smoke test passed.');
};

run().catch((error) => {
  console.error('Media smoke test failed:', error.message);
  process.exit(1);
});
