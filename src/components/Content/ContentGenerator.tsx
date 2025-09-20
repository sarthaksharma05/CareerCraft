import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { 
  Lightbulb, 
  MessageSquare, 
  Hash, 
  FileText, 
  Wand2,
  Copy,
  Briefcase,
  Save,
  Download,
  Crown
} from 'lucide-react';
import { generateContent as geminiGenerateContent } from '../../lib/gemini';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

interface ContentForm {
  type: string;
  niche: string;
  platform: string; // This will now be 'Job Role'
  additionalContext: string;
}

export function ContentGenerator() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [loadingText, setLoadingText] = useState('Generating...');
  
  const { register, handleSubmit, watch, setValue, control } = useForm<ContentForm>({
    defaultValues: {
      type: 'cover-letter',
      niche: profile?.niche || '',
      platform: '', // Changed from 'instagram'
      additionalContext: '',
    }
  });
  const selectedJobRole = useWatch({ control, name: 'platform' });
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      const texts = [
        'Thinking of great ideas...',
        'Writing a viral script...',
        'Crafting the perfect caption...',
        'Finding trending hashtags...',
        'Polishing the content...'
      ];
      let i = 0;
      setLoadingText(texts[i]);
      interval = setInterval(() => setLoadingText(texts[++i % texts.length]), 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const resumeTemplates: { [key: string]: string } = {
    'software-engineer': `Job Description:
Seeking a Software Engineer with 5+ years of experience in React, Node.js, and AWS. Responsibilities include developing new user-facing features, building reusable code, and optimizing applications for maximum speed and scalability.

My Experience:
I am a full-stack developer with 6 years of experience, specializing in the MERN stack. I have a proven track record of leading projects from conception to deployment. Proficient in CI/CD pipelines and agile methodologies.
`,
    'product-manager': `Job Description:
We are looking for an experienced Product Manager to lead our mobile application team. You will be responsible for the product planning and execution throughout the Product Lifecycle, including gathering and prioritizing product and customer requirements.

My Experience:
As a Product Manager for 5 years, I have successfully launched three major products, resulting in a 40% increase in user engagement. I am skilled in market research, user story creation, and A/B testing.
`,
    'ux-designer': `Job Description:
Seeking a talented UX Designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design, possess superior UX skills and be able to translate high-level requirements into interaction flows and artifacts.

My Experience:
I am a UX Designer with a strong portfolio of mobile and web applications. I am proficient in Figma, Sketch, and Adobe XD. My design process is user-centric, and I have extensive experience with usability testing and creating design systems.
`,
  };

  useEffect(() => {
    if (selectedJobRole && resumeTemplates[selectedJobRole]) {
      setValue('additionalContext', resumeTemplates[selectedJobRole]);
    } else {
      setValue('additionalContext', '');
    }
  }, [selectedJobRole, setValue]);

  const isPro = profile?.is_pro || false;

  const contentTypes = [
    { value: 'cover-letter', label: 'Cover Letter', icon: FileText, pro: false },
    { value: 'resume-summary', label: 'Resume Summary', icon: MessageSquare, pro: false },
    { value: 'bullet-points', label: 'Job Bullet Points', icon: Lightbulb, pro: false },
    { value: 'linkedin-summary', label: 'LinkedIn Summary', icon: Briefcase, pro: true },
  ];

  const platforms = [
    { value: 'software-engineer', label: 'Software Engineer' },
    { value: 'product-manager', label: 'Product Manager' },
    { value: 'data-scientist', label: 'Data Scientist' },
    { value: 'ux-designer', label: 'UX Designer' },
    { value: 'marketing-manager', label: 'Marketing Manager' },
    { value: 'project-manager', label: 'Project Manager' },
  ];

  const niches = [
    'Fitness', 'Business', 'Lifestyle', 'Technology', 'Food', 
    'Travel', 'Fashion', 'Education', 'Entertainment', 'Health'
  ];

  const onSubmit = async (data: ContentForm) => {
    if (!profile?.is_pro && !canGenerate()) {
      toast.error('Upgrade to Pro for unlimited generations');
      return;
    }

    setLoading(true);
    try {
      const content = await geminiGenerateContent(
        data.type,
        data.niche,
        data.platform,
        data.additionalContext
      );
      
      setGeneratedContent(content);
      setContentTitle(`${data.type.charAt(0).toUpperCase() + data.type.slice(1)} for a ${data.platform}`);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
      });
      toast.success('Content generated successfully!');
      
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const canGenerate = () => {
    // Simple rate limiting for free users (in production, this would be more sophisticated)
    return profile?.is_pro || true; // For demo purposes
  };

  const saveContent = async () => {
    if (!profile || !generatedContent) return;

    try {
      const { error } = await supabase
        .from('generated_content')
        .insert({
          user_id: profile.id,
          type: watch('type'),
          title: contentTitle,
          content: generatedContent,
          niche: watch('niche'),
          platform: watch('platform'),
        });

      if (error) throw error;
      toast.success('Content saved successfully!');
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Content Generator</h1>
            <p className="text-gray-600">Create engaging content with AI assistance</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Content Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Content Type
            </label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {contentTypes.map((type) => {
                const isLocked = type.pro && !isPro;
                return (
                  <div key={type.value}>
                    <label className={`relative rounded-lg transition-all duration-300 ${isLocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
                      <input
                        {...register('type')}
                        type="radio"
                        value={type.value}
                        className="sr-only peer"
                        disabled={isLocked}
                        aria-label={type.label}
                      />
                      <div className={`flex flex-col items-center p-4 border-2 rounded-lg ${
                        watch('type') === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200'
                      } ${isLocked ? 'bg-gray-100' : 'cursor-pointer hover:border-primary-300 peer-checked:border-primary-500 peer-checked:bg-primary-50'}`}>
                        <type.icon className="h-6 w-6 text-gray-400 peer-checked:text-primary-600 mb-2" />
                        <span className="text-sm font-medium text-gray-700 peer-checked:text-primary-700">
                          {type.label}
                        </span>
                      </div>
                      {isLocked && (
                        <div className="absolute top-2 right-2 flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                          <Crown className="h-3 w-3" />
                          <span>PRO</span>
                        </div>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Niche Selection */}
            <div className="hidden">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                {...register('niche')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a niche</option>
                {niches.map((niche) => (
                  <option key={niche.toLowerCase()} value={niche.toLowerCase()}>
                    {niche}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Selection */}
            <div>
              <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-2">
                Job Role
              </label>
              <select
                {...register('platform')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {platforms.map((platform) => (
                  <option key={platform.value} value={platform.value}>
                    {platform.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description & Your Experience
            </label>
            <textarea
              {...register('additionalContext')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add any specific requirements, tone, or context..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-secondary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{loadingText}</span>
              </div>
            ) : (
              'Generate Content'
            )}
          </button>
        </form>
      </div>

      {/* Generated Content */}
      {generatedContent && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{contentTitle}</h3>
            <div className="flex space-x-2">
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <Copy className="h-5 w-5" />
              </button>
              <button
                onClick={saveContent}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Save content"
              >
                <Save className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
              {generatedContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}