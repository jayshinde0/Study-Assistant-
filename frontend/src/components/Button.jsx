import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-opacity-90 transition-all duration-150',
    secondary: 'bg-white text-text-primary border border-border hover:bg-gray-50 transition-all duration-150',
    tertiary: 'bg-transparent text-text-primary border border-border hover:bg-gray-50 transition-all duration-150'
  };

  return (
    <motion.button
      className={`px-4 py-2 rounded-md font-medium text-sm transition-all duration-150 ${variants[variant]} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={{ opacity: 0.95 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </motion.button>
  );
};
