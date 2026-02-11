import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  loading = false,
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary'
  };

  return (
    <motion.button
      className={`${variants[variant]} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </motion.button>
  );
};
