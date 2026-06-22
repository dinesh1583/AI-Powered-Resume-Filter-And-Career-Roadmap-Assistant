import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Compass } from 'lucide-react';

/**
 * 404 Not Found Page — shown when user navigates to a non-existent route.
 */
const NotFound = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center min-h-[80vh] px-4"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-8"
          style={{ background: 'rgba(99, 102, 241, 0.1)' }}
        >
          <Compass className="w-12 h-12" style={{ color: 'var(--accent-indigo)' }} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-7xl font-black mb-4 gradient-text"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg mb-2 font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Page Not Found
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm mb-8 max-w-md mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex gap-3 justify-center"
        >
          <Link to="/" className="btn-primary py-2.5 px-6 text-sm rounded-xl flex items-center gap-2">
            <Home size={16} /> Go Home
          </Link>
          <button onClick={() => window.history.back()}
            className="btn-secondary py-2.5 px-6 text-sm rounded-xl flex items-center gap-2">
            <ArrowLeft size={16} /> Go Back
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;
