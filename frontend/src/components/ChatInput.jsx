import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader } from 'lucide-react';

export const ChatInput = ({ onSendMessage, loading, disabled }) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newRows = Math.min(Math.ceil(textareaRef.current.scrollHeight / 24), 5);
      setRows(newRows);
      textareaRef.current.style.height = `${newRows * 24}px`;
    }
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !loading && !disabled) {
      onSendMessage(message);
      setMessage('');
      setRows(1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="border-t border-gray-200 bg-white p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your study materials... (Shift+Enter for new line)"
            disabled={loading || disabled}
            rows={rows}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none disabled:bg-gray-50 disabled:text-gray-500"
          />
          <div className="absolute bottom-3 right-3 text-xs text-gray-400">
            {message.length}/1000
          </div>
        </div>

        <motion.button
          type="submit"
          disabled={loading || disabled || !message.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl flex items-center justify-center hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      {disabled && (
        <motion.p
          className="mt-3 text-sm text-orange-600 flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span>📁</span>
          Please upload some study materials first to start chatting
        </motion.p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        💡 Tip: Ask questions about your uploaded materials for better answers
      </p>
    </motion.form>
  );
};
