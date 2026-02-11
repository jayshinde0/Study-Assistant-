import { motion } from 'framer-motion';

export const Card = ({ children, className = '', ...props }) => (
  <motion.div
    className={`card ${className}`}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.2 }}
    {...props}
  >
    {children}
  </motion.div>
);
