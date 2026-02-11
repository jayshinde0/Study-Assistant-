import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'Test@123';

async function testHealth() {
  try {
    console.log('🔍 Testing health endpoint...');
    const res = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', res.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testRegister() {
  try {
    console.log('\n� Registering test user...');
    const res = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: testEmail,
      password: testPassword
    });
    console.log('✅ Registration successful');
    return res.data.data.token;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data?.error?.message || error.message);
    return null;
  }
}

async function testLogin() {
  try {
    console.log('\n🔐 Testing login...');
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: testEmail,
      password: testPassword
    });
    console.log('✅ Login successful');
    console.log('Token:', res.data.data.token.substring(0, 20) + '...');
    return res.data.data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error?.message || error.message);
    return null;
  }
}

async function testChatbotWithoutContent(token) {
  try {
    console.log('\n💬 Testing chatbot message (no content)...');
    const res = await axios.post(
      `${API_BASE}/chatbot/message`,
      {
        message: 'Explain photosynthesis',
        sessionId: null
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Chatbot response received');
    console.log('Response length:', res.data.data.response.length);
    console.log('Response preview:', res.data.data.response.substring(0, 100) + '...');
    console.log('Topics:', res.data.data.topics);
    console.log('Suggested questions:', res.data.data.suggestedQuestions);
  } catch (error) {
    console.error('❌ Chatbot message failed');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data?.error?.message || error.message);
    console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
  }
}

async function runTests() {
  console.log('🚀 Starting Simple Backend Tests\n');
  console.log('================================\n');

  await testHealth();
  let token = await testRegister();
  
  if (!token) {
    token = await testLogin();
  }
  
  if (token) {
    await testChatbotWithoutContent(token);
  }

  console.log('\n================================');
  console.log('✅ Tests completed!\n');
}

runTests().catch(console.error);
