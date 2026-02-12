import { motion } from 'framer-motion';

export const Card = ({ children, className = '', ...props }) => (
  <motion.div
    className={`bg-white rounded-md border border-border p-4 transition-all duration-150 ${className}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.15 }}
    {...props}
  >
    {children}
  </motion.div>
);
