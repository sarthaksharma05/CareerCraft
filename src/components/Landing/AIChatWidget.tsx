import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot
} from 'lucide-react';
import { generateContent as generateGeminiContent } from '../../lib/gemini';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AIChatWidget({ isOpen, onToggle }: AIChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hi! I\'m your AI assistant. I can help you learn about CareerCraft, generate content ideas, or answer any questions you have. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Generate AI response using Gemini
      const aiResponse = await generateAIResponse(content);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error generating AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Create a context-aware prompt for the AI
    const systemPrompt = `You are an AI assistant for CareerCraft, a comprehensive AI-powered Smart Formating  platform. 

CareerCraft offers:
- Smart Formating  (scripts, captions, hashtags, ideas)
- Professional Voiceovers with ElevenLabs
- AI Video Creation with Tavus avatars
- TrendRadar for discovering trending topics
- Campaign Marketplace for brand partnerships
- Analytics and insights

You should be helpful, friendly, and knowledgeable about Smart Formating , social media, and the creator economy. Keep responses conversational and under 150 words. If users ask about features, explain how CareerCraft can help them.`;

    try {
      // Use Gemini to generate contextual response
      const response = await generateGeminiContent(
        'answer', 
        'general', 
        'chat', 
        `System: ${systemPrompt}\n\nUser: ${userMessage}\n\nRespond as the CareerCraft AI assistant:`
      );
      
      return response || "I'd be happy to help you with that! CareerCraft has many features that can boost your Smart Formating . What specific area would you like to explore?";
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "I'd be happy to help you with CareerCraft! Our platform offers Smart Formating , voiceovers, video creation, and trend analysis. What would you like to know more about?";
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      transition={{ duration: 0.2 }}
      className="fixed bottom-20 right-5 w-[380px] h-[600px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50"
      style={{
        boxShadow: '0 10px 30px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <Bot className="w-8 h-8 text-white p-1.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
          <div>
            <h3 className="font-bold text-white">AI Assistant</h3>
            <p className="text-xs text-green-400">● Online</p>
          </div>
        </div>
        <button onClick={onToggle} className="p-2 text-white/50 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-start gap-3 ${msg.type === 'user' ? 'justify-end' : ''}`}
          >
            {msg.type === 'ai' && (
              <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div 
              className={`max-w-[75%] p-3 rounded-2xl ${
                msg.type === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-white/10 text-white/90 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <p className="text-xs text-white/50 mt-1.5 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
             <div className="w-8 h-8 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            <div className="max-w-[75%] p-3 rounded-2xl bg-white/10 text-white/90 rounded-bl-none">
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputMessage);
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full py-2 px-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-center text-xs text-white/40 mt-2">
          Powered by CareerCraft AI
        </p>
      </div>
    </motion.div>
  );
}