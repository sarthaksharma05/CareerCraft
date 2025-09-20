import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  Clock, 
  Crown,
  AlertCircle,
  Sparkles,
  Rocket,
  Star,
  Calendar,
  ExternalLink,
  Mail,
  Bell,
  Zap,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TavusService } from '../../lib/tavus';
import { ElevenLabsService } from '../../lib/elevenlabs';

export function VideoStudio() {
  const { profile } = useAuth();
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [email, setEmail] = useState(profile?.email || '');
  const [notifying, setNotifying] = useState(false);
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  const isPro = profile?.is_pro || false;
  
  const handleNotifyMe = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setNotifying(true);
    try {
      // Simulate API call to save notification preference
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Great! We\'ll notify you when AI Video Studio launches');
      setShowNotifyModal(false);
    } catch (error) {
      toast.error('Failed to save notification preference');
    } finally {
      setNotifying(false);
    }
  };

  // Create Tavus service with the provided API key
  const tavus = new (class extends TavusService {
    constructor() {
      super();
      // Override the API key with the provided one
      (this as any).apiKey = '633b83f699db49f3975715e4c05e203b';
      (this as any).isValidKey = true;
      (this as any).baseUrl = 'https://tavusapi.com/v2';
      console.log('✅ Tavus service initialized with provided API key');
    }
  })();
  const elevenlabs = new ElevenLabsService();

  // --- Tavus Replica IDs (update here if needed) ---
  const REPLICA_IDS = [
    { id: 'rf4703150052', name: 'Professional Male', pro: false },
    { id: 'r665388ec672', name: 'Professional Female', pro: false },
    { id: 'r92debe21318', name: 'Energetic Male', pro: true },
    { id: 'r9d30b0e55ac', name: 'Friendly Female', pro: true },
  ];

  // Default voice and replica IDs
  const defaultVoiceId = '21m00Tcm4TlvDq8ikWAM'; // ElevenLabs default voice
  const [selectedReplicaId, setSelectedReplicaId] = useState<string>(REPLICA_IDS[0].id);

  // Generate video handler
  const handleGenerateVideo = async () => {
    const replicaIdToUse = selectedReplicaId;
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setProgress(0);
    
    try {
      console.log('🎬 Starting AI video generation...');
      console.log('📝 Script:', script);
      console.log('🎭 Replica ID:', replicaIdToUse);
      console.log('🔊 Voice ID:', defaultVoiceId);
      
      // 1. Generate voiceover with ElevenLabs
      console.log('🎵 Generating voiceover with ElevenLabs...');
      const audioUrl = await elevenlabs.generateVoice(script, defaultVoiceId);
      console.log('✅ Voiceover generated:', audioUrl);
      
      // 2. Generate video with Tavus
      console.log('🎬 Creating video with Tavus...');
      const { videoId } = await tavus.createVideo(script, replicaIdToUse, {
        title: 'AI Video - ' + new Date().toLocaleDateString(),
      });
      console.log('✅ Video creation initiated, ID:', videoId);
      
      // 3. Poll for video status
      console.log('⏳ Polling for video completion...');
      let status = 'generating';
      let pollCount = 0;
      const maxPolls = 300; // 2 minutes max
      
      while (status !== 'ready' && status !== 'completed' && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait 4 seconds
        console.log(`📊 Poll ${pollCount + 1}/${maxPolls} - Checking status...`);
        
        const res = await tavus.getVideoStatus(videoId);
        console.log('DEBUG: Tavus status:', res);
        // Try both top-level and nested download_url
        let downloadUrl = res.download_url;
        if (!downloadUrl && typeof res === 'object' && res !== null && 'data' in res) {
          const dataObj = (res as any).data;
          if (dataObj && typeof dataObj === 'object' && 'download_url' in dataObj) {
            downloadUrl = dataObj.download_url;
          }
        }
        console.log('DEBUG: download_url:', downloadUrl);
        
        setProgress(res.progress || 0);
        status = res.status;
        
        if ((status === 'ready' || status === 'completed') && downloadUrl) {
          console.log('🎉 Video completed! URL:', downloadUrl);
          setVideoUrl(downloadUrl);
          break;
        } else if (status === 'failed') {
          throw new Error(res.error_message || 'Video generation failed');
        }
        
        pollCount++;
      }
      
      if (status !== 'completed') {
        setError('Video generation timed out. Please try again.');
      }
      
    } catch (err: any) {
      console.error('❌ Video generation error:', err);
      
      setError(err.message || 'Failed to generate video. Please check your API keys and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI Avatar Videos',
      description: 'Create professional videos with realistic AI avatars that speak your script',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Star,
      title: 'Custom Backgrounds',
      description: 'Choose from a variety of professional settings or use your own background',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Zap,
      title: 'Automatic Subtitles',
      description: 'Add perfectly synchronized captions in multiple styles and languages',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Crown,
      title: 'Pro Editing Tools',
      description: 'Fine-tune your videos with professional editing tools and effects',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Container */}
      <div className="space-y-8">
        {/* --- AI Video Generation UI --- */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Create AI Video</h2>
          </div>
          {/* Avatar Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Avatar</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-900"
              value={selectedReplicaId}
              onChange={(e) => setSelectedReplicaId(e.target.value)}
              disabled={isGenerating}
            >
              {REPLICA_IDS.map(replica => {
                const isLocked = replica.pro && !isPro;
                return (
                  <option key={replica.id} value={replica.id} disabled={isLocked}>
                    {replica.name} {isLocked ? '(Pro)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-gray-900"
            rows={4}
            placeholder="Enter your video script here..."
            value={script}
            onChange={e => setScript(e.target.value)}
            disabled={isGenerating}
          />
          <button
            className="bg-black text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
            onClick={handleGenerateVideo}
            disabled={isGenerating || !script.trim() || !selectedReplicaId}
          >
            {isGenerating ? 'Generating...' : 'Generate Video'}
          </button>
          {isGenerating && progress > 0 && (
            <div className="mt-4 text-gray-700">Generating video... Progress: {progress}%</div>
          )}
          {error && !videoUrl && <div className="mt-4 text-red-600">{error}</div>}
          {videoUrl && (
            <div className="mt-6">
              <video src={videoUrl} controls className="w-full rounded-lg shadow-lg" />
              <a href={videoUrl} download className="block mt-2 text-blue-600 underline">Download Video</a>
            </div>
          )}
        </div>
        {/* --- End AI Video Generation UI --- */}
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Video Studio</h1>
              <p className="text-gray-600">Create professional videos with AI avatars powered by Tavus</p>
            </div>
          </div>
        </div>
        {/* Features Preview */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">What's Coming in AI Video Studio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Timeline */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Launch Timeline</h2>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-8">
              {/* Timeline Items */}
              <div className="relative flex items-start">
                <div className="absolute left-8 top-0 -ml-3.5 h-7 w-7 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-semibold text-gray-900">Development Started</h3>
                  <p className="text-gray-600 mb-2">Our team began building the Pro Editing Tools!</p>
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="absolute left-8 top-0 -ml-3.5 h-7 w-7 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-semibold text-gray-900">Alpha Testing</h3>
                  <p className="text-gray-600 mb-2">Internal testing and quality assurance</p>
                  <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Completed</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="absolute left-8 top-0 -ml-3.5 h-7 w-7 rounded-full bg-blue-500 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-semibold text-gray-900">Beta Testing</h3>
                  <p className="text-gray-600 mb-2">Limited access for select users</p>
                  <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>In Progress</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="absolute left-8 top-0 -ml-3.5 h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-semibold text-gray-900">Pro Editing Tools</h3>
                  <p className="text-gray-600 mb-2">Advanced video editing features for creators</p>
                  <div className="inline-flex items-center space-x-2 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Early Access */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-8 border border-purple-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Want Early Access?</h2>
              <p className="text-gray-700 max-w-xl">
                Pro members will get early access to the AI Video Studio before the public launch. 
                Upgrade today to be among the first to create amazing AI videos!
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => setShowNotifyModal(true)} className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all">
                Notify Me
              </button>
              {!profile?.is_pro && (
                <Link to="/pricing">
                  <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all">
                    Upgrade to Pro
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* Notify Modal */}
        {showNotifyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="inline-flex p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-4">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Notified</h3>
                <p className="text-gray-600">
                  We'll let you know as soon as the AI Video Studio is ready for you to use.
                </p>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <input type="checkbox" id="updates" className="mt-1" defaultChecked />
                  <label htmlFor="updates" className="text-sm text-gray-600">Also send me updates about new features and improvements to CareerCraft</label>
                </div>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => setShowNotifyModal(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">Cancel</button>
                <button onClick={handleNotifyMe} disabled={notifying} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">{notifying ? 'Saving...' : 'Notify Me'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}