import Quiz from '../models/Quiz.js';
import Content from '../models/Content.js';
import User from '../models/User.js';
import geminiService from './geminiService.js';
import topicProgressService from './topicProgressService.js';
import { AppError } from '../middleware/errorHandler.js';

export class QuizService {
  async generateQuiz(userId, contentId, difficulty = 'medium') {
    const content = await Content.findById(contentId);
    if (!content) {
      throw new AppError('Content not found', 404);
    }

    // Get weak topics for adaptive generation
    const weakTopics = await topicProgressService.getWeakTopics(userId);
    const weakTopicNames = weakTopics.map(t => t.topic);
    
    // Inject weak topics into prompt if they exist
    let prompt = content.originalText;
    if (weakTopicNames.length > 0) {
      prompt = `Generate quiz questions. Focus more on these weak topics: ${weakTopicNames.join(', ')}\n\nContent: ${content.originalText}`;
    }

    const questions = await geminiService.generateQuiz(prompt, difficulty, 5);
    
    const quiz = new Quiz({
      userId,
      contentId,
      difficulty,
      questions: questions.map((q, idx) => ({
        id: `q${idx}`,
        question: q.question,
        type: 'mcq',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: content.topics[idx % content.topics.length] || 'General'
      }))
    });

    await quiz.save();
    return quiz;
  }

  async submitQuiz(quizId, userId, answers) {
    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.userId.toString() !== userId) {
      throw new AppError('Quiz not found', 404);
    }

    let correctCount = 0;
    quiz.userAnswers = answers.map((answer, idx) => {
      const question = quiz.questions[idx];
      
      // Normalize both answer and correctAnswer for comparison
      const userAnswer = String(answer).trim().toLowerCase();
      const correctAnswer = String(question.correctAnswer).trim().toLowerCase();
      
      // Check if answer matches correct answer
      const isCorrect = userAnswer === correctAnswer;
      
      // Also check if answer is one of the options (in case of index-based answers)
      let isCorrectOption = false;
      if (!isCorrect && question.options) {
        const optionIndex = question.options.findIndex(opt => 
          String(opt).trim().toLowerCase() === userAnswer
        );
        isCorrectOption = optionIndex !== -1 && 
          String(question.options[optionIndex]).trim().toLowerCase() === correctAnswer;
      }
      
      const finalIsCorrect = isCorrect || isCorrectOption;
      if (finalIsCorrect) correctCount++;
      
      console.log(`📝 Q${idx}: "${userAnswer}" vs "${correctAnswer}" = ${finalIsCorrect}`);
      
      return { questionId: question.id, answer, isCorrect: finalIsCorrect, timeSpent: 0 };
    });

    quiz.score = correctCount;
    quiz.accuracy = (correctCount / quiz.questions.length) * 100;
    quiz.completedAt = new Date();

    await quiz.save();

    // Update topic progress for each question
    for (let idx = 0; idx < quiz.questions.length; idx++) {
      const question = quiz.questions[idx];
      const answer = quiz.userAnswers[idx];
      console.log(`📊 Updating topic "${question.topic}" with isCorrect: ${answer.isCorrect}`);
      await topicProgressService.updateTopicProgress(userId, question.topic, answer.isCorrect);
    }

    // Update user stats
    const user = await User.findById(userId);
    user.totalQuizzesTaken += 1;
    user.averageAccuracy = ((user.averageAccuracy * (user.totalQuizzesTaken - 1)) + quiz.accuracy) / user.totalQuizzesTaken;
    user.xp += Math.floor(quiz.accuracy / 10);
    await user.save();

    console.log(`✅ Quiz ${quizId} completed: ${correctCount}/${quiz.questions.length} (${quiz.accuracy}%)`);
    return quiz;
  }

  async getAdaptiveDifficulty(userId, contentId) {
    const recentQuizzes = await Quiz.find({ userId, contentId }).sort({ createdAt: -1 }).limit(3);
    
    if (recentQuizzes.length === 0) return 'easy';

    const avgAccuracy = recentQuizzes.reduce((sum, q) => sum + q.accuracy, 0) / recentQuizzes.length;

    if (avgAccuracy > 80) return 'hard';
    if (avgAccuracy < 50) return 'easy';
    return 'medium';
  }

  async getQuizHistory(userId) {
    return Quiz.find({ userId }).populate('contentId').sort({ createdAt: -1 });
  }
}

export default new QuizService();
