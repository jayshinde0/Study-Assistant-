import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'Test@123';

async function testChatbotDetailed() {
  try {
    // Register
    console.log('📝 Registering test user...');
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Test User',
      email: testEmail,
      password: testPassword
    });
    const token = regRes.data.data.token;
    console.log('✅ Registration successful\n');

    // Send message
    console.log('💬 Sending message to chatbot...');
    console.log('URL:', `${API_BASE}/chatbot/message`);
    console.log('Token:', token.substring(0, 20) + '...');
    console.log('Message: "Explain photosynthesis"\n');

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

    console.log('✅ Success!\n');
    console.log('Response:', {
      sessionId: res.data.data.sessionId,
      responseLength: res.data.data.response.length,
      topics: res.data.data.topics,
      suggestedQuestions: res.data.data.suggestedQuestions,
      sources: res.data.data.sources
    });

  } catch (error) {
    console.error('❌ Error:\n');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error?.message);
    console.error('Stack:', error.response?.data?.error?.stack);
    console.error('\nFull Response:', JSON.stringify(error.response?.data, null, 2));
  }
}

testChatbotDetailed();
