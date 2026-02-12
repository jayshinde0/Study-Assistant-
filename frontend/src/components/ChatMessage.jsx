import { motion } from 'framer-motion';
import { ExternalLink, Copy, Check, BookOpen, Lightbulb } from 'lucide-react';
import { useState } from 'react';

export const ChatMessage = ({ message, isUser, sources, suggestedQuestions, onSuggestedClick }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`max-w-2xl ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-6 py-4 ${
            isUser
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-white border border-border text-text-primary rounded-bl-none shadow-md'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>

          {/* Copy Button */}
          {!isUser && (
            <button
              onClick={copyToClipboard}
              className="mt-3 flex items-center gap-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          )}
        </div>

        {/* Sources */}
        {!isUser && sources && sources.length > 0 && (
          <motion.div
            className="mt-3 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs font-semibold text-text-secondary uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Sources
            </p>
            <div className="flex flex-wrap gap-2">
              {sources.map((source, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-2 bg-primary bg-opacity-10 border border-primary rounded-lg hover:bg-opacity-20 transition-colors cursor-pointer"
                >
                  <span className="text-xs font-medium text-primary">{source.title}</span>
                  <span className="text-xs text-primary font-semibold">
                    {Math.round(source.relevanceScore * 100)}%
                  </span>
                  <ExternalLink className="w-3 h-3 text-primary" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Suggested Questions */}
        {!isUser && suggestedQuestions && suggestedQuestions.length > 0 && (
          <motion.div
            className="mt-4 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" />
              <p className="text-xs font-semibold text-text-secondary uppercase">Follow-up Questions</p>
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestedClick(question)}
                  className="w-full text-left px-4 py-3 bg-bg-primary border border-border rounded-lg hover:border-primary hover:shadow-md transition-all group"
                >
                  <p className="text-sm text-text-primary group-hover:text-primary transition-colors">
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
            isUser
              ? 'bg-primary'
              : 'bg-primary'
          }`}
        >
          {isUser ? 'U' : 'AI'}
        </div>
      </div>
    </motion.div>
  );
};
