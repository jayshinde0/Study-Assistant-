import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let contentId = '';
let userId = '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(config => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function test() {
  try {
    console.log('🧪 Testing Adaptive Learning System\n');

    // 1. Register
    console.log('1️⃣ Registering user...');
    const email = `test-${Date.now()}@example.com`;
    const registerRes = await api.post('/auth/register', {
      name: 'Test User',
      email,
      password: 'password123'
    });
    console.log('✅ User registered\n');

    // 2. Login
    console.log('2️⃣ Logging in...');
    const loginRes = await api.post('/auth/login', {
      email,
      password: 'password123'
    });
    token = loginRes.data.data.token;
    userId = loginRes.data.data.userId;
    console.log('✅ Logged in, token:', token.substring(0, 20) + '...\n');

    // 3. Create content
    console.log('3️⃣ Creating content...');
    const contentRes = await api.post('/content/upload', {
      title: 'Machine Learning Basics',
      text: `Machine learning is a subset of artificial intelligence. 
        Neural Networks are artificial neurons connected in layers. 
        Backpropagation is an algorithm for training networks. 
        Activation Functions introduce non-linearity. 
        Linear Regression predicts continuous values. 
        Classification predicts categories.`,
      type: 'text'
    });
    contentId = contentRes.data.data._id;
    console.log('✅ Content created:', contentId, '\n');

    // 4. Generate first quiz
    console.log('4️⃣ Generating first quiz...');
    const quiz1Res = await api.post('/quiz/generate', {
      contentId
    });
    const quiz1Id = quiz1Res.data.data._id;
    console.log('✅ Quiz 1 generated:', quiz1Id);
    console.log('   Questions:', quiz1Res.data.data.questions.map(q => q.topic).join(', '), '\n');

    // 5. Submit quiz with poor answers (to create weak topics)
    console.log('5️⃣ Submitting quiz with poor answers...');
    const answers = ['wrong', 'wrong', 'wrong', 'wrong', 'wrong'];
    const submitRes = await api.post(`/quiz/${quiz1Id}/submit`, { answers });
    console.log('✅ Quiz submitted');
    console.log('   Accuracy:', submitRes.data.data.accuracy + '%\n');

    // 6. Check topic progress
    console.log('6️⃣ Checking topic mastery...');
    const masteryRes = await api.get('/analytics/topic-mastery');
    const mastery = masteryRes.data.data;
    console.log('✅ Topic Mastery Retrieved:');
    console.log('   Total Topics:', mastery.totalTopics);
    console.log('   Weak Topics:', mastery.weakTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   Medium Topics:', mastery.mediumTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   Strong Topics:', mastery.strongTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   Revision Due:', mastery.revisionDue.length, 'topics\n');

    // 7. Get recommendations
    console.log('7️⃣ Getting recommendations...');
    const recRes = await api.get('/analytics/recommendations');
    const rec = recRes.data.data;
    console.log('✅ Recommendations:');
    console.log('   Recommendation:', rec.recommendation);
    console.log('   Weak Topics:', rec.weakTopics.join(', '));
    console.log('   Revision Topics:', rec.revisionTopics.join(', ') || 'None\n');

    // 8. Generate second quiz (should focus on weak topics)
    console.log('8️⃣ Generating second quiz (should focus on weak topics)...');
    const quiz2Res = await api.post('/quiz/generate', {
      contentId
    });
    const quiz2Id = quiz2Res.data.data._id;
    console.log('✅ Quiz 2 generated:', quiz2Id);
    console.log('   Questions:', quiz2Res.data.data.questions.map(q => q.topic).join(', '));
    console.log('   (Should have more weak topics than Quiz 1)\n');

    // 9. Submit second quiz with better answers
    console.log('9️⃣ Submitting quiz with better answers...');
    const betterAnswers = ['a', 'b', 'c', 'a', 'b'];
    const submit2Res = await api.post(`/quiz/${quiz2Id}/submit`, { betterAnswers });
    console.log('✅ Quiz 2 submitted');
    console.log('   Accuracy:', submit2Res.data.data.accuracy + '%\n');

    // 10. Check updated topic progress
    console.log('🔟 Checking updated topic mastery...');
    const mastery2Res = await api.get('/analytics/topic-mastery');
    const mastery2 = mastery2Res.data.data;
    console.log('✅ Updated Topic Mastery:');
    console.log('   Weak Topics:', mastery2.weakTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   Medium Topics:', mastery2.mediumTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   Strong Topics:', mastery2.strongTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   (Accuracy should have improved)\n');

    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

test();
