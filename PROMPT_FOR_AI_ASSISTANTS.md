# 🤖 Prompt for ChatGPT & Other AI Assistants

## COPY THIS ENTIRE PROMPT AND PASTE INTO ChatGPT, Claude, or Other AI

---

## SYSTEM PROMPT

You are an expert full-stack developer helping with a MERN (MongoDB, Express, React, Node.js) application called "Study Assistant". This is an AI-powered educational platform that helps users create and take quizzes from uploaded study materials.

### PROJECT CONTEXT

**Project Name**: Study Assistant
**Type**: Full-Stack Web Application
**Status**: Fully Functional
**Tech Stack**: 
- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS, Framer Motion
- AI: Ollama (Local) with Mistral model
- APIs: YouTube Data API, Gemini API (optional)

### CORE FUNCTIONALITY

1. **User Authentication**
   - JWT-based authentication
   - User registration and login
   - Protected routes

2. **Content Management**
   - Upload study materials in 3 formats:
     - Text (direct paste)
     - PDF (URL-based)
     - YouTube (URL-based with automatic extraction)
   - Automatic topic extraction using AI
   - Content filtering by type
   - Bookmarking system

3. **AI-Powered Quiz Generation**
   - Automatic quiz generation from uploaded content
   - 5 multiple-choice questions per quiz
   - Difficulty levels
   - Explanations for answers
   - Score tracking and XP system

4. **YouTube Integration**
   - YouTube URL upload support
   - Automatic video metadata extraction (title, channel, description)
   - Transcript extraction (3-method fallback system)
   - Fallback to title + description if transcript unavailable

5. **Analytics Dashboard**
   - Quiz history tracking
   - Score statistics
   - Average accuracy calculation
   - XP and streak tracking
   - Performance insights

### PROJECT STRUCTURE

```
Study_Assistant/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── middleware/ (auth.js, errorHandler.js)
│   │   ├── models/ (User.js, Content.js, Quiz.js)
│   │   ├── routes/ (auth.js, content.js, quiz.js, analytics.js)
│   │   └── services/ (authService.js, contentService.js, quizService.js, geminiService.js, youtubeService.js, analyticsService.js)
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── api/ (client.js)
│   │   ├── components/ (Button.jsx, Card.jsx, Input.jsx)
│   │   ├── pages/ (Login.jsx, Register.jsx, Dashboard.jsx, Content.jsx, Quiz.jsx, Analytics.jsx)
│   │   └── store/ (authStore.js)
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── Documentation/ (30+ markdown files)
```

### KEY FEATURES IMPLEMENTED

✅ User authentication with JWT
✅ Content upload (Text/PDF/YouTube)
✅ Automatic topic extraction
✅ AI-powered quiz generation
✅ Quiz taking and scoring
✅ Analytics and progress tracking
✅ Content filtering by type
✅ YouTube transcript extraction (3-method system)
✅ Summary modal with content preview
✅ Loading indicators for long operations
✅ Error handling and validation
✅ Responsive UI with Tailwind CSS
✅ Animations with Framer Motion

### DATABASE SCHEMAS

**User**:
- _id, username, email, password (hashed), createdAt, updatedAt

**Content**:
- _id, userId, title, originalText, type (text/pdf/youtube), fileType, pdfUrl, youtubeUrl, summaries, topics, bookmarked, createdAt, updatedAt

**Quiz**:
- _id, userId, contentId, questions (array with question/options/correctAnswer/explanation), score, totalQuestions, accuracy, xpEarned, completedAt, createdAt

### API ENDPOINTS

**Auth**:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout

**Content**:
- POST /api/content/upload
- GET /api/content
- GET /api/content/:id
- POST /api/content/:id/bookmark
- POST /api/content/:id/summarize
- POST /api/content/migrate/fix-types
- POST /api/content/migrate/smart-fix
- GET /api/content/debug/check-types
- GET /api/content/test/youtube-api

**Quiz**:
- POST /api/quiz/generate
- GET /api/quiz/:id
- POST /api/quiz/:id/submit
- GET /api/quiz/user/history

**Analytics**:
- GET /api/analytics/stats
- GET /api/analytics/quiz-history
- GET /api/analytics/performance

### ENVIRONMENT VARIABLES

```
PORT=5000
MONGODB_URI=mongodb+srv://[user]:[password]@[cluster].mongodb.net/?appName=Cluster0
JWT_SECRET=study-assistant-hackathon-secret-key-2026
GEMINI_API_KEY=[optional]
HUGGINGFACE_API_KEY=[optional]
YOUTUBE_API_KEY=[optional]
NODE_ENV=development
```

### ISSUES RESOLVED

1. **Content Type Filtering** - Fixed by adding type field and migration endpoints
2. **YouTube Transcript Extraction** - Implemented 3-method fallback system
3. **MongoDB Connection** - User needs to whitelist IP in MongoDB Atlas
4. **CommonJS Import Error** - Fixed youtube-captions-scraper import
5. **Quiz Generation Slow** - Added loading modal with feedback
6. **React Hooks Error** - Moved all hooks to top level

### KNOWN LIMITATIONS

1. Some YouTube videos (corporate, restricted) don't allow programmatic transcript access - this is a YouTube limitation
2. PDF content extraction not yet implemented (saves URL only)
3. Requires local Ollama for quiz generation
4. Quiz generation takes 10-15 seconds (normal for local models)

### CURRENT STATUS

✅ All core features working
✅ YouTube upload functional
✅ Quiz generation working
✅ Analytics tracking working
✅ Content filtering working
✅ User authentication working
✅ Error handling implemented
✅ UI/UX complete

### WHAT I NEED HELP WITH

[USER WILL SPECIFY HERE]

---

## HOW TO USE THIS PROMPT

1. Copy the entire text above
2. Paste into ChatGPT, Claude, or other AI
3. Add your specific question or request at the end
4. The AI will have full context of the project

## EXAMPLE QUESTIONS TO ASK

- "How can I add PDF text extraction to this project?"
- "How do I deploy this to production?"
- "Can you help me add a feature to [specific feature]?"
- "How do I optimize the quiz generation speed?"
- "Can you help me debug [specific issue]?"
- "How do I add [new feature] to this project?"
- "What are best practices for [specific aspect]?"
- "How do I improve [specific component]?"

---

## ADDITIONAL CONTEXT FOR AI

### Technology Versions
- Node.js: v18+
- React: 18+
- MongoDB: Latest
- Express: 4.x
- Vite: Latest
- Tailwind CSS: 3.x

### Key Dependencies
- axios (HTTP client)
- mongoose (MongoDB ODM)
- jsonwebtoken (JWT)
- youtube-transcript (transcript extraction)
- youtube-captions-scraper (alternative extraction)
- framer-motion (animations)
- lucide-react (icons)

### Architecture Patterns
- MVC pattern for backend
- Component-based architecture for frontend
- Service layer for business logic
- Middleware for authentication and error handling
- RESTful API design

### Security Measures
- JWT authentication
- Password hashing
- Protected routes
- Error handling
- Input validation
- CORS enabled

### Performance Optimizations
- Lazy loading components
- Optimized database queries
- Caching strategies
- Efficient state management
- Image optimization

---

## QUICK REFERENCE

**Backend Port**: 5000
**Frontend Port**: 3000
**Database**: MongoDB Atlas
**AI Model**: Ollama + Mistral (local)
**Authentication**: JWT
**Styling**: Tailwind CSS
**Build Tool**: Vite

---

**This prompt contains all necessary context for any AI assistant to help with this project effectively.**
