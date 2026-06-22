import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { chatAPI } from '../services/api';

const AIMentor = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch history and suggestions on load
  useEffect(() => {
    const initChat = async () => {
      try {
        const [historyRes, suggRes] = await Promise.all([
          chatAPI.getHistory(),
          chatAPI.getSuggestions()
        ]);
        
        if (historyRes.data.history.length > 0) {
          const formatted = historyRes.data.history.flatMap(msg => [
            { role: 'user', content: msg.user_message },
            { role: 'bot', content: msg.bot_response }
          ]);
          setMessages(formatted);
        } else {
          // Welcome message
          setMessages([{
            role: 'bot',
            content: "Hello! 👋 I'm your CareerPulse AI Mentor. Ask me anything about your career roadmap, interview prep, skills to learn, or salary expectations."
          }]);
        }
        
        setSuggestions(suggRes.data.suggestions.slice(0, 4));
      } catch (err) {
        console.error('Failed to init chat', err);
        setMessages([{ role: 'bot', content: "Hi! I'm here to help. What's on your mind regarding your career?" }]);
      }
    };
    initChat();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    
    const userMsg = text.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await chatAPI.sendMessage(userMsg);
      setMessages(prev => [...prev, { role: 'bot', content: res.data.response }]);
      if (res.data.suggestions && res.data.suggestions.length > 0) {
        setSuggestions(res.data.suggestions);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!window.confirm('Clear all chat history?')) return;
    try {
      await chatAPI.clearHistory();
      setMessages([{ role: 'bot', content: "Chat cleared. How can I help you today?" }]);
    } catch (err) {
      console.error('Failed to clear chat', err);
    }
  };

  const formatMessage = (text) => {
    // Basic markdown formatting (bold)
    const formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col glass-card border border-[var(--glass-border)] rounded-2xl overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      
      {/* Header */}
      <div className="p-4 border-b border-[var(--glass-border)] bg-[rgba(255,255,255,0.03)] flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center p-[2px]">
            <div className="bg-[#050714] w-full h-full rounded-full flex items-center justify-center">
              <Bot size={20} className="text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="font-display font-semibold text-white tracking-wide">AI Mentor</h2>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors rounded-lg hover:bg-[rgba(255,255,255,0.05)]"
          title="Clear History"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-[var(--glass-border)] scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                msg.role === 'user' 
                  ? 'bg-[var(--accent-primary)]' 
                  : 'bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.3)]'
              }`}>
                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-cyan-400" />}
              </div>
              
              {/* Message Bubble */}
              <div className={`p-3.5 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-[var(--accent-primary)] to-indigo-600 text-white rounded-tr-sm'
                  : 'bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] text-gray-200 rounded-tl-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatMessage(msg.content)}</p>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.3)] flex items-center justify-center">
                <Bot size={16} className="text-cyan-400" />
              </div>
              <div className="p-4 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] rounded-tl-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[rgba(0,0,0,0.2)] border-t border-[var(--glass-border)]">
        {/* Suggestions */}
        {!loading && suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((sugg, i) => (
              <button
                key={i}
                onClick={() => handleSend(sugg)}
                className="text-xs px-3 py-1.5 rounded-full border border-[rgba(6,182,212,0.3)] bg-[rgba(6,182,212,0.05)] text-cyan-300 hover:bg-[rgba(6,182,212,0.15)] transition-colors flex items-center gap-1.5"
              >
                <Sparkles size={12} />
                {sugg}
              </button>
            ))}
          </div>
        )}
        
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your career, skills, or interviews..."
            className="w-full bg-[rgba(255,255,255,0.05)] border border-[var(--glass-border)] rounded-full py-3.5 pl-5 pr-14 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-cyan-500 transition-colors"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[1px]" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIMentor;
