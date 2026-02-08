import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot } from 'lucide-react';
import { askRummySage } from '../services/geminiService';
import { ChatMessage } from '../types';

export const RummySage: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Greetings! I am the Rummy Sage. Disputes? Rules? Strategy? Ask away.",
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Get AI response
    const responseText = await askRummySage(userText);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: responseText,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-icon-bg shadow-glow">
           <Sparkles size={20} style={{ color: 'white' }} />
        </div>
        <div>
          <h2 style={{ fontWeight: 'bold', fontSize: '1.125rem', lineHeight: 1.2 }}>Rummy Sage</h2>
          <p style={{ color: '#d8b4fe', fontSize: '0.75rem' }}>AI Referee & Strategist</p>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area no-scrollbar">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`message-row ${isUser ? 'user' : 'bot'}`}>
              <div className={`message-bubble ${isUser ? 'user' : 'bot'}`}>
                {!isUser && (
                    <div className="flex items-center gap-2 mb-1" style={{ opacity: 0.5 }}>
                        <Bot size={12} />
                        <span style={{ fontSize: '0.625rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Sage</span>
                    </div>
                )}
                <p>{msg.text}</p>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="message-row bot">
            <div className="message-bubble bot loader-dots">
              <div className="dot" style={{ animationDelay: '0ms' }}></div>
              <div className="dot" style={{ animationDelay: '150ms' }}></div>
              <div className="dot" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="input-area">
        <form onSubmit={handleSend} className="chat-input-wrapper">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about rules, scoring, or strategy..."
            className="chat-input"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-send"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};