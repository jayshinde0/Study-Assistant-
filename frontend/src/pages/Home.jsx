import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, Zap, Brain, BarChart3, Upload, Sparkles, 
  ArrowRight, Check, Users, Lightbulb, Rocket, Target,
  Code, Database, Cpu, GitBranch, FileText, MessageSquare, TrendingUp
} from 'lucide-react';
import { Button } from '../components/Button';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { staggerChildren: 0.1, delayChildren: 0.2 }
};

export const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center gap-3 text-2xl font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-gray-900">Study Assistant</span>
          </motion.div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('/register')}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6 px-4 py-2 bg-blue-100 border border-blue-300 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-blue-700 text-sm font-semibold">📚 Smart Learning Platform</span>
            </motion.div>

            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight text-gray-900">
              Master Any Subject
              <br />
              <span className="text-blue-600">
                in Half the Time
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Upload your study materials, get AI-generated quizzes, and track your progress with intelligent analytics. Study smarter, not harder.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate('/register')} className="px-8 py-4 text-lg">
                Start Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="secondary" className="px-8 py-4 text-lg">
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Hero Image - Clean Dashboard Preview */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
              {/* Header */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Dashboard</h3>
                <p className="text-sm text-gray-600">Welcome back! Here's your learning overview</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Materials', icon: Upload, color: 'bg-blue-100', value: '12', textColor: 'text-blue-700' },
                  { label: 'Quizzes', icon: Zap, color: 'bg-teal-100', value: '8', textColor: 'text-teal-700' },
                  { label: 'Accuracy', icon: BarChart3, color: 'bg-orange-100', value: '85%', textColor: 'text-orange-700' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className={`${item.color} rounded-xl p-6 text-center`}
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                  >
                    <item.icon className={`w-8 h-8 mx-auto mb-3 ${item.textColor}`} />
                    <p className={`text-3xl font-bold ${item.textColor} mb-1`}>{item.value}</p>
                    <p className={`text-xs font-semibold ${item.textColor}`}>{item.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Materials */}
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-3 uppercase">Recent Materials</p>
                <div className="space-y-3">
                  {[
                    { title: 'Biology Chapter 5', topics: '5 topics' },
                    { title: 'Physics Fundamentals', topics: '8 topics' },
                    { title: 'Chemistry Basics', topics: '6 topics' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-200 to-teal-200 rounded-lg flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.topics}</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ArrowRight className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Everything You Need
              <br />
              <span className="text-blue-600">
                to Study Effectively
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Powerful tools designed for modern learners
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
          >
            {[
              {
                icon: Upload,
                title: 'Easy Upload',
                desc: 'PDF, Word, Text, or URLs',
                color: 'bg-blue-100',
                iconColor: 'text-blue-600'
              },
              {
                icon: Sparkles,
                title: 'AI Quizzes',
                desc: 'Auto-generated questions',
                color: 'bg-teal-100',
                iconColor: 'text-teal-600'
              },
              {
                icon: Brain,
                title: 'Smart Learning',
                desc: 'Focuses on weak areas',
                color: 'bg-orange-100',
                iconColor: 'text-orange-600'
              },
              {
                icon: BarChart3,
                title: 'Track Progress',
                desc: 'Detailed analytics',
                color: 'bg-red-100',
                iconColor: 'text-red-600'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
                variants={fadeInUp}
                whileHover={{ y: -5 }}
              >
                <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              4 simple steps to master any subject
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Upload',
                desc: 'Share your study materials',
                icon: Upload,
                color: 'bg-blue-600'
              },
              {
                step: '2',
                title: 'Analyze',
                desc: 'AI extracts key topics',
                icon: Brain,
                color: 'bg-teal-600'
              },
              {
                step: '3',
                title: 'Quiz',
                desc: 'Answer AI questions',
                icon: Zap,
                color: 'bg-orange-600'
              },
              {
                step: '4',
                title: 'Improve',
                desc: 'View analytics & progress',
                icon: BarChart3,
                color: 'bg-red-600'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="bg-white rounded-xl border border-gray-200 p-8 h-full">
                  <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-white font-bold`}>
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 transform -translate-y-1/2 items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Built on Modern Tech
            </h2>
            <p className="text-gray-600 text-lg">
              Scalable, secure, and performant architecture
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Frontend */}
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-8"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Frontend</h3>
              </div>
              <ul className="space-y-3">
                {['React 18', 'Tailwind CSS', 'Framer Motion', 'Recharts'].map((tech, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-blue-600" />
                    {tech}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Backend */}
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Backend</h3>
              </div>
              <ul className="space-y-3">
                {['Node.js + Express', 'JWT Auth', 'Multer Upload', 'Ollama AI'].map((tech, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-teal-600" />
                    {tech}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Database */}
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Database className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Database</h3>
              </div>
              <ul className="space-y-3">
                {['MongoDB', 'User Management', 'Quiz Storage', 'Analytics'].map((tech, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-orange-600" />
                    {tech}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* System Flow */}
          <motion.div
            className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-2xl font-bold mb-8 text-center text-gray-900">System Architecture</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {[
                { label: 'User', icon: Users, color: 'bg-blue-600' },
                { label: 'Frontend', icon: Code, color: 'bg-blue-600' },
                { label: 'API', icon: GitBranch, color: 'bg-teal-600' },
                { label: 'Backend', icon: Cpu, color: 'bg-teal-600' },
                { label: 'Database', icon: Database, color: 'bg-orange-600' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className={`${item.color} p-4 rounded-lg mb-2 text-white`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                  {idx < 4 && (
                    <ArrowRight className="w-4 h-4 text-gray-400 mt-2 hidden md:block" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Why Study Assistant?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Lightbulb,
                title: 'Smart Analysis',
                desc: 'AI automatically extracts key topics and concepts from your materials'
              },
              {
                icon: Target,
                title: 'Personalized Path',
                desc: 'Adaptive quizzes focus on your weak areas for efficient learning'
              },
              {
                icon: Rocket,
                title: 'Fast Generation',
                desc: 'Get AI-generated quizzes in seconds, not hours'
              },
              {
                icon: TrendingUp,
                title: 'Detailed Analytics',
                desc: 'Track progress, identify patterns, and measure improvement'
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="flex gap-6 p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all"
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 via-teal-500 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Study Smarter?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join students mastering their subjects with AI-powered learning
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate('/register')} className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 font-semibold">
                Get Started Free <Rocket className="w-5 h-5 ml-2" />
              </Button>
              <button onClick={() => navigate('/register')} className="px-8 py-4 text-lg font-semibold bg-white bg-opacity-20 text-white border-2 border-white rounded-lg hover:bg-opacity-30 transition-all duration-200 transform hover:scale-105">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4 text-gray-900">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900">Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-gray-900">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>&copy; 2026 Study Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
