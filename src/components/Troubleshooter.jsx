import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, ArrowRight, RefreshCcw, ShieldAlert, FlaskConical } from 'lucide-react';
import knowledgeBase from '../data/knowledgeBase.json';

export default function Troubleshooter() {
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const tree = knowledgeBase.troubleshooter;
  const currentNode = tree[currentNodeId];

  const handleRestart = () => {
    setCurrentNodeId('start');
  };

  return (
    <div className="troubleshooter animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Bug /> Pest & Disease Troubleshooter</h2>
        <p className="text-muted">Interactive diagnostic tool for common issues</p>
      </div>

      <div className="card max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {currentNode.type !== 'solution' ? (
            <motion.div
              key={currentNodeId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-6 text-center">{currentNode.question}</h3>
              <div className="flex flex-col gap-3">
                {currentNode.options.map((option, idx) => (
                  <button 
                    key={idx}
                    className="btn-outline flex items-center justify-between text-left p-4 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    onClick={() => setCurrentNodeId(option.next)}
                  >
                    <span>{option.label}</span>
                    <ArrowRight size={18} />
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentNodeId}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-center mb-6">
                <ShieldAlert className="mx-auto text-warning mb-2" size={48} />
                <h3 className="text-2xl font-bold">{currentNode.diagnosis}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-card p-4 rounded-lg border" style={{ borderColor: 'var(--color-primary-200)' }}>
                  <h4 className="font-semibold flex items-center gap-2 mb-2" style={{ color: 'var(--color-primary-600)' }}>
                    <Leaf size={18} /> Organic Solution
                  </h4>
                  <p className="text-sm">{currentNode.organic}</p>
                </div>
                <div className="bg-card p-4 rounded-lg border" style={{ borderColor: '#bfdbfe' }}>
                  <h4 className="font-semibold flex items-center gap-2 mb-2" style={{ color: '#3b82f6' }}>
                    <FlaskConical size={18} /> Chemical Solution
                  </h4>
                  <p className="text-sm">{currentNode.chemical}</p>
                </div>
              </div>

              <div className="text-center mt-6 border-t pt-4">
                <button className="btn-primary flex items-center gap-2 mx-auto" onClick={handleRestart}>
                  <RefreshCcw size={18} /> Start Over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Quick Leaf icon mock for the Troubleshooter component if not imported
const Leaf = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 22 12 12"/>
  </svg>
);
