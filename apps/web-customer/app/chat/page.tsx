'use client';

import { useState, useRef, useEffect } from 'react';
import { usePoobelStore, useCurrentCustomer } from '@poobel/shared-data';
import { Send, Sparkles, Bot, User } from 'lucide-react';

// AI response simulator
const generateAIResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('next pickup') || lowerMessage.includes('schedule')) {
    return "Your next pickup is scheduled for December 18th, 2024. Your assigned driver is Marcus Johnson, and you can expect the pickup around 8:00 AM based on the route schedule. Would you like to make any changes to your schedule?";
  }
  
  if (lowerMessage.includes('reschedule') || lowerMessage.includes('change')) {
    return "I can help you reschedule your pickup. Our available time slots are:\n\n• Morning (6 AM - 10 AM)\n• Midday (10 AM - 2 PM)\n• Afternoon (2 PM - 6 PM)\n\nWhich would you prefer?";
  }
  
  if (lowerMessage.includes('driver') || lowerMessage.includes('late')) {
    return "I can check on your driver's status. Currently, Marcus Johnson is en route and should arrive within the next 15 minutes. You'll receive a notification when he's approaching your location.";
  }
  
  if (lowerMessage.includes('hold') || lowerMessage.includes('pause') || lowerMessage.includes('vacation')) {
    return "I can help you place a hold on your service. How long would you like to pause pickups? You can choose:\n\n• 1 week\n• 2 weeks\n• Custom dates\n\nYour service will automatically resume after the hold period.";
  }
  
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('billing')) {
    return "Your current plan is the Standard Residential service at $25/month, which includes twice-weekly pickups. Would you like to see other plan options or review your billing history?";
  }
  
  if (lowerMessage.includes('recycling') || lowerMessage.includes('recycle')) {
    return "We accept most recyclables including:\n\n• Paper & cardboard\n• Plastic containers (#1-7)\n• Glass bottles & jars\n• Metal cans\n\nPlease ensure items are clean and dry. Would you like to add recycling service to your account?";
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
    return "You're welcome! Is there anything else I can help you with today?";
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return "Hello! I'm your Poobel AI assistant. I can help you with:\n\n• Checking your schedule\n• Rescheduling pickups\n• Placing service holds\n• Tracking your driver\n• Answering questions\n\nHow can I assist you today?";
  }
  
  return "I understand you're asking about \"" + message.slice(0, 30) + (message.length > 30 ? "..." : "") + "\". Let me help you with that. Could you please provide more details about what you'd like to know? I can assist with scheduling, driver tracking, service changes, and more.";
};

export default function ChatPage() {
  const currentCustomer = useCurrentCustomer();
  const chatThreads = usePoobelStore((state) => state.chatThreads);
  const addChatMessage = usePoobelStore((state) => state.addChatMessage);
  const createChatThread = usePoobelStore((state) => state.createChatThread);

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentThread = chatThreads.find((t) => t.customerId === currentCustomer?.id);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentThread?.messages]);

  const handleSend = () => {
    if (!message.trim() || !currentCustomer) return;

    let threadId = currentThread?.id;
    if (!threadId) {
      const newThread = createChatThread(currentCustomer.id, 'Support Chat');
      threadId = newThread.id;
    }

    addChatMessage(threadId, 'user', message.trim());
    const userMessage = message.trim();
    setMessage('');

    setIsTyping(true);
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      addChatMessage(threadId!, 'assistant', aiResponse);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    'When is my next pickup?',
    'I need to reschedule',
    'Put my service on hold',
    'What can I recycle?',
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-info)] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">AI Assistant</h1>
            <p className="text-sm text-[var(--text-muted)]">Ask me anything about your service</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Welcome message */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-info)] flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Welcome to Poobel AI
            </h2>
            <p className="text-[var(--text-secondary)]">
              I'm here to help with your waste collection service. Ask me about schedules, driver tracking, or service changes.
            </p>
          </div>

          {/* Suggestions */}
          {(!currentThread || currentThread.messages.length === 0) && (
            <div className="mt-6">
              <p className="text-sm text-[var(--text-muted)] mb-3">Try asking:</p>
              <div className="grid grid-cols-2 gap-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setMessage(suggestion)}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl p-4 text-left hover:border-[var(--accent-primary)] transition-all card-hover"
                  >
                    <p className="text-sm text-[var(--text-primary)]">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat messages */}
        <div className="max-w-2xl mx-auto space-y-4">
          {currentThread?.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 animate-fade-in ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent-primary)]'
                    : 'bg-gradient-to-br from-[var(--accent-info)] to-[var(--accent-purple)]'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent-primary)] text-white rounded-br-md'
                    : 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-bl-md'
                }`}
              >
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-info)] to-[var(--accent-purple)] flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl rounded-bl-md p-4">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[var(--text-muted)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="p-6 border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="flex-1 px-4 py-3"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`px-4 py-3 rounded-xl transition-all ${
              message.trim()
                ? 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

