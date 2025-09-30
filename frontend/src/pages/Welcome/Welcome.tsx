// frontend/src/pages/Welcome/Welcome.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code, Zap, Globe, Github, Mic, Play } from 'lucide-react';

const Welcome: React.FC = () => {
  return (
    <div className="min-h-screen gradient-bg text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 glass-effect rounded-full mx-4 mt-4 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Zap className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              Multiverse
            </span>
          </div>
          <div className="flex space-x-4">
            <Link to="/login" className="px-6 py-2 rounded-full glass-effect hover:bg-white/20 transition-all">
              Login
            </Link>
            <Link to="/signup" className="px-6 py-2 rounded-full bg-white text-purple-600 font-semibold hover:bg-gray-100 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center mt-20 px-4"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-6">
          Build <span className="bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">Websites</span>
          <br />
          with <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Your Voice</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 max-w-4xl mx-auto glass-effect rounded-2xl p-6">
          The world's first AI web builder that understands your vision through speech. 
          Describe what you want, and watch it come to life instantly.
        </p>

        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 mb-20">
          <Link to="/signup" className="group px-8 py-4 bg-white text-purple-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 animate-glow">
            <Play className="w-5 h-5" />
            <span>Start Building Free</span>
          </Link>
          
          <button className="px-8 py-4 glass-effect rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center space-x-2">
            <Mic className="w-5 h-5" />
            <span>Try Voice Demo</span>
          </button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 mb-20"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index }}
            className="glass-effect rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
            <p className="text-gray-200">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const features = [
  {
    icon: Mic,
    title: "Voice-First Building",
    description: "Describe your website in plain English. Our AI understands natural language and brings your vision to life."
  },
  {
    icon: Code,
    title: "AI-Powered Code",
    description: "Qwen2.5-Coder generates production-ready code with best practices, testing, and deployment configs."
  },
  {
    icon: Github,
    title: "GitHub Integration",
    description: "One-click export to GitHub with proper CI/CD workflows and automatic deployments."
  },
  {
    icon: Globe,
    title: "Instant Netlify Previews",
    description: "Every build gets a live Netlify preview URL. Share and test instantly."
  },
  {
    icon: Zap,
    title: "Multi-Model AI",
    description: "Qwen2.5 for reasoning, Lucy for research, StarCoder for fallback. Always the best output."
  },
  {
    icon: Play,
    title: "Project History",
    description: "Access all your previous projects. Fork, modify, or redeploy anytime."
  }
];

export default Welcome;
