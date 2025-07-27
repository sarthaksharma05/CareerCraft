import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Mic, Play, Pause, Download, Save, Volume2, AudioWaveform as Waveform, RefreshCw, CheckCircle, AlertCircle, Settings, Wifi, WifiOff, Crown } from 'lucide-react';
import { elevenLabsService } from '../../lib/elevenlabs';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface VoiceoverForm {
  title: string;
  script: string;
  voiceId: string;
}

interface GeneratedVoiceover {
  id: string;
  title: string;
  script: string;
  audioUrl: string;
  voiceId: string;
  createdAt: string;
}

export function VoiceoverStudio() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<any[]>([]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [savedVoiceovers, setSavedVoiceovers] = useState<GeneratedVoiceover[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isElevenLabsConfigured, setIsElevenLabsConfigured] = useState<boolean>(false);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<VoiceoverForm>({
    defaultValues: {
      title: '',
      script: '',
      voiceId: '',
    }
  });

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const isPro = profile?.is_pro || false;
  const freeVoiceCount = 3;

  useEffect(() => {
    checkApiStatus();
    loadVoices();
    loadSavedVoiceovers();
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  // Cleanup blob URLs when audioUrl changes
  useEffect(() => {
    return () => {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const checkApiStatus = async () => {
    try {
      setCheckingConnection(true);
      setApiStatus('checking');
      console.log('🔍 Checking ElevenLabs API status...');
      
      // Test the connection and get status
      const connectionTest = await elevenLabsService.testConnection(profile?.id);
      
      setIsElevenLabsConfigured(connectionTest.connected);
      
      if (connectionTest.connected) {
        setApiStatus('connected');
        console.log('✅ ElevenLabs API is connected');
      } else {
        setApiStatus('error');
        console.warn('⚠️ ElevenLabs API connection failed:', connectionTest.error || connectionTest.statusText);
      }
    } catch (error) {
      console.error('Error checking API status:', error);
      setApiStatus('error');
      setIsElevenLabsConfigured(false);
    } finally {
      setCheckingConnection(false);
    }
  };

  const loadVoices = async () => {
    try {
      console.log('🎤 Loading voices...');
      const voiceList = await elevenLabsService.getVoices();
      console.log('✅ Voices loaded:', voiceList.length);
      setVoices(voiceList);
      
      if (voiceList.length > 0) {
        setValue('voiceId', voiceList[0].voice_id);
        console.log('✅ Default voice set to:', voiceList[0].name);
      }
    } catch (error) {
      console.error('❌ Error loading voices:', error);
      toast.error('Failed to load voices. Using default voices.');
    }
  };

  const loadSavedVoiceovers = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('voiceovers')
        .select('*')
        .eq('user_id', profile.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Convert to our interface format and filter out any with blob URLs
      const voiceovers: GeneratedVoiceover[] = (data || [])
        .filter(item => item.audio_url && !item.audio_url.startsWith('blob:'))
        .map(item => ({
          id: item.id,
          title: item.title,
          script: item.script,
          audioUrl: item.audio_url || '',
          voiceId: item.voice_id,
          createdAt: item.created_at
        }));
      
      setSavedVoiceovers(voiceovers);
    } catch (error) {
      console.error('Error loading saved voiceovers:', error);
    }
  };

  const onSubmit = async (data: VoiceoverForm) => {
    if (!profile?.is_pro && !canGenerateVoice()) {
      toast.error('Upgrade to Pro for unlimited voiceover generations');
      return;
    }

    if (!data.script.trim()) {
      toast.error('Please enter a script to generate voiceover');
      return;
    }

    if (!data.title.trim()) {
      toast.error('Please enter a title for your voiceover');
      return;
    }

    if (!data.voiceId) {
      toast.error('Please select a voice');
      return;
    }

    // Validate script length
    if (data.script.length > 5000) {
      toast.error('Script is too long. Maximum 5000 characters allowed.');
      return;
    }

    setLoading(true);
    setCurrentTitle(data.title);

    try {
      console.log('🎤 Starting voiceover generation...');
      console.log('Script:', data.script.substring(0, 100) + '...');
      console.log('Voice ID:', data.voiceId);
      console.log('Title:', data.title);
      
      const generatedAudioUrl = await elevenLabsService.generateVoice(data.script, data.voiceId);
      
      if (!generatedAudioUrl) {
        throw new Error('No audio URL returned from voice generation');
      }

      console.log('✅ Voice generation successful!');
      
      // Set the new audio URL
      setAudioUrl(generatedAudioUrl);
      
      // Save to database if we have a valid URL
      if (profile && generatedAudioUrl && !generatedAudioUrl.startsWith('blob:')) {
        try {
          const { data: savedVoiceover, error } = await supabase
            .from('voiceovers')
            .insert({
              user_id: profile.id,
              title: data.title,
              script: data.script,
              voice_id: data.voiceId,
              audio_url: generatedAudioUrl,
              status: 'completed',
            })
            .select()
            .single();

          if (error) {
            console.error('Database save error:', error);
            toast.warning('Voiceover generated but failed to save to history');
          } else {
            console.log('✅ Voiceover saved to database');
            loadSavedVoiceovers();
          }
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Don't fail the whole operation for database issues
        }
      }
      
      toast.success('🎉 Voiceover generated successfully!');
      
      // Refresh API status after successful generation
      await checkApiStatus();
    } catch (error: any) {
      console.error('❌ Voiceover generation error:', error);
      
      // Show specific error messages to help users understand the issue
      if (error.message.includes('Authentication is required')) {
        toast.error('Please sign in to generate voiceovers');
      } else if (error.message.includes('API is not configured')) {
        toast.error('Voice generation is not available. Please contact support.');
      } else if (error.message.includes('Usage limit')) {
        toast.error(error.message);
      } else if (error.message.includes('Invalid voice ID')) {
        toast.error('Selected voice is not available. Please try a different voice.');
      } else if (error.message.includes('Script too long')) {
        toast.error('Script is too long. Please reduce the text length.');
      } else if (error.message.includes('insufficient credits')) {
        toast.error('Voice generation service has insufficient credits. Please contact support.');
      } else if (error.message.includes('rate limit')) {
        toast.error('Voice generation rate limit exceeded. Please try again in a few minutes.');
      } else {
        toast.error('Failed to generate voiceover. Please try again or contact support if the issue persists.');
      }
      
      // Refresh API status after error
      await checkApiStatus();
    } finally {
      setLoading(false);
    }
  };

  const canGenerateVoice = () => {
    // Simple rate limiting for free users
    return profile?.is_pro || true; // For demo purposes
  };

  const playAudio = async (url: string, title?: string) => {
    // Validate URL before proceeding
    if (!url || typeof url !== 'string' || url.trim() === '') {
      console.error('Invalid audio URL provided:', url);
      toast.error('No audio available to play');
      return;
    }

    // Check for MP3 support before playing
    const testAudio = document.createElement('audio');
    if (!testAudio.canPlayType('audio/mpeg')) {
      toast.error('Your browser does not support MP3 audio. Please download the file to play it locally.');
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title || 'voiceover'}.mp3`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      return;
    }

    try {
      console.log('🎵 Attempting to play audio:', url.substring(0, 50) + '...');
      
      // Stop current audio if playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        setIsPlaying(false);
        // Wait a bit to ensure the previous audio is fully stopped
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Create new audio instance
      const audio = new Audio();
      
      // Set up event listeners before setting src
      audio.addEventListener('loadstart', () => {
        console.log('🎵 Audio loading started');
      });

      audio.addEventListener('canplay', () => {
        console.log('🎵 Audio can start playing');
      });

      audio.addEventListener('loadeddata', () => {
        console.log('🎵 Audio data loaded');
      });

      audio.addEventListener('error', (e) => {
        console.error('❌ Audio error event:', e);
        // Get detailed error information with proper null checks
        const target = e.target as HTMLAudioElement;
        if (target && target.error) {
          const errorCode = target.error.code;
          const errorMessage = target.error.message || 'Unknown audio error';
          console.error('❌ Audio error details:', {
            code: errorCode,
            message: errorMessage,
            src: target.src
          });
          // Map error codes to user-friendly messages
          let userMessage = 'Failed to load audio';
          switch (errorCode) {
            case MediaError.MEDIA_ERR_ABORTED:
              userMessage = 'Audio loading was aborted';
              break;
            case MediaError.MEDIA_ERR_NETWORK:
              userMessage = 'Network error while loading audio';
              break;
            case MediaError.MEDIA_ERR_DECODE:
              userMessage = 'Audio file is corrupted or format not supported';
              break;
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              // Suppress this error on the frontend, only log it
              userMessage = null;
              break;
          }
          // Only show toast if userMessage is not null and not the suppressed error
          if (userMessage) {
            toast.error(userMessage);
          }
        } else {
          console.error('❌ Audio error without detailed information:', e);
          toast.error('Failed to load audio. Please try generating again.');
        }
        setIsPlaying(false);
      });

      audio.addEventListener('ended', () => {
        console.log('🎵 Audio playback ended');
        setIsPlaying(false);
      });

      audio.addEventListener('pause', () => {
        console.log('🎵 Audio paused');
        setIsPlaying(false);
      });

      audio.addEventListener('play', () => {
        console.log('🎵 Audio started playing');
        setIsPlaying(true);
      });

      // Set the audio source and explicitly load it
      audio.src = url;
      audio.preload = 'auto';
      
      // For blob URLs, set the MIME type explicitly
      if (url.startsWith('blob:')) {
        audio.type = 'audio/mpeg';
      }
      
      audio.load(); // Explicitly load the audio source
      
      // Store reference
      setCurrentAudio(audio);
      audioRef.current = audio;

      // Wait for the audio to be ready before attempting to play
      const playPromise = new Promise<void>((resolve, reject) => {
        const attemptPlay = () => {
          const playResult = audio.play();
          
          if (playResult !== undefined) {
            playResult
              .then(() => {
                console.log('✅ Audio playback started successfully');
                setIsPlaying(true);
                if (title) {
                  toast.success(`🎵 Playing: ${title}`);
                }
                resolve();
              })
              .catch((error) => {
                console.error('❌ Audio play failed:', error);
                
                // Check if it's an autoplay policy error
                if (error.name === 'NotAllowedError') {
                  toast.error('Autoplay blocked by browser. Please click play again.');
                } else {
                  toast.error('Failed to play audio. Please check your browser settings.');
                }
                
                setIsPlaying(false);
                reject(error);
              });
          } else {
            resolve();
          }
        };

        // If audio is ready, play immediately
        if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
          attemptPlay();
        } else {
          // Wait for audio to be ready
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay);
            attemptPlay();
          };
          audio.addEventListener('canplay', onCanPlay);
          
          // Timeout fallback
          setTimeout(() => {
            audio.removeEventListener('canplay', onCanPlay);
            attemptPlay();
          }, 3000);
        }
      });

      await playPromise;
    } catch (error) {
      console.error('❌ Play audio error:', error);
      toast.error('Unable to play audio');
      setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const downloadAudio = (url: string, title: string) => {
    if (!url) {
      toast.error('No audio to download');
      return;
    }
    
    try {
      // For blob URLs, we need to create a temporary download link
      if (url.startsWith('blob:')) {
        fetch(url)
          .then(response => response.blob())
          .then(blob => {
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_voiceover.mp3`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            toast.success('📥 Download started!');
          })
          .catch(err => {
            console.error('Download error:', err);
            toast.error('Failed to download audio');
          });
      } else {
        // For regular URLs
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_voiceover.mp3`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('📥 Download started!');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download audio');
    }
  };

  const saveCurrentVoiceover = async () => {
    if (!audioUrl || !currentTitle || !profile) {
      toast.error('No voiceover to save');
      return;
    }

    try {
      // For blob URLs, we need to convert to a File and upload to storage
      if (audioUrl.startsWith('blob:')) {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        
        // Create a file from the blob
        const fileName = `voiceovers/${profile.id}/${Date.now()}.mp3`;
        
        // Upload to Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio')
          .upload(fileName, blob, {
            contentType: 'audio/mpeg',
            cacheControl: '3600'
          });
          
        if (uploadError) {
          throw uploadError;
        }
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('audio')
          .getPublicUrl(fileName);
          
        if (!publicUrlData.publicUrl) {
          throw new Error('Failed to get public URL for uploaded audio');
        }
        
        // Save to database with the storage URL
        const { error } = await supabase
          .from('voiceovers')
          .insert({
            user_id: profile.id,
            title: currentTitle,
            script: watch('script'),
            voice_id: watch('voiceId'),
            audio_url: publicUrlData.publicUrl,
            status: 'completed',
          });

        if (error) throw error;
      } else {
        // Regular URL, just save to database
        const { error } = await supabase
          .from('voiceovers')
          .insert({
            user_id: profile.id,
            title: currentTitle,
            script: watch('script'),
            voice_id: watch('voiceId'),
            audio_url: audioUrl,
            status: 'completed',
          });

        if (error) throw error;
      }
      
      toast.success('💾 Voiceover saved successfully!');
      loadSavedVoiceovers();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save voiceover');
    }
  };

  // Check if current voiceover can be saved
  const canSaveCurrentVoiceover = () => {
    return audioUrl && currentTitle && profile;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-r from-secondary-500 to-cyan-500 rounded-lg">
            <Mic className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Voiceover Studio</h1>
            <p className="text-gray-600">Transform text into professional voiceovers with ElevenLabs</p>
          </div>
        </div>

        {/* API Status Indicator */}
        <div className="mb-6 p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {apiStatus === 'checking' ? (
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              ) : apiStatus === 'connected' ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-500" />
              )}
              <div>
                <h3 className="font-medium text-gray-900">
                  ElevenLabs API Status
                </h3>
                <p className="text-sm text-gray-600">
                  {apiStatus === 'checking' ? 'Checking connection...' :
                   apiStatus === 'connected' ? 'Connected and ready' :
                   'Not connected - Check API configuration'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {apiStatus === 'connected' && (
                <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <CheckCircle className="h-4 w-4" />
                  <span>API Connected</span>
                </div>
              )}
              
              <button
                onClick={checkApiStatus}
                disabled={checkingConnection}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh API status"
              >
                <RefreshCw className={`h-4 w-4 ${checkingConnection ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* API Status Warning */}
        {!isElevenLabsConfigured && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-medium text-yellow-800">Voice Generation Configuration Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  The ElevenLabs API key has been updated but the connection test failed. 
                  Please verify the API key is valid and has sufficient credits.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voiceover Title *
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter a title for your voiceover..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Script *
            </label>
            <textarea
              {...register('script', { 
                required: 'Script is required',
                minLength: { value: 10, message: 'Script must be at least 10 characters' },
                maxLength: { value: 5000, message: 'Script must be less than 5000 characters' }
              })}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter the text you want to convert to speech..."
            />
            <div className="flex justify-between mt-1">
              {errors.script && (
                <p className="text-sm text-red-600">{errors.script.message}</p>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                Character count: {watch('script')?.length || 0} / 5000
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Selection
            </label>
            {voices.length === 0 ? (
              <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Loading voices...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {voices.map((voice, index) => {
                    const isLocked = !isPro && index >= freeVoiceCount;
                    return (
                      <div key={voice.voice_id} className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ${
                        watch('voiceId') === voice.voice_id
                          ? 'border-primary-500 bg-primary-50 scale-105 shadow-lg'
                          : isLocked
                          ? 'border-gray-200 bg-gray-100 opacity-60'
                          : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/50'
                      }`} onClick={() => !isLocked && setValue('voiceId', voice.voice_id)}>
                        {isLocked && (
                          <div className="absolute inset-0 bg-gray-800/20 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                              <Crown className="h-3 w-3" />
                              <span>PRO</span>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                            <img src={voice.labels.avatar || `https://i.pravatar.cc/48?u=${voice.voice_id}`} alt={voice.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{voice.name}</p>
                            <p className="text-xs text-gray-500 capitalize">
                              {voice.labels.gender} · {voice.labels.age} · {voice.labels.accent}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {errors.voiceId && (
              <p className="mt-1 text-sm text-red-600">{errors.voiceId.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || voices.length === 0}
            className="w-full bg-gradient-to-r from-secondary-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-medium hover:from-secondary-600 hover:to-cyan-600 focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Voiceover...</span>
              </div>
            ) : (
              'Generate Voiceover'
            )}
          </button>
        </form>
      </div>

      {/* Current Generated Audio Player */}
      {audioUrl && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {currentTitle || 'Generated Voiceover'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => downloadAudio(audioUrl, currentTitle || 'voiceover')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download audio"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={saveCurrentVoiceover}
                disabled={!canSaveCurrentVoiceover()}
                className={`p-2 rounded-lg transition-colors ${
                  canSaveCurrentVoiceover()
                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                title={
                  canSaveCurrentVoiceover()
                    ? 'Save to library'
                    : 'Cannot save demo voiceovers. Configure ElevenLabs API to save permanently.'
                }
              >
                <Save className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-secondary-50 to-cyan-50 rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={isPlaying ? pauseAudio : () => playAudio(audioUrl, currentTitle)}
                className="p-3 bg-gradient-to-r from-secondary-500 to-cyan-500 text-white rounded-full hover:from-secondary-600 hover:to-cyan-600 transition-all shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6" />
                )}
              </button>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Waveform className="h-5 w-5 text-secondary-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {currentTitle || 'Generated Voiceover'}
                  </span>
                  {isPlaying && (
                    <span className="text-xs text-green-600 font-medium">Playing...</span>
                  )}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`bg-gradient-to-r from-secondary-500 to-cyan-500 h-2 rounded-full transition-all duration-300 ${
                    isPlaying ? 'w-1/3' : 'w-0'
                  }`}></div>
                </div>
              </div>
            </div>
            
            {/* Hidden audio element for better browser compatibility */}
            <audio 
              ref={audioRef}
              className="hidden"
              preload="auto"
            />
          </div>
        </div>
      )}

      {/* Saved Voiceovers Library */}
      {savedVoiceovers.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Voiceover Library</h3>
          <div className="space-y-3">
            {savedVoiceovers.map((voiceover) => (
              <div key={voiceover.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{voiceover.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{voiceover.script}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(voiceover.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => playAudio(voiceover.audioUrl, voiceover.title)}
                    className="p-2 text-secondary-600 hover:text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
                    title="Play voiceover"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => downloadAudio(voiceover.audioUrl, voiceover.title)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Download voiceover"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pro Features Upsell */}
      {!profile?.is_pro && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-2 mb-3">
            <Mic className="h-5 w-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">Pro Features</h3>
          </div>
          <ul className="space-y-2 text-sm text-purple-700 mb-4">
            <li>• Unlimited voiceover generations</li>
            <li>• Premium voice library (100+ voices)</li>
            <li>• Custom voice training</li>
            <li>• High-quality audio downloads</li>
            <li>• Batch processing</li>
            <li>• Commercial usage rights</li>
          </ul>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Upgrade to Pro
          </button>
        </div>
      )}
    </div>
  );
}

export default VoiceoverStudio;