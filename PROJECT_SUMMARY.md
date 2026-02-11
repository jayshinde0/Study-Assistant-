# AI-Powered Adaptive Study Assistant - Project Summary

## 🎯 Project Overview

A complete full-stack MERN application that leverages Google Gemini API to provide intelligent, adaptive learning experiences. The system dynamically adjusts quiz difficulty based on user performance and delivers personalized learning recommendations.

## ✅ What's Included

### Backend (Node.js + Express + MongoDB)
- **Authentication**: JWT-based auth with secure password hashing
- **Content Management**: Upload, store, and process study materials
- **AI Integration**: Gemini API for summarization, quiz generation, and recommendations
- **Adaptive Logic**: Difficulty adjustment based on performance (>80% → hard, <50% → easy)
- **Analytics**: Performance tracking, topic analysis, progress trends
- **Layered Architecture**: Controller → Service → Repository pattern

### Frontend (React + Vite + Tailwind CSS)
- **Pages**: Login, Register, Dashboard, Content Upload, Quiz, Analytics
- **Components**: Reusable Card, Button, Input components with Framer Motion
- **State Management**: Zustand for auth and app state
- **Design System**: Follows minimalist educational UI principles
- **Responsive**: Mobile-first design with Tailwind CSS

### AI Features
- **Content Summarization**: Brief, detailed, comprehensive summaries
- **Quiz Generation**: Adaptive MCQ questions with explanations
- **Topic Extraction**: Automatic topic identification from content
- **Recommendations**: Personalized learning paths based on weak areas
- **Performance Analysis**: Accuracy tracking and trend visualization

## 📊 Key Features

1. **User Authentication**
   - Secure registration and login
   - JWT token-based sessions
   - User profile with XP and streak tracking

2. **Content Management**
   - Upload study materials (text, PDF, DOCX)
   - AI-powered topic extraction
   - Multiple summary formats
   - Bookmark functionality

3. **Adaptive Quiz System**
   - Dynamic difficulty adjustment
   - Instant feedback with explanations
   - Progress tracking
   - Score and accuracy calculation

4. **Learning Analytics**
   - Topic-wise performance charts
   - Progress trend visualization
   - Weak topic detection
   - AI-generated recommendations

5. **Gamification**
   - XP points system
   - Study streak counter
   - Achievement tracking

## 🏗️ Architecture

### Backend Structure
```
services/
├── authService.js          # User auth logic
├── contentService.js       # Content management
├── quizService.js          # Quiz generation & submission
├── analyticsService.js     # Performance analysis
└── geminiService.js        # AI integration

routes/
├── auth.js                 # Auth endpoints
├── content.js              # Content endpoints
├── quiz.js                 # Quiz endpoints
├── analytics.js            # Analytics endpoints
└── resources.js            # Resource endpoints

models/
├── User.js                 # User schema
├── Content.js              # Content schema
└── Quiz.js                 # Quiz schema
```

### Frontend Structure
```
pages/
├── Login.jsx               # Authentication
├── Register.jsx            # Registration
├── Dashboard.jsx           # Main dashboard
├── Content.jsx             # Content upload
├── Quiz.jsx                # Quiz interface
└── Analytics.jsx           # Performance analytics

components/
├── Card.jsx                # Card component
├── Button.jsx              # Button component
└── Input.jsx               # Input component

store/
└── authStore.js            # Zustand auth store

api/
└── client.js               # Axios client with interceptors
```

## 🚀 Quick Start

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Add your Gemini API key and MongoDB URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:3000` and start learning!

## 🔑 Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/study-assistant
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Content
- `POST /api/content/upload` - Upload study material
- `GET /api/content` - Get all user content
- `GET /api/content/:id` - Get specific content
- `POST /api/content/:id/summarize` - Generate summaries
- `POST /api/content/:id/bookmark` - Toggle bookmark

### Quiz
- `POST /api/quiz/generate` - Generate adaptive quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `GET /api/quiz/history` - Get quiz history

### Analytics
- `GET /api/analytics/performance` - Get performance data
- `GET /api/analytics/recommendations` - Get recommendations
- `GET /api/analytics/trend` - Get progress trend

### Resources
- `POST /api/resources/youtube` - Summarize YouTube video
- `POST /api/resources/web` - Summarize web article

## 🎨 Design System

- **Color Palette**: Indigo primary, Purple secondary, Emerald success
- **Typography**: Inter font family
- **Components**: Card-based layouts with smooth animations
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG contrast ratios, semantic HTML

## 🔄 Adaptive Learning Flow

1. User uploads study material
2. System extracts topics and generates summaries
3. User takes quiz (difficulty based on history)
4. System evaluates performance
5. Difficulty adjusts for next quiz:
   - Accuracy > 80% → Increase difficulty
   - Accuracy 50-80% → Maintain difficulty
   - Accuracy < 50% → Decrease difficulty
6. Analytics identify weak topics
7. Personalized recommendations generated

## 📈 Performance Metrics

- **User Stats**: XP points, study streak, total quizzes, average accuracy
- **Topic Stats**: Accuracy per topic, questions attempted
- **Progress Trend**: Daily performance over 30 days
- **Weak Topics**: Identified for targeted practice

## 🛠️ Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI | Google Gemini API |
| Auth | JWT, bcryptjs |
| State | Zustand |
| Charts | Recharts |
| Icons | Lucide React |

## 📝 Next Steps for Hackathon

1. Get Gemini API key from Google AI Studio
2. Set up MongoDB (local or Atlas)
3. Configure environment variables
4. Run backend and frontend
5. Test complete workflow
6. Deploy to production (Vercel + Railway/Heroku)

## 🎓 Educational Features

- **Adaptive Difficulty**: Responds to user performance
- **Instant Feedback**: Explanations for every question
- **Progress Visualization**: Charts and trends
- **Personalization**: Recommendations based on weak areas
- **Gamification**: XP and streak systems
- **Multiple Formats**: Summaries in different detail levels

## 🔐 Security

- JWT token-based authentication
- Password hashing with bcryptjs
- Protected API routes
- CORS configuration
- Input validation

This is a production-ready foundation optimized for hackathon development. All core features are implemented and ready to extend!
