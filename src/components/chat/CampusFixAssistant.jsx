import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, Loader2 } from 'lucide-react';
import { askCampusAssistant } from '../../lib/dataService';

const QUICK_PROMPTS = [
  'How do I report a maintenance issue?',
  'How can I track my complaint?',
  'Which department handles electrical issues?',
  'What does my complaint status mean?',
];

export function CampusFixAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am CampusFix Assistant for Rathinam Technical Campus. I can help you with reporting maintenance issues, tracking your complaint ID, department contacts, and understanding complaint statuses.',
    },
  ]);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  const sendMessage = async (textToSend) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', text: trimmed };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const result = await askCampusAssistant({
        message: trimmed,
        history: updatedHistory.slice(-6),
      });
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: result.reply,
          mode: result.mode,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            err.message ||
            'I could not connect to the CampusFix server right now. Please use the navigation menu to Report an Issue or Track a Complaint.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-3 flex h-[500px] max-h-[78vh] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between bg-navy-900 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold leading-tight">
                  CampusFix Assistant
                </h3>
                <p className="text-[11px] text-emerald-300">
                  Rathinam Technical Campus Helpdesk
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
              aria-label="Close CampusFix Assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-xs whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'rounded-br-sm bg-navy-900 text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                  Checking campus helpdesk info...
                </div>
              </div>
            )}

            {/* Quick Prompts when conversation just started */}
            {messages.length <= 2 && !loading && (
              <div className="pt-2">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Quick Questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => sendMessage(q)}
                      className="rounded-xl border border-navy-200 bg-white px-2.5 py-1.5 text-left text-xs font-medium text-navy-800 transition hover:border-emerald-400 hover:bg-emerald-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about reporting, tracking, departments..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 outline-none transition focus:border-navy-600 focus:bg-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 text-[10px] text-slate-400">
              Grounded strictly in CampusFix AI documentation. Use Track Complaint for live status.
            </p>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex items-center gap-2.5 rounded-full bg-navy-900 px-4 py-3 text-sm font-semibold text-white shadow-xl ring-4 ring-navy-900/10 transition hover:-translate-y-0.5 hover:bg-navy-800"
        aria-label="Open CampusFix Assistant"
      >
        <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
          {open ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          {!open && (
            <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-amber-300" />
          )}
        </span>
        <span className="pr-1">{open ? 'Close Assistant' : 'CampusFix Assistant'}</span>
      </button>
    </div>
  );
}
