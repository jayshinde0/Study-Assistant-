import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Content } from './pages/Content';
import { Quiz } from './pages/Quiz';
import { Analytics } from './pages/Analytics';
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary mb-8">Study Assistant</h1>
          <nav className="space-y-2">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => navigate('/content')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              📚 Content
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              📈 Analytics
            </button>
          </nav>
        </div>
        <div className="absolute bottom-0 left-0 right-0 w-64 p-6 border-t">
          <div className="mb-4">
            <p className="text-sm text-gray-600">Logged in as</p>
            <p className="font-bold text-gray-900">{user?.name}</p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full px-4 py-2 bg-error text-white rounded-lg hover:bg-opacity-90 transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <nav className="bg-white shadow-sm border-b">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Welcome to Study Assistant</h2>
            <span className="text-gray-600">{user?.name}</span>
          </div>
        </nav>
        <main className="flex-1 p-8 overflow-auto">
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
          path="/quiz"
          element={
            <ProtectedRoute>
              <Layout>
                <Quiz />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
