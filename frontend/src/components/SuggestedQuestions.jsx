import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight } from 'lucide-react';

export const SuggestedQuestions = ({ questions, onQuestionClick, loading }) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <motion.div
      className="bg-bg-primary border border-border rounded-xl p-6 mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-text-primary">Suggested Questions</h3>
      </div>

      <div className="space-y-2">
        {questions.map((question, idx) => (
          <motion.button
            key={idx}
            onClick={() => onQuestionClick(question)}
            disabled={loading}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full text-left px-4 py-3 bg-white border border-border rounded-lg hover:border-primary hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-primary group-hover:text-primary transition-colors">
                {question}
              </p>
              <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};
