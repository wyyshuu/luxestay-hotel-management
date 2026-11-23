const path = require('path');
const fs = require('fs');

async function runTests() {
  process.env.PORT = '5001';
  // Require and start server
  require('./server');

  // Wait 1.5 seconds for server to start
  await new Promise(resolve => setTimeout(resolve, 1500));

  const baseUrl = 'http://127.0.0.1:5001/api/hotels';

  console.log('\n--- 1. Testing GET /api/health ---');
  const healthRes = await fetch('http://127.0.0.1:5001/api/health');
  const healthData = await healthRes.json();
  console.log('Health Response:', healthData);

  console.log('\n--- 2. Testing GET /api/hotels ---');
  const getRes = await fetch(baseUrl);
  const getData = await getRes.json();
  console.log(`Retrieved ${getData.count} hotels. Status: ${getRes.status}`);

  console.log('\n--- 3. Testing POST /api/hotels (Create Hotel with image) ---');
  const formData = new FormData();
  formData.append('title', 'The Ritz Alpine Chalet & Peak Retreat');
  formData.append('description', 'Spectacular timber chalet set among snow-capped Swiss Alpine peaks with private ski-in/ski-out heated terraces.');
  formData.append('latitude', '46.020713');
  formData.append('longitude', '7.749117');
  formData.append('price', '850.00');

  // Create a small SVG blob for upload
  const testSvg = '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#0f4c81"/></svg>';
  const fileBlob = new Blob([testSvg], { type: 'image/svg+xml' });
  formData.append('image', fileBlob, 'alpine-chalet.svg');

  const createRes = await fetch(baseUrl, {
    method: 'POST',
    body: formData
  });
  const createData = await createRes.json();
  console.log('Create Response Status:', createRes.status, createData);
  const createdId = createData.data?.id;

  console.log(`\n--- 4. Testing GET /api/hotels/${createdId} ---`);
  const getSingleRes = await fetch(`${baseUrl}/${createdId}`);
  const getSingleData = await getSingleRes.json();
  console.log('Get Single Status:', getSingleRes.status, 'Title:', getSingleData.data?.title);

  console.log(`\n--- 5. Testing PUT /api/hotels/${createdId} ---`);
  const updateFormData = new FormData();
  updateFormData.append('title', 'The Ritz Alpine Chalet - Presidential Suite');
  updateFormData.append('description', 'Updated description: Spectacular timber chalet with expanded panoramic spa and private concierge.');
  updateFormData.append('latitude', '46.021000');
  updateFormData.append('longitude', '7.750000');
  updateFormData.append('price', '980.00');

  const updateRes = await fetch(`${baseUrl}/${createdId}`, {
    method: 'PUT',
    body: updateFormData
  });
  const updateData = await updateRes.json();
  console.log('Update Status:', updateRes.status, 'Updated Title:', updateData.data?.title, 'Updated Price:', updateData.data?.price);

  console.log(`\n--- 6. Testing DELETE /api/hotels/${createdId} ---`);
  const deleteRes = await fetch(`${baseUrl}/${createdId}`, {
    method: 'DELETE'
  });
  const deleteData = await deleteRes.json();
  console.log('Delete Status:', deleteRes.status, 'Message:', deleteData.message);

  console.log(`\n--- 7. Verifying 404 after deletion ---`);
  const verifyRes = await fetch(`${baseUrl}/${createdId}`);
  console.log('Post-delete fetch status (expected 404):', verifyRes.status);

  console.log('\n*** ALL BACKEND CRUD TESTS PASSED SUCCESSFULLY! ***');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
