import React, { useState, useRef, useEffect } from 'react';
import { IBrand } from '../types';
import { aiApi } from '../services/api';
import {
  Sparkles,
  X,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bot,
  User,
  Building,
} from 'lucide-react';

interface AIAssistantModalProps {
  brand: IBrand;
  onClose: () => void;
  onRequestMeeting: (brand: IBrand) => void;
}

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  sources?: string[];
  suggestMeeting?: boolean;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  brand,
  onClose,
  onRequestMeeting,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: `Namaste! Main **${brand.brandName}** ka verified AI Franchise Assistant hoon. Aap mujhse total investment, unit economics, Chandigarh/Punjab availability ya brand support ke baare mein approved facts pooch sakte hain.`,
      suggestMeeting: false,
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Is franchise ka total investment kitna hai?',
    'Chandigarh mein territory available hai?',
    'Expected payback & ROI kitna hai?',
    'FOFO model mein brand support kya milti hai?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText: string) => {
    const text = queryText.trim();
    if (!text || loading) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await aiApi.askBrandAI(brand._id, text);
      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.data.answer,
            sources: res.data.data.sources,
            suggestMeeting: res.data.data.suggestMeeting,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Maaf kijiye, temporary error aaya hai. Lekin brand provided data ke according aap direct meeting book karke baat kar sakte hain.',
          suggestMeeting: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-950/50 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950/50 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={brand.logoUrl}
                alt={brand.brandName}
                className="w-10 h-10 rounded-xl object-cover border border-blue-500/40 shadow-sm"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{brand.brandName} AI Bot</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                  Strict Grounded RAG
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {brand.investmentRange.displayString} • {brand.businessModel} • {brand.requiredAreaSqFt.displayString}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Safety Banner */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-xs text-amber-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>AI Guardrail Active:</strong> All answers are strictly grounded on brand-approved dossiers. No guaranteed returns.
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Sources & Action */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Source: {msg.sources.join(', ')}</span>
                  </div>
                )}

                {msg.suggestMeeting && (
                  <div className="mt-3 pt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onRequestMeeting(brand);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Request Live Discovery Call with {brand.brandName}</span>
                    </button>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-200" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
              <div className="bg-slate-800/80 rounded-2xl px-4 py-2.5 text-xs text-slate-400 border border-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                <span>Grounding answer with {brand.brandName} verified knowledge base...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggested Prompts */}
        <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Suggestions:</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 whitespace-nowrap transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputQuery);
          }}
          className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask anything about ${brand.brandName} franchise...`}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white transition-all shadow-md shadow-blue-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
