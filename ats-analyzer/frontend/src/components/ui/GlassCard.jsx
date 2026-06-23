import { motion } from 'framer-motion';

/* Reusable animated glass card */
export default function GlassCard({ children, className = '', delay = 0, hover = true }) {
  return (
    <motion.div
      className={`glass-card rounded-2xl p-5 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -2, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' } : {}}
    >
      {children}
    </motion.div>
  );
}
