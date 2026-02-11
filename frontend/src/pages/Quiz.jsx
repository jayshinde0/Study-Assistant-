import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import client from '../api/client';

export const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    const quizData = location.state?.quiz || JSON.parse(localStorage.getItem('currentQuiz') || 'null');
    if (quizData) {
      setQuiz(quizData);
      setAnswers(new Array(quizData.questions?.length || 0).fill(''));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [location]);

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const res = await client.post(`/quiz/${quiz._id}/submit`, { answers });
      setResult(res.data.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Quiz submission failed:', error);
      alert('Failed to submit quiz');
    }
  };

  if (loading) return <div className="text-center py-12">Loading quiz...</div>;
  if (!quiz) return (
    <div className="text-center py-12">
      <p className="text-gray-600 mb-4">No quiz data found</p>
      <Button onClick={() => navigate('/content')}>Go Back to Content</Button>
    </div>
  );

  if (submitted && result) {
    const xpEarned = Math.floor(result.accuracy / 10);
    const scoreColor = result.accuracy >= 80 ? 'text-green-600' : result.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600';
    const scoreBg = result.accuracy >= 80 ? 'bg-green-50' : result.accuracy >= 60 ? 'bg-yellow-50' : 'bg-red-50';
    
    return (
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="text-center bg-gradient-to-br from-gray-50 to-gray-100">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <h2 className="text-4xl font-bold mb-6">
              {result.accuracy >= 80 ? '🎉' : result.accuracy >= 60 ? '👍' : '💪'} Quiz Complete!
            </h2>
          </motion.div>
          
          {/* Score Circle */}
          <motion.div
            className={`text-7xl font-bold ${scoreColor} mb-4`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {Math.round(result.accuracy)}%
          </motion.div>
          
          {/* Score Details */}
          <div className={`${scoreBg} rounded-xl p-6 mb-6 border-2 ${
            result.accuracy >= 80 ? 'border-green-200' : result.accuracy >= 60 ? 'border-yellow-200' : 'border-red-200'
          }`}>
            <p className="text-lg font-semibold text-gray-800 mb-4">
              You got <span className="text-primary font-bold text-xl">{result.score}</span> out of <span className="text-primary font-bold text-xl">{quiz.questions.length}</span> questions correct
            </p>
            
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                className="bg-white rounded-lg p-4 shadow-sm"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-3xl font-bold text-green-600">{result.score}</p>
                <p className="text-xs text-gray-600 mt-1">Correct</p>
              </motion.div>
              <motion.div
                className="bg-white rounded-lg p-4 shadow-sm"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-3xl font-bold text-red-600">{quiz.questions.length - result.score}</p>
                <p className="text-xs text-gray-600 mt-1">Incorrect</p>
              </motion.div>
              <motion.div
                className="bg-white rounded-lg p-4 shadow-sm"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-3xl font-bold text-blue-600">+{xpEarned}</p>
                <p className="text-xs text-gray-600 mt-1">XP Earned</p>
              </motion.div>
            </div>
          </div>
          
          {/* Performance Message */}
          <motion.div
            className={`mb-6 p-4 rounded-lg border-l-4 ${
              result.accuracy >= 80 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : result.accuracy >= 60 
                ? 'bg-yellow-50 border-yellow-500 text-yellow-800'
                : 'bg-red-50 border-red-500 text-red-800'
            }`}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {result.accuracy >= 80 && (
              <p className="font-semibold">🌟 Excellent work! You've mastered this topic!</p>
            )}
            {result.accuracy >= 60 && result.accuracy < 80 && (
              <p className="font-semibold">Good job! Keep practicing to improve further.</p>
            )}
            {result.accuracy < 60 && (
              <p className="font-semibold">Keep learning! Review the material and try again.</p>
            )}
          </motion.div>
          
          {/* Review Section */}
          {showReview && (
            <motion.div
              className="mb-6 text-left max-h-96 overflow-y-auto border rounded-lg p-4 bg-white"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-bold mb-4 text-lg">📋 Answer Review</h3>
              {quiz.questions?.map((q, idx) => {
                const userAnswer = result.userAnswers?.[idx];
                const isCorrect = userAnswer?.isCorrect;
                return (
                  <motion.div
                    key={idx}
                    className="mb-4 pb-4 border-b last:border-b-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 * idx }}
                  >
                    <p className="font-semibold text-sm mb-2">Q{idx + 1}: {q.question}</p>
                    <p className={`text-sm mb-2 font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">Your answer: <span className="font-medium">{userAnswer?.answer}</span></p>
                    <p className="text-xs text-gray-600 mb-2">Correct answer: <span className="font-medium">{q.correctAnswer}</span></p>
                    <p className="text-xs text-gray-700 italic bg-gray-50 p-2 rounded">{q.explanation}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              variant="secondary"
              onClick={() => setShowReview(!showReview)} 
              className="flex-1"
            >
              {showReview ? '👁️ Hide Review' : '👁️ Review Answers'}
            </Button>
            <Button onClick={() => navigate('/content')} className="flex-1">
              ← Back to Content
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const question = quiz.questions?.[currentQuestion];
  const progress = ((currentQuestion + 1) / (quiz.questions?.length || 1)) * 100;

  if (!question) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No questions available</p>
        <Button onClick={() => navigate('/content')}>Go Back</Button>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-3">
          <span className="text-sm font-bold text-gray-700">Question {currentQuestion + 1} of {quiz.questions?.length || 0}</span>
          <span className="text-sm font-medium px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full">
            {quiz.difficulty}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6 bg-gradient-to-br from-white to-gray-50">
        <motion.h2
          className="text-2xl font-bold mb-8 text-gray-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {question.question}
        </motion.h2>

        <div className="space-y-3 mb-8">
          {question.options?.map((option, idx) => (
            <motion.button
              key={idx}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all font-medium ${
                answers[currentQuestion] === option
                  ? 'border-primary bg-primary bg-opacity-10 text-primary shadow-lg'
                  : 'border-gray-200 hover:border-primary text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => handleAnswer(option)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  answers[currentQuestion] === option
                    ? 'border-primary bg-primary'
                    : 'border-gray-300'
                }`}>
                  {answers[currentQuestion] === option && (
                    <span className="text-white text-sm">✓</span>
                  )}
                </div>
                <span>{option}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-6 border-t">
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            ← Previous
          </Button>
          {currentQuestion === (quiz.questions?.length || 0) - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answers.some(a => !a)}
              className="flex-1"
            >
              Submit Quiz ✓
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex-1"
            >
              Next →
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
