import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'test@example.com',
  password: 'Test@123'
};

let authToken = '';
let userId = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const res = await axios.post(`${API_BASE}/auth/login`, testUser);
    authToken = res.data.data.token;
    userId = res.data.data.user.id;
    console.log('✅ Login successful');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.error?.message || error.message);
    return false;
  }
}

async function testChatbotMessage() {
  try {
    console.log('\n💬 Testing chatbot message...');
    const res = await axios.post(
      `${API_BASE}/chatbot/message`,
      {
        message: 'Explain photosynthesis',
        sessionId: null
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    console.log('✅ Chatbot response received');
    console.log('Response:', res.data.data.response.substring(0, 200) + '...');
    console.log('Suggested Questions:', res.data.data.suggestedQuestions);
    console.log('Topics:', res.data.data.topics);
    console.log('Sources:', res.data.data.sources);
    
    return res.data.data.sessionId;
  } catch (error) {
    console.error('❌ Chatbot message failed:', error.response?.data?.error?.message || error.message);
    return null;
  }
}

async function testGetSessions() {
  try {
    console.log('\n📋 Testing get sessions...');
    const res = await axios.get(
      `${API_BASE}/chatbot/sessions?limit=5`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    console.log('✅ Sessions retrieved');
    console.log(`Total sessions: ${res.data.data.total}`);
    console.log('Recent sessions:', res.data.data.sessions.map(s => s.sessionTitle));
    
    return res.data.data.sessions[0]?._id;
  } catch (error) {
    console.error('❌ Get sessions failed:', error.response?.data?.error?.message || error.message);
    return null;
  }
}

async function testGetHistory(sessionId) {
  try {
    console.log('\n📖 Testing get history...');
    const res = await axios.get(
      `${API_BASE}/chatbot/history/${sessionId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    console.log('✅ Chat history retrieved');
    console.log(`Messages in session: ${res.data.data.messages.length}`);
    console.log('Topics discussed:', res.data.data.topicsDiscussed);
  } catch (error) {
    console.error('❌ Get history failed:', error.response?.data?.error?.message || error.message);
  }
}

async function testGenerateQuiz() {
  try {
    console.log('\n🎯 Testing generate quiz...');
    const res = await axios.post(
      `${API_BASE}/chatbot/generate-quiz`,
      {
        topics: ['photosynthesis', 'biology'],
        sessionId: null
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    console.log('✅ Quiz generated');
    console.log(`Questions: ${res.data.data.questions.length}`);
    console.log('First question:', res.data.data.questions[0]?.question);
  } catch (error) {
    console.error('❌ Generate quiz failed:', error.response?.data?.error?.message || error.message);
  }
}

async function testRecommendations() {
  try {
    console.log('\n💡 Testing recommendations...');
    const res = await axios.get(
      `${API_BASE}/chatbot/recommendations`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    console.log('✅ Recommendations retrieved');
    console.log('Recommendations:', res.data.data.recommendations);
  } catch (error) {
    console.error('❌ Recommendations failed:', error.response?.data?.error?.message || error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Chatbot API Tests\n');
  console.log('================================\n');

  // Login first
  if (!await login()) {
    console.log('\n❌ Cannot proceed without login');
    return;
  }

  // Run tests
  const sessionId = await testChatbotMessage();
  await testGetSessions();
  
  if (sessionId) {
    await testGetHistory(sessionId);
  }
  
  await testGenerateQuiz();
  await testRecommendations();

  console.log('\n================================');
  console.log('✅ All tests completed!\n');
}

runTests().catch(console.error);
