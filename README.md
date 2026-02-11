# Study Assistant

A full-stack web application that helps students learn efficiently through AI-powered summarization, adaptive quizzes, and personalized learning recommendations.

## 🎯 Features

- **AI Content Summarization**: Summarize study materials in multiple formats (brief, detailed, comprehensive)
- **Adaptive Quiz System**: Dynamically adjust quiz difficulty based on user performance
- **Performance Analytics**: Track progress with visual insights and weak topic detection
- **Personalized Recommendations**: AI-generated learning paths based on performance
- **Resource Integration**: Summarize YouTube videos and web articles
- **Study Streak Tracking**: Gamified learning with XP points and streaks

## 🛠️ Tech Stack

**Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
**Backend**: Node.js + Express + MongoDB + Mongoose
**AI**: Google Gemini API
**Auth**: JWT

## 📁 Project Structure

```
your-project/
├── design-system/          # Design system documentation
├── frontend/               # React application
├── backend/                # Express API server
└── README.md
```

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📚 API Documentation

See `backend/API.md` for complete endpoint documentation.

## 🔑 Environment Variables

Create `.env` files in both frontend and backend directories with required API keys and database URLs.

## 📝 License

MIT
