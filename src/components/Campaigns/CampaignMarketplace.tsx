import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Rss, Mail, Search, Edit3, Share2, DollarSign } from 'lucide-react';

export function CampaignMarketplace() {
  const processSteps = [
    {
      icon: Search,
      title: 'Discover Campaigns',
      description: 'Browse exclusive opportunities from leading brands that match your niche.',
      color: 'purple'
    },
    {
      icon: Edit3,
      title: 'Apply & Pitch',
      description: 'Craft your unique proposal and apply to the campaigns that excite you most.',
      color: 'pink'
    },
    {
      icon: Share2,
      title: 'Collaborate',
      description: 'Work directly with brands to produce authentic and engaging content.',
      color: 'indigo'
    },
    {
      icon: DollarSign,
      title: 'Get Paid',
      description: 'Receive secure and timely payments right after your successful collaboration.',
      color: 'emerald'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const iconColors = {
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    emerald: 'bg-emerald-100 text-emerald-600'
  }

  return (
    <div className="flex items-center justify-center min-h-full bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center bg-white p-8 sm:p-12 rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-100"
      >
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror"
          }}
          className="inline-block p-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6"
        >
          <Briefcase className="h-12 w-12 text-white" />
        </motion.div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          The Future of Brand Deals is Coming
        </h1>
        
        <p className="text-md sm:text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
          Our Campaign Marketplace will be an exclusive hub for creators to connect with top brands, manage partnerships, and monetize their content seamlessly.
        </p>

        {/* Process Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 my-12 text-left"
        >
          {processSteps.map((step, index) => (
            <motion.div key={index} variants={itemVariants} className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-full mb-4 ${iconColors[step.color]}`}>
                <step.icon className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-lg text-gray-800 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center justify-center">
            <Rss className="h-5 w-5 mr-2 text-purple-600" />
            Be the First to Know
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Join our launch list and get priority access when the Marketplace goes live.
          </p>
          <form className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your best email address"
              className="w-full sm:w-auto flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              aria-label="Email for notification"
            />
            <button
              type="submit"
              className="w-full sm:w-auto bg-gray-900 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center shadow-md hover:shadow-lg"
            >
              <Mail className="h-4 w-4 mr-2" />
              Notify Me
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}