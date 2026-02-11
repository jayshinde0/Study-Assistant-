import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-primary to-blue-600 text-white hover:from-primary hover:to-blue-700 shadow-md hover:shadow-lg',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
  };

  return (
    <motion.button
      className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${variants[variant]} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      {...props}
    >
      {loading ? '⏳ Loading...' : children}
    </motion.button>
  );
};
