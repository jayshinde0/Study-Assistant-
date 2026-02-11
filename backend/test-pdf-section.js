import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
let token = '';
let contentId = '';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function testPDF() {
  try {
    console.log('🧪 Testing PDF Section\n');

    // 1. Register
    console.log('1️⃣ Registering user...');
    const email = `pdf-test-${Date.now()}@example.com`;
    await api.post('/auth/register', {
      name: 'PDF Tester',
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
    console.log('✅ Logged in\n');

    // 3. Upload PDF
    console.log('3️⃣ Uploading PDF content...');
    const pdfRes = await api.post('/content/upload', {
      title: 'Attention Is All You Need',
      pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
      type: 'pdf'
    });
    contentId = pdfRes.data.data._id;
    console.log('✅ PDF uploaded:', contentId);
    console.log('   Title:', pdfRes.data.data.title);
    console.log('   Type:', pdfRes.data.data.type);
    console.log('   Topics extracted:', pdfRes.data.data.topics.join(', '), '\n');

    // 4. Generate Quiz
    console.log('4️⃣ Generating quiz from PDF...');
    const quizRes = await api.post('/quiz/generate', {
      contentId
    });
    const quizId = quizRes.data.data._id;
    console.log('✅ Quiz generated:', quizId);
    console.log('   Questions:', quizRes.data.data.questions.length);
    console.log('   Topics in quiz:', quizRes.data.data.questions.map(q => q.topic).join(', '), '\n');

    // 5. Submit Quiz
    console.log('5️⃣ Submitting quiz...');
    const answers = quizRes.data.data.questions.map((_, idx) => 
      quizRes.data.data.questions[idx].options[0]
    );
    const submitRes = await api.post(`/quiz/${quizId}/submit`, { answers });
    console.log('✅ Quiz submitted');
    console.log('   Score:', submitRes.data.data.score, '/', quizRes.data.data.questions.length);
    console.log('   Accuracy:', submitRes.data.data.accuracy + '%\n');

    // 6. Check Topic Mastery
    console.log('6️⃣ Checking topic mastery...');
    const masteryRes = await api.get('/analytics/topic-mastery');
    const mastery = masteryRes.data.data;
    console.log('✅ Topic Mastery:');
    console.log('   Total Topics:', mastery.totalTopics);
    console.log('   Weak Topics:', mastery.weakTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   Medium Topics:', mastery.mediumTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   Strong Topics:', mastery.strongTopics.map(t => `${t.topic} (${t.accuracy.toFixed(1)}%)`).join(', '));
    console.log('   Revision Due:', mastery.revisionDue.length, 'topics\n');

    // 7. Get Recommendations
    console.log('7️⃣ Getting recommendations...');
    const recRes = await api.get('/analytics/recommendations');
    console.log('✅ Recommendations:');
    console.log('   Recommendation:', recRes.data.data.recommendation);
    console.log('   Weak Topics:', recRes.data.data.weakTopics.join(', ') || 'None\n');

    console.log('✅ PDF Testing Complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

testPDF();
