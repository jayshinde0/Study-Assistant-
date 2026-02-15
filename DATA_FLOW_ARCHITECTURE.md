# Study Assistant - Complete Data Flow Architecture

## Overview
This document explains how data flows through the entire system from file upload to usage across all components.

---

## 1. FILE UPLOAD FLOW

### 1.1 Frontend Upload (Content.jsx)
```
User selects file in Content.jsx
    ↓
File validation (size, type)
    ↓
FormData created with file
    ↓
POST /api/content/upload
```

**Files Involved:**
- `frontend/src/pages/Content.jsx` - Upload UI component
- `frontend/src/api/client.js` - API client for HTTP requests

### 1.2 Backend File Reception & Storage

**Route Handler:** `backend/src/routes/content.js`

```
POST /api/content/upload
    ↓
Multer Middleware (multerConfig.js)
    ├─ File validation (MIME type, extension)
    ├─ File size check (max 50MB)
    └─ Save to disk: /backend/uploads/[unique-timestamp].ext
    ↓
File stored at: /backend/uploads/[filename]
```

**Files Involved:**
- `backend/src/middleware/multerConfig.js` - Multer configuration
  - Allowed types: PDF, DOCX, DOC, TXT
  - Storage location: `uploads/` directory
  - Max file size: 50MB
  - Filename format: `[timestamp]-[random].ext`

---

## 2. TEXT EXTRACTION FLOW

### 2.1 File Type Detection & Extraction

**Service:** `backend/src/services/fileExtractionService.js`

```
File uploaded to /backend/uploads/
    ↓
Detect file extension (.pdf, .docx, .txt)
    ↓
Route to appropriate extractor:
    ├─ PDF → extractTextFromPDF()
    │   └─ Uses: pdfParse library
    │   └─ Extracts text from all pages
    │
    ├─ DOCX/DOC → extractTextFromDOCX()
    │   └─ Uses: mammoth library
    │   └─ Extracts raw text
    │
    └─ TXT → extractTextFromTXT()
        └─ Direct file read (UTF-8)
    ↓
Extracted text returned
    ↓
Temporary file deleted from disk
```

**Key Methods:**
- `extractTextFromPDF(filePath)` - Parses PDF and extracts text
- `extractTextFromDOCX(filePath)` - Extracts text from Word documents
- `extractTextFromTXT(filePath)` - Reads plain text files
- `cleanupFile(filePath)` - Removes temporary file after extraction

**Files Involved:**
- `backend/src/services/fileExtractionService.js` - Text extraction logic
- Dependencies: `pdf-parse`, `mammoth`

---

## 3. CONTENT PROCESSING & STORAGE

### 3.1 Content Service Processing

**Service:** `backend/src/services/contentService.js`

```
Extracted text received
    ↓
uploadContent(userId, title, text, contentType)
    ├─ Create Content document
    ├─ Extract topics using Gemini AI
    └─ Save to MongoDB
    ↓
Content stored in Database
```

### 3.2 MongoDB Content Schema

**Model:** `backend/src/models/Content.js`

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  originalText: String (full extracted text),
  fileType: String (enum: 'text', 'pdf', 'docx', 'youtube'),
  type: String (enum: 'text', 'pdf', 'youtube'),
  pdfUrl: String (optional),
  youtubeUrl: String (optional),
  summaries: {
    brief: String,
    detailed: String,
    comprehensive: String
  },
  topics: [String] (extracted topics),
  bookmarked: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Files Involved:**
- `backend/src/models/Content.js` - MongoDB schema
- `backend/src/services/contentService.js` - Business logic

---

## 4. AI PROCESSING FLOW

### 4.1 Topic Extraction

**Service:** `backend/src/services/geminiService.js`

```
Content stored in DB
    ↓
geminiService.extractTopics(text)
    ├─ Send text to Gemini/Ollama API
    ├─ AI extracts key topics
    └─ Returns: [topic1, topic2, ...]
    ↓
Topics saved to Content.topics
```

### 4.2 Summary Generation

```
User requests summary
    ↓
generateSummaries(contentId)
    ├─ Fetch content from DB
    ├─ Generate 3 types:
    │  ├─ Brief summary (1-2 paragraphs)
    │  ├─ Detailed summary (3-5 paragraphs)
    │  └─ Comprehensive summary (full analysis)
    └─ Save to Content.summaries
    ↓
Summaries stored in DB
```

**Files Involved:**
- `backend/src/services/geminiService.js` - AI integration
- Uses: Gemini API or Ollama (local LLM)

---

## 5. QUIZ GENERATION FLOW

### 5.1 Quiz Generation Process

**Service:** `backend/src/services/quizService.js`

```
User clicks "Generate Quiz" on content
    ↓
generateQuiz(userId, contentId, difficulty)
    ├─ Fetch content from DB
    ├─ Get user's weak topics (adaptive learning)
    ├─ Build prompt with weak topics emphasis
    ├─ Call geminiService.generateQuiz()
    │  └─ AI generates 5 MCQ questions
    ├─ Create Quiz document
    └─ Save to MongoDB
    ↓
Quiz stored in DB
```

### 5.2 Quiz Submission & Scoring

```
User submits quiz answers
    ↓
submitQuiz(quizId, userId, answers)
    ├─ Fetch quiz from DB
    ├─ Compare answers with correct answers
    ├─ Calculate score & accuracy
    ├─ Update topic progress for each question
    ├─ Update user stats:
    │  ├─ totalQuizzesTaken++
    │  ├─ averageAccuracy (recalculated)
    │  └─ xp += (accuracy / 10)
    └─ Save all updates to DB
    ↓
Quiz results stored
    ↓
Analytics updated
```

**MongoDB Quiz Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  contentId: ObjectId (ref: Content),
  difficulty: String,
  questions: [{
    id: String,
    question: String,
    type: String ('mcq'),
    options: [String],
    correctAnswer: String,
    explanation: String,
    topic: String
  }],
  userAnswers: [{
    questionId: String,
    answer: String,
    isCorrect: Boolean,
    timeSpent: Number
  }],
  score: Number,
  accuracy: Number,
  completedAt: Date
}
```

**Files Involved:**
- `backend/src/services/quizService.js` - Quiz logic
- `backend/src/models/Quiz.js` - Quiz schema
- `backend/src/services/topicProgressService.js` - Progress tracking

---

## 6. FLASHCARD GENERATION FLOW

### 6.1 Flashcard Generation

**Service:** `backend/src/services/flashcardService.js`

```
User clicks "Generate Flashcards" on content
    ↓
generateFlashcards(userId, contentId, count=10)
    ├─ Check if flashcards already exist
    ├─ If not, call generateFlashcardsWithAI()
    │  ├─ Send content text to Ollama API
    │  ├─ AI generates JSON with front/back/topic/difficulty
    │  └─ Parse and validate JSON
    ├─ If AI fails, use fallback generation
    │  └─ Create fill-in-the-blank cards from sentences
    ├─ Create Flashcard documents
    └─ Save to MongoDB
    ↓
Flashcards stored in DB
```

### 6.2 Flashcard Review & Spaced Repetition

```
User reviews flashcard
    ↓
reviewFlashcard(userId, flashcardId, known)
    ├─ Update reviewCount
    ├─ If known:
    │  ├─ correctCount++
    │  └─ masteryLevel++ (max 5)
    ├─ If not known:
    │  ├─ incorrectCount++
    │  └─ masteryLevel-- (min 0)
    ├─ Calculate nextReview date (spaced repetition)
    └─ Save to DB
    ↓
Flashcard progress updated
```

**MongoDB Flashcard Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  contentId: ObjectId (ref: Content),
  front: String (question/term),
  back: String (answer/definition),
  topic: String,
  difficulty: String ('easy', 'medium', 'hard'),
  masteryLevel: Number (0-5),
  reviewCount: Number,
  correctCount: Number,
  incorrectCount: Number,
  lastReviewed: Date,
  nextReview: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Files Involved:**
- `backend/src/services/flashcardService.js` - Flashcard logic
- `backend/src/models/Flashcard.js` - Flashcard schema
- Uses: Ollama API for generation

---

## 7. CHATBOT FLOW (RAG - Retrieval Augmented Generation)

### 7.1 Message Processing

**Service:** `backend/src/services/chatbotService.js`

```
User sends message in ChatBot.jsx
    ↓
processMessage(userId, userMessage, contentIds)
    ├─ Retrieve relevant content using RAG
    │  └─ Call ragService.retrieveRelevantContent()
    ├─ Create context from retrieved content
    ├─ Build system & user prompts
    ├─ Call geminiService.generateContent()
    │  └─ Send to Ollama/Gemini API
    ├─ Extract topics from response
    ├─ Generate suggested follow-up questions
    └─ Return response with sources
    ↓
Response sent to frontend
```

### 7.2 RAG (Retrieval Augmented Generation)

**Service:** `backend/src/services/ragService.js`

```
User query: "What is photosynthesis?"
    ↓
retrieveRelevantContent(userId, query, limit=5)
    ├─ Fetch all user's content from DB
    ├─ Extract keywords from query
    ├─ Score each content:
    │  ├─ Topic matches: +3 points
    │  ├─ Text matches: +0.5 points per match
    │  └─ Title matches: +2 points
    ├─ Filter content with score > 0
    ├─ Sort by relevance score (descending)
    └─ Return top 5 results
    ↓
createContext(retrievedContent)
    ├─ Format retrieved content as context
    └─ Return formatted string with sources
    ↓
Context + Query sent to AI
    ↓
AI generates response based on user's materials
```

**Files Involved:**
- `backend/src/services/chatbotService.js` - Chat logic
- `backend/src/services/ragService.js` - Retrieval logic
- `backend/src/models/ChatHistory.js` - Chat history storage

---

## 8. ANALYTICS & PROGRESS TRACKING

### 8.1 Topic Progress Tracking

**Service:** `backend/src/services/topicProgressService.js`

```
Quiz question answered
    ↓
updateTopicProgress(userId, topic, isCorrect)
    ├─ Find or create UserTopicProgress record
    ├─ Update stats:
    │  ├─ totalAttempts++
    │  ├─ If correct: correctAttempts++
    │  └─ accuracy = (correctAttempts / totalAttempts) * 100
    └─ Save to DB
    ↓
Progress stored
```

### 8.2 Analytics Dashboard

**Frontend:** `frontend/src/pages/Analytics.jsx`

```
User opens Analytics page
    ↓
Fetch analytics data:
    ├─ GET /analytics/performance
    │  └─ User stats, topic-wise accuracy
    ├─ GET /analytics/trend
    │  └─ Progress over time
    ├─ GET /analytics/recommendations
    │  └─ Personalized learning recommendations
    └─ GET /analytics/topic-mastery
        └─ Adaptive learning insights
    ↓
Display charts & insights
```

**MongoDB UserTopicProgress Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  topic: String,
  totalAttempts: Number,
  correctAttempts: Number,
  accuracy: Number,
  lastAttemptedAt: Date,
  masteryLevel: Number (0-5),
  createdAt: Date,
  updatedAt: Date
}
```

**Files Involved:**
- `backend/src/services/topicProgressService.js` - Progress logic
- `backend/src/models/UserTopicProgress.js` - Progress schema
- `backend/src/services/analyticsService.js` - Analytics calculations
- `frontend/src/pages/Analytics.jsx` - Analytics UI

---

## 9. LEARNING PATH GENERATION

### 9.1 Adaptive Learning Path

**Service:** `backend/src/services/learningPathService.js`

```
User opens Learning Path page
    ↓
generateLearningPath(userId)
    ├─ Fetch user's topic progress
    ├─ Identify weak topics (accuracy < 50%)
    ├─ Identify learning topics (50% < accuracy < 80%)
    ├─ Identify mastered topics (accuracy > 80%)
    ├─ Create personalized path:
    │  ├─ Priority: Weak topics
    │  ├─ Secondary: Learning topics
    │  └─ Maintenance: Mastered topics
    └─ Return structured learning path
    ↓
Display path with recommendations
```

**Files Involved:**
- `backend/src/services/learningPathService.js` - Path generation
- `frontend/src/pages/LearningPath.jsx` - Path UI

---

## 10. STUDY SESSION TRACKING

### 10.1 Pomodoro Timer Integration

**Service:** `backend/src/services/studySessionService.js`

```
User starts Pomodoro timer
    ↓
startSession(userId, topic, duration, type)
    ├─ Create StudySession document
    ├─ Record start time
    └─ Save to DB
    ↓
User completes session
    ↓
completeSession(sessionId)
    ├─ Calculate actual duration
    ├─ Update session status
    ├─ Update user's totalStudyHours
    └─ Save to DB
    ↓
Session data stored for analytics
```

**MongoDB StudySession Schema:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  topic: String,
  type: String ('focus' or 'break'),
  duration: Number (minutes),
  actualDuration: Number,
  startedAt: Date,
  completedAt: Date,
  status: String ('active', 'completed', 'abandoned')
}
```

**Files Involved:**
- `backend/src/services/studySessionService.js` - Session logic
- `backend/src/models/StudySession.js` - Session schema
- `frontend/src/pages/Pomodoro.jsx` - Timer UI

---

## 11. COMPLETE DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Content.jsx ──→ Upload File ──→ API Client                    │
│       ↓                                                         │
│  ChatBot.jsx ──→ Send Message ──→ API Client                   │
│       ↓                                                         │
│  Flashcards.jsx ──→ Review Cards ──→ API Client                │
│       ↓                                                         │
│  Quiz.jsx ──→ Submit Answers ──→ API Client                    │
│       ↓                                                         │
│  Pomodoro.jsx ──→ Track Time ──→ API Client                    │
│       ↓                                                         │
│  Analytics.jsx ──→ Fetch Stats ──→ API Client                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Routes (content.js, quiz.js, chatbot.js, etc.)                │
│       ↓                                                         │
│  Middleware (multer, auth, errorHandler)                       │
│       ↓                                                         │
│  Services:                                                      │
│  ├─ fileExtractionService ──→ Extract text from files          │
│  ├─ contentService ──→ Store content in DB                     │
│  ├─ geminiService ──→ AI processing (topics, summaries, quiz)  │
│  ├─ quizService ──→ Generate & score quizzes                   │
│  ├─ flashcardService ──→ Generate & review flashcards         │
│  ├─ chatbotService ──→ Process chat messages                   │
│  ├─ ragService ──→ Retrieve relevant content                   │
│  ├─ topicProgressService ──→ Track learning progress           │
│  ├─ analyticsService ──→ Calculate analytics                   │
│  ├─ learningPathService ──→ Generate learning paths            │
│  └─ studySessionService ──→ Track study sessions               │
│       ↓                                                         │
│  File System:                                                   │
│  └─ /backend/uploads/ ──→ Temporary file storage               │
│       ↓                                                         │
│  External APIs:                                                 │
│  ├─ Ollama (Local LLM) ──→ AI generation                       │
│  └─ Gemini API ──→ AI processing (fallback)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Collections:                                                   │
│  ├─ users ──→ User accounts & stats                            │
│  ├─ contents ──→ Uploaded materials & extracted text           │
│  ├─ quizzes ──→ Generated quizzes & answers                    │
│  ├─ flashcards ──→ Generated flashcards & reviews              │
│  ├─ chathistories ──→ Chat conversations                       │
│  ├─ usertopicprogress ──→ Learning progress per topic          │
│  ├─ studysessions ──→ Pomodoro sessions                        │
│  ├─ studentprofiles ──→ Student profile data                   │
│  └─ learningpaths ──→ Personalized learning paths              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. KEY FILES SUMMARY

### Frontend Files
| File | Purpose |
|------|---------|
| `frontend/src/pages/Content.jsx` | File upload UI |
| `frontend/src/pages/ChatBot.jsx` | Chat interface |
| `frontend/src/pages/Flashcards.jsx` | Flashcard review |
| `frontend/src/pages/Quiz.jsx` | Quiz taking |
| `frontend/src/pages/Pomodoro.jsx` | Study timer |
| `frontend/src/pages/Analytics.jsx` | Progress dashboard |
| `frontend/src/pages/LearningPath.jsx` | Learning recommendations |
| `frontend/src/api/client.js` | API communication |

### Backend Services
| Service | Purpose |
|---------|---------|
| `fileExtractionService.js` | Extract text from PDF/DOCX/TXT |
| `contentService.js` | Manage uploaded content |
| `geminiService.js` | AI processing (topics, summaries, quiz) |
| `quizService.js` | Quiz generation & scoring |
| `flashcardService.js` | Flashcard generation & review |
| `chatbotService.js` | Chat message processing |
| `ragService.js` | Content retrieval for chat |
| `topicProgressService.js` | Track learning progress |
| `analyticsService.js` | Calculate analytics |
| `learningPathService.js` | Generate learning paths |
| `studySessionService.js` | Track study sessions |

### Backend Models
| Model | Purpose |
|-------|---------|
| `Content.js` | Uploaded materials schema |
| `Quiz.js` | Quiz questions & answers |
| `Flashcard.js` | Flashcard data |
| `ChatHistory.js` | Chat conversations |
| `UserTopicProgress.js` | Learning progress |
| `StudySession.js` | Study sessions |
| `User.js` | User accounts |
| `StudentProfile.js` | Student profile data |

### Middleware
| Middleware | Purpose |
|-----------|---------|
| `multerConfig.js` | File upload handling |
| `auth.js` | Authentication |
| `errorHandler.js` | Error handling |

---

## 13. DATA STORAGE LOCATIONS

### Temporary Files
- **Location:** `/backend/uploads/`
- **Lifetime:** Deleted after text extraction
- **Format:** `[timestamp]-[random].[ext]`

### Permanent Data
- **Location:** MongoDB database
- **Collections:** users, contents, quizzes, flashcards, etc.
- **Backup:** Regular MongoDB backups recommended

### Extracted Text
- **Storage:** MongoDB Content.originalText field
- **Size:** Unlimited (MongoDB supports large documents)
- **Indexed:** Yes (for search performance)

---

## 14. FLOW EXAMPLES

### Example 1: Upload PDF → Generate Quiz → Take Quiz

```
1. User uploads PDF in Content.jsx
   ↓
2. Multer saves to /backend/uploads/[timestamp].pdf
   ↓
3. fileExtractionService.extractTextFromPDF() extracts text
   ↓
4. contentService.uploadContent() saves to MongoDB
   ↓
5. geminiService.extractTopics() identifies topics
   ↓
6. User clicks "Generate Quiz"
   ↓
7. quizService.generateQuiz() creates quiz questions
   ↓
8. Quiz saved to MongoDB
   ↓
9. User takes quiz and submits answers
   ↓
10. quizService.submitQuiz() scores and updates progress
   ↓
11. topicProgressService.updateTopicProgress() updates stats
   ↓
12. User sees results in Analytics
```

### Example 2: Chat with AI About Uploaded Content

```
1. User uploads content (stored in MongoDB)
   ↓
2. User opens ChatBot and asks question
   ↓
3. chatbotService.processMessage() receives message
   ↓
4. ragService.retrieveRelevantContent() finds matching content
   ↓
5. Context created from retrieved content
   ↓
6. geminiService.generateContent() sends to Ollama/Gemini
   ↓
7. AI generates response based on user's materials
   ↓
8. Response with sources sent to frontend
   ↓
9. User sees answer with source materials highlighted
```

### Example 3: Spaced Repetition Flashcards

```
1. User generates flashcards from content
   ↓
2. flashcardService.generateFlashcards() creates cards
   ↓
3. Cards saved to MongoDB with nextReview = now
   ↓
4. User reviews flashcard (knows answer)
   ↓
5. flashcardService.reviewFlashcard(known=true)
   ├─ masteryLevel++
   ├─ nextReview = now + 3 days
   └─ Saved to DB
   ↓
6. User reviews same card 3 days later
   ↓
7. If still known: nextReview = now + 7 days
   ↓
8. Spaced repetition continues until mastery (level 5)
```

---

## 15. PERFORMANCE CONSIDERATIONS

### Database Indexing
- `Content.userId` - Indexed for fast user content retrieval
- `UserTopicProgress.userId` - Indexed for analytics queries
- `Flashcard.userId, nextReview` - Indexed for due card queries

### Caching Opportunities
- User's content list (cache for 5 minutes)
- Topic progress (cache for 1 minute)
- Learning path (cache for 10 minutes)

### File Handling
- Temporary files deleted immediately after extraction
- No permanent file storage (text stored in DB)
- Reduces disk space usage

### API Optimization
- RAG retrieves only top 5 relevant documents
- Flashcard queries limited to 20 due cards
- Analytics queries use aggregation pipeline

---

## 16. SECURITY CONSIDERATIONS

### File Upload Security
- File type validation (MIME type + extension)
- File size limit (50MB)
- Unique filename generation (prevents overwrites)
- Temporary file cleanup

### Data Access Control
- All queries filtered by userId
- Content ownership verified before access
- Quiz/Flashcard ownership verified

### API Security
- Authentication middleware on all routes
- Error messages don't expose sensitive info
- Input validation on all endpoints

---

This architecture ensures efficient data flow, scalability, and maintainability across all components of the study assistant application.
