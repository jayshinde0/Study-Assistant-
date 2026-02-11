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
    
    return (
      <motion.div
        className="max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Card className="text-center">
          <h2 className="text-3xl font-bold mb-6">🎉 Quiz Complete!</h2>
          
          {/* Score Circle */}
          <div className={`text-6xl font-bold ${scoreColor} mb-4`}>
            {Math.round(result.accuracy)}%
          </div>
          
          {/* Score Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-lg font-semibold text-gray-800 mb-4">
              You got <span className="text-primary">{result.score}</span> out of <span className="text-primary">{quiz.questions.length}</span> questions correct
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded p-3">
                <p className="text-2xl font-bold text-green-600">{result.score}</p>
                <p className="text-xs text-gray-600">Correct</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-2xl font-bold text-red-600">{quiz.questions.length - result.score}</p>
                <p className="text-xs text-gray-600">Incorrect</p>
              </div>
              <div className="bg-white rounded p-3">
                <p className="text-2xl font-bold text-blue-600">{xpEarned}</p>
                <p className="text-xs text-gray-600">XP Earned</p>
              </div>
            </div>
          </div>
          
          {/* Quiz Info */}
          <div className="space-y-2 mb-6 text-sm text-gray-600">
            <p>Difficulty: <span className="font-semibold capitalize">{result.difficulty}</span></p>
            <p>Time Taken: <span className="font-semibold">Just now</span></p>
          </div>
          
          {/* Performance Message */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            {result.accuracy >= 80 && (
              <p className="text-blue-800 font-semibold">🌟 Excellent work! You've mastered this topic!</p>
            )}
            {result.accuracy >= 60 && result.accuracy < 80 && (
              <p className="text-blue-800 font-semibold">👍 Good job! Keep practicing to improve further.</p>
            )}
            {result.accuracy < 60 && (
              <p className="text-blue-800 font-semibold">💪 Keep learning! Review the material and try again.</p>
            )}
          </div>
          
          {/* Review Section */}
          {showReview && (
            <div className="mb-6 text-left max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
              <h3 className="font-bold mb-4">Answer Review</h3>
              {quiz.questions?.map((q, idx) => {
                const userAnswer = result.userAnswers?.[idx];
                const isCorrect = userAnswer?.isCorrect;
                return (
                  <div key={idx} className="mb-4 pb-4 border-b last:border-b-0">
                    <p className="font-semibold text-sm mb-2">Q{idx + 1}: {q.question}</p>
                    <p className={`text-sm mb-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">Your answer: {userAnswer?.answer}</p>
                    <p className="text-xs text-gray-600 mb-1">Correct answer: {q.correctAnswer}</p>
                    <p className="text-xs text-gray-700 italic">{q.explanation}</p>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex gap-3">
            <Button 
              variant="secondary"
              onClick={() => setShowReview(!showReview)} 
              className="flex-1"
            >
              {showReview ? 'Hide Review' : 'Review Answers'}
            </Button>
            <Button onClick={() => navigate('/content')} className="flex-1">
              Back to Content
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
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Question {currentQuestion + 1} of {quiz.questions?.length || 0}</span>
          <span className="text-sm text-gray-600">Difficulty: {quiz.difficulty}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <h2 className="text-xl font-bold mb-6">{question.question}</h2>

        <div className="space-y-3 mb-6">
          {question.options?.map((option, idx) => (
            <motion.button
              key={idx}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                answers[currentQuestion] === option
                  ? 'border-primary bg-primary bg-opacity-10'
                  : 'border-gray-200 hover:border-primary'
              }`}
              onClick={() => handleAnswer(option)}
              whileHover={{ scale: 1.02 }}
            >
              {option}
            </motion.button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            Previous
          </Button>
          {currentQuestion === (quiz.questions?.length || 0) - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={answers.some(a => !a)}
              className="flex-1"
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="flex-1"
            >
              Next
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};
