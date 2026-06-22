import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ progress }) => {
  return (
    <div className="w-full bg-slate-200 rounded-full h-4 mb-4 overflow-hidden border border-slate-300">
      <motion.div 
        className="bg-blue-600 h-4 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      ></motion.div>
    </div>
  );
};

export default ProgressBar;
