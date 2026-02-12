import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { SearchBar } from './components/SearchBar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Content } from './pages/Content';
import { Quiz } from './pages/Quiz';
import { Analytics } from './pages/Analytics';
import { ChatBot } from './pages/ChatBot';
import { LearningPath } from './pages/LearningPath';
import { Compare } from './pages/Compare';
import { Flashcards } from './pages/Flashcards';
import { Pomodoro } from './pages/Pomodoro';
import { Profile } from './pages/Profile';
import client from './api/client';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const Layout = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl border-r border-slate-200 flex flex-col fixed h-screen">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Study
            </h1>
          </div>
          <p className="text-xs text-gray-500 ml-12">Smart Learning Platform</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            📊 Dashboard
          </button>
            <button
            onClick={() => navigate('/content')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            📚 Content
          </button>
          <button
            onClick={() => navigate('/flashcards')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            🎴 Flashcards
          </button>
          <button
            onClick={() => navigate('/pomodoro')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            ⏱️ Pomodoro
          </button>
          <button
            onClick={() => navigate('/learning-path')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            🗺️ Learning Path
          </button>
          <button
            onClick={() => navigate('/analytics')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            📈 Analytics
          </button>
          <button
            onClick={() => navigate('/compare')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            👥 Compare
          </button>
          <button
            onClick={() => navigate('/chatbot')}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            💬 Chat with AI
          </button>
          <button
            onClick={() => navigate(`/profile/${user?.username}`)}
            className="w-full text-left px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-primary hover:to-blue-600 hover:text-white transition-all duration-200 font-medium text-gray-700 hover:shadow-md"
          >
            👤 My Profile
          </button>
        </nav>

        {/* User Section - Fixed at bottom */}
        <div className="border-t border-slate-200 p-4 space-y-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Logged in as</p>
            <p className="font-bold text-gray-900 truncate">{user?.name}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-8 py-4 flex justify-between items-center gap-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent whitespace-nowrap">
              Welcome to Study Assistant
            </h2>
            <div className="flex-1 max-w-md">
              <SearchBar />
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 font-medium">{user?.name}</span>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (token) {
      client.get('/auth/profile')
        .then((res) => setUser(res.data.data))
        .catch(() => {});
    }
  }, [token, setUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/content"
          element={
            <ProtectedRoute>
              <Layout>
                <Content />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-path"
          element={
            <ProtectedRoute>
              <Layout>
                <LearningPath />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Layout>
                <Compare />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcards"
          element={
            <ProtectedRoute>
              <Layout>
                <Flashcards />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pomodoro"
          element={
            <ProtectedRoute>
              <Layout>
                <Pomodoro />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Layout>
                <Quiz />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <ChatBot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:username"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
