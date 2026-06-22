import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

const RoadmapTimeline = ({ steps, onToggleStep }) => {
  return (
    <div className="relative border-l-2 border-slate-200 ml-4 py-4">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="mb-10 ml-8 relative"
        >
          <span className="absolute -left-12 top-1 bg-white p-1">
            {step.is_completed ? (
              <CheckCircle className="text-green-500 w-6 h-6" />
            ) : (
              <Circle className="text-slate-300 w-6 h-6" />
            )}
          </span>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-slate-800">{step.title}</h3>
              <button
                onClick={() => onToggleStep(step.id, !step.is_completed)}
                className={`px-3 py-1 text-sm rounded-full font-medium transition ${step.is_completed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {step.is_completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
            <p className="text-slate-600 mb-4">{step.description}</p>

            {step.skills && step.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {step.skills.map(skill => (
                  <span key={skill} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {step.resources && step.resources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Recommended Resources</h4>
                <ul className="space-y-2">
                  {step.resources.map((res, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-xs uppercase tracking-wider">{res.type}</span>
                      <a href={res.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{res.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RoadmapTimeline;
