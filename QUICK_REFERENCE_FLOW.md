# Quick Reference - Data Flow Paths

## 🔄 Main Data Flows at a Glance

### Flow 1: Upload & Store Content
```
Content.jsx (Upload)
    ↓
multerConfig.js (Save file)
    ↓
/backend/uploads/ (Temporary storage)
    ↓
fileExtractionService.js (Extract text)
    ↓
contentService.js (Process)
    ↓
geminiService.js (Extract topics)
    ↓
MongoDB: Content collection (Permanent storage)
```

**Files Used:**
- Frontend: `Content.jsx`, `api/client.js`
- Backend: `multerConfig.js`, `fileExtractionService.js`, `contentService.js`, `geminiService.js`
- Database: `Content.js` model

---

### Flow 2: Generate Quiz
```
Content.jsx (User clicks "Generate Quiz")
    ↓
quizService.js (Get weak topics)
    ↓
geminiService.js (AI generates questions)
    ↓
MongoDB: Quiz collection (Save questions)
    ↓
Quiz.jsx (Display questions)
    ↓
User submits answers
    ↓
quizService.submitQuiz() (Score answers)
    ↓
topicProgressService.js (Update progress)
    ↓
MongoDB: UserTopicProgress collection (Save progress)
    ↓
Analytics.jsx (Display results)
```

**Files Used:**
- Frontend: `Content.jsx`, `Quiz.jsx`, `Analytics.jsx`
- Backend: `quizService.js`, `geminiService.js`, `topicProgressService.js`
- Database: `Quiz.js`, `UserTopicProgress.js` models

---

### Flow 3: Generate Flashcards
```
Content.jsx (User clicks "Generate Flashcards")
    ↓
flashcardService.js (Check if exist)
    ↓
geminiService.js or Ollama API (Generate cards)
    ↓
MongoDB: Flashcard collection (Save cards)
    ↓
Flashcards.jsx (Display cards)
    ↓
User reviews card (knows/doesn't know)
    ↓
flashcardService.reviewFlashcard() (Update mastery)
    ↓
Calculate nextReview date (Spaced repetition)
    ↓
MongoDB: Flashcard collection (Update)
```

**Files Used:**
- Frontend: `Content.jsx`, `Flashcards.jsx`
- Backend: `flashcardService.js`, `geminiService.js`
- Database: `Flashcard.js` model

---

### Flow 4: Chat with AI (RAG)
```
ChatBot.jsx (User sends message)
    ↓
chatbotService.js (Process message)
    ↓
ragService.js (Retrieve relevant content)
    ↓
MongoDB: Content collection (Search user's materials)
    ↓
Score & rank by relevance
    ↓
geminiService.js (Generate response with context)
    ↓
Ollama/Gemini API (AI processing)
    ↓
ChatBot.jsx (Display response + sources)
    ↓
MongoDB: ChatHistory collection (Save conversation)
```

**Files Used:**
- Frontend: `ChatBot.jsx`, `ChatMessage.jsx`, `ChatInput.jsx`
- Backend: `chatbotService.js`, `ragService.js`, `geminiService.js`
- Database: `Content.js`, `ChatHistory.js` models

---

### Flow 5: Track Study Sessions (Pomodoro)
```
Pomodoro.jsx (User starts timer)
    ↓
studySessionService.js (Create session)
    ↓
MongoDB: StudySession collection (Save start time)
    ↓
Timer runs (25 min focus / 5 min break)
    ↓
User completes session
    ↓
studySessionService.completeSession() (Calculate duration)
    ↓
MongoDB: StudySession collection (Update completion)
    ↓
User stats updated (totalStudyHours++)
    ↓
Analytics.jsx (Display weekly progress)
```

**Files Used:**
- Frontend: `Pomodoro.jsx`
- Backend: `studySessionService.js`
- Database: `StudySession.js`, `User.js` models

---

### Flow 6: View Analytics & Learning Path
```
Analytics.jsx (User opens page)
    ↓
API calls:
├─ GET /analytics/performance
├─ GET /analytics/trend
├─ GET /analytics/recommendations
└─ GET /analytics/topic-mastery
    ↓
analyticsService.js (Calculate stats)
    ↓
MongoDB queries:
├─ UserTopicProgress (accuracy per topic)
├─ Quiz (quiz history)
├─ StudySession (study time)
└─ User (overall stats)
    ↓
Charts & insights displayed
    ↓
LearningPath.jsx (Recommendations)
    ↓
learningPathService.js (Generate path)
    ↓
Identify weak/learning/mastered topics
    ↓
Display personalized learning path
```

**Files Used:**
- Frontend: `Analytics.jsx`, `LearningPath.jsx`
- Backend: `analyticsService.js`, `learningPathService.js`, `topicProgressService.js`
- Database: `UserTopicProgress.js`, `Quiz.js`, `StudySession.js` models

---

## 📊 Data Storage Locations

| Data Type | Storage Location | Lifetime |
|-----------|-----------------|----------|
| Uploaded Files | `/backend/uploads/` | Temporary (deleted after extraction) |
| Extracted Text | MongoDB `Content.originalText` | Permanent |
| Topics | MongoDB `Content.topics` | Permanent |
| Summaries | MongoDB `Content.summaries` | Permanent |
| Quiz Questions | MongoDB `Quiz.questions` | Permanent |
| Quiz Answers | MongoDB `Quiz.userAnswers` | Permanent |
| Flashcards | MongoDB `Flashcard` | Permanent |
| Chat History | MongoDB `ChatHistory` | Permanent |
| Progress Data | MongoDB `UserTopicProgress` | Permanent |
| Study Sessions | MongoDB `StudySession` | Permanent |

---

## 🔗 Service Dependencies

```
contentService.js
    ├─ Depends on: fileExtractionService, geminiService
    └─ Used by: quizService, flashcardService, chatbotService

quizService.js
    ├─ Depends on: geminiService, topicProgressService
    └─ Used by: Quiz.jsx, Analytics.jsx

flashcardService.js
    ├─ Depends on: geminiService
    └─ Used by: Flashcards.jsx

chatbotService.js
    ├─ Depends on: ragService, geminiService
    └─ Used by: ChatBot.jsx

ragService.js
    ├─ Depends on: Content model
    └─ Used by: chatbotService

topicProgressService.js
    ├─ Depends on: UserTopicProgress model
    └─ Used by: quizService, analyticsService

analyticsService.js
    ├─ Depends on: topicProgressService, Quiz, StudySession models
    └─ Used by: Analytics.jsx

learningPathService.js
    ├─ Depends on: topicProgressService
    └─ Used by: LearningPath.jsx

studySessionService.js
    ├─ Depends on: StudySession model
    └─ Used by: Pomodoro.jsx, Analytics.jsx
```

---

## 📁 File Organization

### Frontend Structure
```
frontend/src/
├── pages/
│   ├── Content.jsx ────────────→ Upload files
│   ├── Quiz.jsx ───────────────→ Take quizzes
│   ├── Flashcards.jsx ─────────→ Review flashcards
│   ├── ChatBot.jsx ────────────→ Chat with AI
│   ├── Pomodoro.jsx ───────────→ Study timer
│   ├── Analytics.jsx ──────────→ View progress
│   └── LearningPath.jsx ───────→ Learning recommendations
├── components/
│   ├── ChatMessage.jsx ────────→ Display chat messages
│   ├── ChatInput.jsx ──────────→ Chat input field
│   └── ...
└── api/
    └── client.js ──────────────→ API communication
```

### Backend Structure
```
backend/src/
├── middleware/
│   ├── multerConfig.js ────────→ File upload handling
│   ├── auth.js ────────────────→ Authentication
│   └── errorHandler.js ────────→ Error handling
├── services/
│   ├── fileExtractionService.js ──→ Extract text from files
│   ├── contentService.js ─────────→ Manage content
│   ├── geminiService.js ──────────→ AI processing
│   ├── quizService.js ────────────→ Quiz generation
│   ├── flashcardService.js ───────→ Flashcard generation
│   ├── chatbotService.js ─────────→ Chat processing
│   ├── ragService.js ─────────────→ Content retrieval
│   ├── topicProgressService.js ───→ Progress tracking
│   ├── analyticsService.js ───────→ Analytics
│   ├── learningPathService.js ────→ Learning paths
│   └── studySessionService.js ────→ Study sessions
├── models/
│   ├── Content.js ──────────────→ Content schema
│   ├── Quiz.js ─────────────────→ Quiz schema
│   ├── Flashcard.js ────────────→ Flashcard schema
│   ├── ChatHistory.js ──────────→ Chat schema
│   ├── UserTopicProgress.js ────→ Progress schema
│   ├── StudySession.js ─────────→ Session schema
│   ├── User.js ─────────────────→ User schema
│   └── StudentProfile.js ───────→ Profile schema
├── routes/
│   ├── content.js ──────────────→ Content endpoints
│   ├── quiz.js ─────────────────→ Quiz endpoints
│   ├── chatbot.js ──────────────→ Chat endpoints
│   └── ...
└── uploads/ ────────────────────→ Temporary file storage
```

---

## 🔄 API Endpoints Used

### Content Upload
```
POST /api/content/upload
  ├─ Input: File (PDF/DOCX/TXT)
  └─ Output: Content object with extracted text
```

### Quiz Generation & Submission
```
POST /api/quiz/generate
  ├─ Input: contentId, difficulty
  └─ Output: Quiz with questions

POST /api/quiz/:quizId/submit
  ├─ Input: answers array
  └─ Output: Score, accuracy, results
```

### Flashcard Generation & Review
```
POST /api/flashcards/generate
  ├─ Input: contentId, count
  └─ Output: Array of flashcards

POST /api/flashcards/:cardId/review
  ├─ Input: known (boolean)
  └─ Output: Updated flashcard with next review date
```

### Chat
```
POST /api/chatbot/message
  ├─ Input: userMessage, contentIds
  └─ Output: Response, sources, suggested questions
```

### Analytics
```
GET /analytics/performance
  └─ Output: User stats, topic-wise accuracy

GET /analytics/trend
  └─ Output: Progress over time

GET /analytics/recommendations
  └─ Output: Personalized recommendations

GET /analytics/topic-mastery
  └─ Output: Adaptive learning insights
```

### Study Sessions
```
POST /api/study-sessions/start
  ├─ Input: topic, duration, type
  └─ Output: Session object

POST /api/study-sessions/:sessionId/complete
  └─ Output: Completed session with stats
```

---

## 🎯 Key Takeaways

1. **Upload Flow**: File → Extract → Store → Process
2. **Quiz Flow**: Content → Generate → Store → Score → Update Progress
3. **Flashcard Flow**: Content → Generate → Store → Review → Spaced Repetition
4. **Chat Flow**: Message → Retrieve Content → Generate Response → Display with Sources
5. **Analytics Flow**: Collect Data → Calculate Stats → Display Insights
6. **All data is stored in MongoDB** - No permanent file storage
7. **Temporary files are cleaned up** - Only text is stored in database
8. **Services are modular** - Each service has a specific responsibility
9. **RAG enables context-aware AI** - Chat uses user's own materials
10. **Adaptive learning** - Quiz difficulty and recommendations based on progress

---

## 🚀 Performance Tips

- **Caching**: User content list, topic progress, learning paths
- **Indexing**: userId, contentId, nextReview fields
- **Pagination**: Large result sets (quizzes, flashcards)
- **Lazy Loading**: Analytics charts load on demand
- **Batch Operations**: Update multiple topic progress records together

---

## 🔒 Security Checklist

- ✅ File type validation (MIME + extension)
- ✅ File size limits (50MB max)
- ✅ User ownership verification
- ✅ Authentication on all routes
- ✅ Input validation
- ✅ Error handling (no sensitive info exposed)
- ✅ Temporary file cleanup
- ✅ Database query filtering by userId
