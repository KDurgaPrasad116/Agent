import React, { useState, useRef, useEffect } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import {
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  FileText,
  HelpCircle,
  X,
} from 'lucide-react';

export const LegalChatDrawer: React.FC = () => {
  const {
    chatMessages,
    isChatLoading,
    sendChatMessage,
    clearChatHistory,
    setChatOpen,
  } = useLexClearStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const msg = input;
    setInput('');
    await sendChatMessage(msg);
  };

  const quickPrompts = [
    'Is the liability cap mutual or one-sided?',
    'Can the client terminate without notice?',
    'Is the non-compete clause enforceable under Section 27?',
    'What are the key financial red flags in this agreement?',
  ];

  return (
    <div className="flex flex-col h-[700px] max-h-[80vh] bg-white dark:bg-surface-900 hairline-card p-4 space-y-4">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 flex items-center justify-center text-primary-600">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-sm text-surface-900 dark:text-white">
              AI Legal Assistant
            </h4>
            <span className="text-[10px] text-surface-400 font-mono block -mt-0.5">
              Grounded in active document context (RAG)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" onClick={clearChatHistory} title="Clear history">
            <RotateCcw className="w-3.5 h-3.5 text-surface-400 hover:text-surface-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)} title="Close chat">
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => sendChatMessage(prompt)}
            className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 hover:border-primary-400 hover:text-primary-600 whitespace-nowrap shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold ${
                  isUser
                    ? 'bg-primary-600 text-white'
                    : 'bg-surface-200 dark:bg-surface-800 text-surface-700 dark:text-surface-300'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-1.5 leading-relaxed shadow-subtle ${
                  isUser
                    ? 'bg-primary-600 text-white font-medium rounded-tr-none'
                    : 'bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 text-surface-800 dark:text-surface-200 rounded-tl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.context_used && (
                  <div className="pt-2 mt-2 border-t border-surface-200/60 dark:border-surface-800/60 text-[10px] text-surface-400 font-mono">
                    <span className="font-bold text-primary-500">Source:</span> {msg.context_used}
                  </div>
                )}

                <div
                  className={`text-[9px] font-mono text-right ${
                    isUser ? 'text-primary-200' : 'text-surface-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isChatLoading && (
          <div className="flex items-center gap-2 text-surface-400 text-xs pl-2">
            <Sparkles className="w-4 h-4 animate-spin text-primary-500" />
            <span>Analyzing legal clauses and statutory corpus...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-surface-200 dark:border-surface-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this contract..."
          className="flex-1 px-3.5 py-2 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-surface-900 dark:text-white"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!input.trim() || isChatLoading}
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};
