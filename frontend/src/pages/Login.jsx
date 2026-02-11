import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import client from '../api/client';
import { useAuthStore } from '../store/authStore';

export const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await client.post('/auth/login', formData);
      setAuth(res.data.data.user, res.data.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
        <p className="text-gray-600 mb-6">Sign in to continue learning</p>

        {error && <div className="bg-error bg-opacity-10 text-error p-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Sign In
          </Button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don't have an account? <Link to="/register" className="text-primary font-bold">Sign up</Link>
        </p>
      </motion.div>
    </motion.div>
  );
};
