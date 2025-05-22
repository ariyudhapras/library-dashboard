const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testAddBook() {
  try {
    console.log('Starting test for POST /api/books endpoint...');
    
    const formData = new FormData();
    formData.append('title', 'Test Book');
    formData.append('author', 'Test Author');
    formData.append('publisher', 'Test Publisher');
    formData.append('year', '2023');
    formData.append('isbn', '1234567890');
    formData.append('stock', '5');
    
    // Use any existing file as a test image
    const imagePath = path.join(__dirname, 'README.md'); // Using README.md as a test file
    console.log('Using test file:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
      console.error('Test file does not exist:', imagePath);
      return;
    }
    
    formData.append('coverImage', fs.createReadStream(imagePath));
    console.log('Form data created, sending request...');
    
    console.log('Sending request to: http://localhost:3000/api/books');
    const response = await fetch('http://localhost:3000/api/books', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response received with status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Test successful!');
    } else {
      console.error('❌ Test failed with status:', response.status);
      console.error('Error message:', data.error || 'No error message provided');
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

console.log('Test script started');
testAddBook().then(() => {
  console.log('Test script completed');
}).catch(err => {
  console.error('Unhandled error in test script:', err);
}); 