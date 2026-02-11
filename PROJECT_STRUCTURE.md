# Complete Project Structure

```
your-project/
│
├── 📁 backend/                          # Node.js + Express API Server
│   ├── 📁 src/
│   │   ├── 📁 models/                   # MongoDB Schemas
│   │   │   ├── User.js                  # User model with auth
│   │   │   ├── Content.js               # Study material storage
│   │   │   └── Quiz.js                  # Quiz data and results
│   │   │
│   │   ├── 📁 services/                 # Business Logic Layer
│   │   │   ├── authService.js           # Authentication logic
│   │   │   ├── contentService.js        # Content management
│   │   │   ├── quizService.js           # Quiz generation & scoring
│   │   │   ├── analyticsService.js      # Performance analysis
│   │   │   └── geminiService.js         # AI/Gemini integration
│   │   │
│   │   ├── 📁 routes/                   # API Endpoints
│   │   │   ├── auth.js                  # /api/auth/*
│   │   │   ├── content.js               # /api/content/*
│   │   │   ├── quiz.js                  # /api/quiz/*
│   │   │   ├── analytics.js             # /api/analytics/*
│   │   │   └── resources.js             # /api/resources/*
│   │   │
│   │   ├── 📁 middleware/               # Express Middleware
│   │   │   ├── auth.js                  # JWT authentication
│   │   │   └── errorHandler.js          # Centralized error handling
│   │   │
│   │   └── index.js                     # Server entry point
│   │
│   ├── package.json                     # Dependencies
│   ├── .env.example                     # Environment template
│   ├── API.md                           # API documentation
│   └── README.md                        # Backend readme
│
├── 📁 frontend/                         # React + Vite Application
│   ├── 📁 src/
│   │   ├── 📁 pages/                    # Page Components
│   │   │   ├── Login.jsx                # Authentication page
│   │   │   ├── Register.jsx             # Registration page
│   │   │   ├── Dashboard.jsx            # Main dashboard
│   │   │   ├── Content.jsx              # Content upload
│   │   │   ├── Quiz.jsx                 # Quiz interface
│   │   │   └── Analytics.jsx            # Performance analytics
│   │   │
│   │   ├── 📁 components/               # Reusable Components
│   │   │   ├── Card.jsx                 # Card wrapper
│   │   │   ├── Button.jsx               # Button component
│   │   │   └── Input.jsx                # Input field
│   │   │
│   │   ├── 📁 store/                    # State Management
│   │   │   └── authStore.js             # Zustand auth store
│   │   │
│   │   ├── 📁 api/                      # API Client
│   │   │   └── client.js                # Axios instance with interceptors
│   │   │
│   │   ├── App.jsx                      # Main app component
│   │   ├── main.jsx                     # React entry point
│   │   └── index.css                    # Global styles + Tailwind
│   │
│   ├── index.html                       # HTML template
│   ├── vite.config.js                   # Vite configuration
│   ├── tailwind.config.js               # Tailwind CSS config
│   ├── postcss.config.js                # PostCSS config
│   ├── package.json                     # Dependencies
│   ├── .env.example                     # Environment template
│   └── README.md                        # Frontend readme
│
├── 📁 design-system/                    # Design Documentation
│   ├── MASTER.md                        # Design system guidelines
│   └── 📁 pages/                        # Page design specs (optional)
│
├── 📄 README.md                         # Project overview
├── 📄 SETUP.md                          # Setup instructions
├── 📄 PROJECT_SUMMARY.md                # Complete feature summary
├── 📄 PROJECT_STRUCTURE.md              # This file
├── 📄 EXAMPLE_REQUESTS.md               # API testing examples
├── 📄 API.md                            # API documentation
└── 📄 .gitignore                        # Git ignore rules
```

## Directory Descriptions

### Backend (`/backend`)
- **models/**: MongoDB schemas defining data structure
- **services/**: Business logic separated from routes
- **routes/**: Express route handlers
- **middleware/**: Authentication and error handling
- **index.js**: Express server setup and initialization

### Frontend (`/frontend`)
- **pages/**: Full-page components (routed)
- **components/**: Reusable UI components
- **store/**: Zustand state management
- **api/**: Axios client with auth interceptors
- **index.css**: Tailwind CSS + custom styles

### Design System (`/design-system`)
- **MASTER.md**: Color palette, typography, components, animations
- Guides frontend development consistency

## Key Files

| File | Purpose |
|------|---------|
| `backend/src/index.js` | Express server entry point |
| `backend/src/services/geminiService.js` | AI integration |
| `frontend/src/App.jsx` | React routing and layout |
| `frontend/src/store/authStore.js` | Global auth state |
| `design-system/MASTER.md` | UI/UX guidelines |
| `SETUP.md` | Installation instructions |
| `EXAMPLE_REQUESTS.md` | API testing guide |

## Data Flow

```
Frontend (React)
    ↓
API Client (Axios)
    ↓
Backend Routes (Express)
    ↓
Services (Business Logic)
    ↓
Models (MongoDB)
    ↓
Gemini API (AI)
```

## Authentication Flow

```
1. User registers/logs in
2. Backend validates credentials
3. JWT token generated
4. Token stored in localStorage
5. Token sent in Authorization header
6. Middleware verifies token
7. Request processed
```

## Quiz Generation Flow

```
1. User selects content
2. Frontend calls /api/quiz/generate
3. Backend fetches content
4. Gemini API generates questions
5. Difficulty adjusted based on history
6. Quiz returned to frontend
7. User answers questions
8. Frontend calls /api/quiz/:id/submit
9. Backend calculates score
10. User stats updated
11. Analytics updated
```

## File Naming Conventions

- **Components**: PascalCase (e.g., `Dashboard.jsx`)
- **Utilities**: camelCase (e.g., `authStore.js`)
- **Models**: PascalCase (e.g., `User.js`)
- **Routes**: kebab-case (e.g., `/api/auth`)

## Environment Setup

Each directory has `.env.example`:
- Copy to `.env`
- Fill in actual values
- Never commit `.env`

## Dependencies Summary

### Backend
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT auth
- bcryptjs: Password hashing
- @google-cloud/generative-ai: Gemini API
- cors: Cross-origin requests
- dotenv: Environment variables

### Frontend
- react: UI library
- react-router-dom: Routing
- axios: HTTP client
- zustand: State management
- framer-motion: Animations
- recharts: Data visualization
- tailwindcss: Styling
- lucide-react: Icons

## Getting Started

1. Install dependencies in both directories
2. Configure `.env` files
3. Start MongoDB
4. Run `npm run dev` in backend
5. Run `npm run dev` in frontend
6. Open `http://localhost:3000`

## Production Build

### Backend
```bash
npm run build  # If using TypeScript
npm start      # Run production server
```

### Frontend
```bash
npm run build  # Creates dist/ folder
# Deploy dist/ to static hosting
```

## Scaling Considerations

- **Database**: Add indexes for frequently queried fields
- **API**: Implement caching for summaries
- **Frontend**: Code splitting for large bundles
- **AI**: Rate limiting for Gemini API calls
- **Storage**: Consider S3 for file uploads
