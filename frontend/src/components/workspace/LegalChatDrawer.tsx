import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLexClearStore } from '../../store/useLexClearStore';
import { Button } from '../ui/Button';
import { Send, RotateCcw, User, MessageCircle } from 'lucide-react';

export const LegalChatDrawer: React.FC = () => {
  const {
    chatMessages,
    isChatLoading,
    sendChatMessage,
    clearChatHistory,
    analyzeData,
  } = useLexClearStore();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const quickPrompts = useMemo(() => {
    const risky = analyzeData?.clauses.filter((c) => c.risk_level === 'DANGER' || c.risk_level === 'WARNING') || [];
    if (risky.length) {
      return risky.slice(0, 3).map((c) => `What does “${c.title}” actually mean for me?`);
    }
    return [
      'Who can end this contract, and how?',
      'Is the liability cap the same for both sides?',
      'What should I push back on first?',
    ];
  }, [analyzeData]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    const msg = input;
    setInput('');
    await sendChatMessage(msg);
  };

  return (
    <div className="flex flex-col h-[640px] max-h-[75vh] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-surface-200 dark:border-surface-800">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary-500" />
          <div>
            <h4 className="font-heading font-semibold text-sm">Ask about this file</h4>
            <span className="text-[10px] text-surface-400">Answers quote the clauses you opened</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChatHistory} title="Clear">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendChatMessage(prompt)}
            className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div key={msg.id} className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-primary-600 text-white' : 'bg-surface-200 dark:bg-surface-800'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <MessageCircle className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                  isUser
                    ? 'bg-primary-600 text-white rounded-tr-none'
                    : 'bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                {msg.context_used && (
                  <div className="pt-2 mt-2 border-t border-surface-200/60 text-[10px] opacity-80">
                    From the file: {msg.context_used}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isChatLoading && <p className="text-surface-400 text-xs pl-2">Looking at the clauses…</p>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-surface-200 dark:border-surface-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a clause…"
          className="flex-1 px-3.5 py-2 text-xs bg-surface-50 dark:bg-surface-950 border border-surface-200 dark:border-surface-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button type="submit" variant="primary" size="sm" disabled={!input.trim() || isChatLoading}>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};
