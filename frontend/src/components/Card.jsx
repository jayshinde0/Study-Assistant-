import { motion } from 'framer-motion';

export const Card = ({ children, className = '', ...props }) => (
  <motion.div
    className={`bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-200 p-6 transition-all duration-300 ${className}`}
    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
);
