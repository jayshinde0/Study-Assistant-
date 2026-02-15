import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Button } from './Button';

export const Navbar = ({ showAuth = true }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">EduHub</div>
            <div className="text-xs text-text-secondary">Learn Better</div>
          </div>
        </div>

        {/* Auth Buttons */}
        {showAuth && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};
