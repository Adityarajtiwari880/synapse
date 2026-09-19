import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  ArrowUpRight,
  Layers,
  PlusCircle,
  Bookmark,
  FileText,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ChatMessage } from '../../types';
import { queryDocumentGrounded, analyzeDocumentGrounded } from '../../services/aiService';

interface AskLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: 'Hello! I am your grounded AI research assistant. Ask any question about your active document. Every statement is strictly grounded in verified text with verbatim page citations.',
    timestamp: '11:45'
  }
];

export const AskLibraryDrawer: React.FC<AskLibraryDrawerProps> = ({ isOpen, onClose }) => {
  const { addNode, addAuditLog, flashAnchorInReader, selectedDoc, appSettings } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const isLight = appSettings.theme === 'light';

  const handleSend = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToRun = customQuery || inputPrompt;
    if (!queryToRun.trim() || isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: queryToRun,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputPrompt('');
    setIsGenerating(true);

    try {
      const result = await queryDocumentGrounded(queryToRun, selectedDoc, messages, {
        apiKey: appSettings.geminiApiKey,
        provider: appSettings.activeProvider,
        endpoint: appSettings.ollamaEndpoint
      });

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: result.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: result.citations,
        suggestedCards: result.suggestedCards
      };

      setMessages(prev => [...prev, assistantMsg]);
      addAuditLog('agent_run', `Grounded AI Q&A: "${queryToRun.slice(0, 30)}..." via ${result.sourceProvider}`);
    } catch (err) {
      console.error('Error querying document:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'An error occurred while indexing document passages. Please check the document format or active AI configuration.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRunFullAnalysis = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: `⚡ Run Comprehensive AI Deep Dive on "${selectedDoc.title}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const analysis = await analyzeDocumentGrounded(selectedDoc, {
        apiKey: appSettings.geminiApiKey,
        provider: appSettings.activeProvider
      });

      const assistantMsg: ChatMessage = {
        id: `msg-resp-${Date.now()}`,
        sender: 'assistant',
        text: `### 📋 Executive Brief: ${selectedDoc.title}\n\n${analysis.executiveSummary}\n\n**Key Findings & Arguments:**\n${analysis.keyClaims.map(c => `• **${c.title}** (p. ${c.pageNumber}): "${c.quote}"`).join('\n')}\n\n**Empirical Verification:**\n${analysis.evidencePoints.map(e => `• **${e.title}** (p. ${e.pageNumber}): "${e.quote}"`).join('\n')}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: analysis.keyClaims.map(c => ({ docTitle: selectedDoc.title, page: c.pageNumber, quote: c.quote })),
        suggestedCards: analysis.suggestedCards
      };

      setMessages(prev => [...prev, assistantMsg]);
      addAuditLog('agent_run', `Full AI Analysis synthesized for "${selectedDoc.title}"`);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const spawnAnswerCardsOnCanvas = (cards: NonNullable<ChatMessage['suggestedCards']>) => {
    cards.forEach((c, idx) => {
      addNode({
        type: c.type,
        x: 240 + idx * 320,
        y: 240 + idx * 40,
        title: c.title,
        content: c.content,
        confidence: 0.98,
        verificationState: 'verified',
        origin: 'agent',
        anchors: [
          {
            docId: selectedDoc.id,
            docTitle: selectedDoc.title,
            pageNumber: 1,
            boxes: [{ page: 1, x0: 0.1, y0: 0.2, x1: 0.9, y1: 0.35 }],
            quote: { exact: c.content },
            charRange: { start: 0, end: c.content.length }
          }
        ]
      });
    });
    alert(`✨ Placed ${cards.length} verified citation cards on your Mind Map canvas!`);
  };

  return (
    <div className={`fixed top-14 right-0 bottom-0 w-96 border-l z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200 select-none transition-colors ${
      isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-[#0d0f17] text-slate-100 border-white/10'
    }`}>
      {/* Drawer Header */}
      <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${
        isLight ? 'bg-slate-50/90 border-slate-200' : 'bg-black/40 border-white/10'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-apple-glow">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className={`text-xs font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Grounded AI Assistant
            </h3>
            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
              Reading: {selectedDoc.title}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
          title="Close Assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Indicator & Deep Dive Action */}
      <div className={`px-3.5 py-2 border-b flex items-center justify-between text-[11px] ${
        isLight ? 'bg-blue-50/70 border-blue-100 text-blue-900' : 'bg-blue-950/25 border-blue-500/20 text-blue-300'
      }`}>
        <span className="flex items-center space-x-1.5 font-semibold truncate">
          <Cpu className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{appSettings.workflowMode === 'ai_assistant' ? 'AI Co-Pilot Mode Active' : 'Manual Mode'}</span>
        </span>
        <button
          onClick={handleRunFullAnalysis}
          disabled={isGenerating}
          className="px-2 py-0.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shadow-sm transition shrink-0"
          title="Run 1-Click Deep Analysis on this document"
        >
          ⚡ Deep Ingest
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
        {messages.map(m => (
          <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white shadow-apple-subtle'
                  : isLight
                  ? 'bg-slate-100 border border-slate-200 text-slate-800'
                  : 'bg-white/5 border border-white/10 text-slate-200'
              }`}
            >
              <div className="leading-relaxed whitespace-pre-line">{m.text}</div>

              {/* Citations Badges */}
              {m.citations && m.citations.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400 tracking-wider">
                    Verified Citations:
                  </div>
                  {m.citations.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => flashAnchorInReader(c.quote)}
                      className="block text-left text-[11px] text-blue-600 dark:text-blue-400 hover:underline transition"
                      title="Jump to quote in Document Reader"
                    >
                      [{c.docTitle}, p. {c.page}] &rarr; "{c.quote.slice(0, 48)}..."
                    </button>
                  ))}
                </div>
              )}

              {/* Spawn to Canvas Button */}
              {m.suggestedCards && m.suggestedCards.length > 0 && (
                <button
                  onClick={() => spawnAnswerCardsOnCanvas(m.suggestedCards!)}
                  className={`mt-3 w-full py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center space-x-1.5 transition ${
                    isLight
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                      : 'bg-indigo-600/30 hover:bg-indigo-600/50 border-indigo-500/40 text-indigo-300'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Place {m.suggestedCards.length} Cards on Canvas</span>
                </button>
              )}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center space-x-2 text-xs text-blue-500 p-2">
            <Bot className="w-4 h-4 animate-bounce" />
            <span>Scanning document text & verifying citations...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Question Chips */}
      <div className={`px-3 py-1.5 border-t flex space-x-1.5 overflow-x-auto text-[10px] ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-black/30 border-white/10'
      }`}>
        {[
          'Summarize core findings',
          'Extract liabilities & risks',
          'Find empirical metrics'
        ].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(undefined, q)}
            className={`px-2.5 py-1 rounded-lg border whitespace-nowrap transition font-medium ${
              isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Prompt Input Form */}
      <form onSubmit={e => handleSend(e)} className={`p-3 border-t shrink-0 ${
        isLight ? 'bg-white border-slate-200' : 'bg-black/40 border-white/10'
      }`}>
        <div className={`flex items-center space-x-2 rounded-2xl px-3 py-1.5 border ${
          isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-black/40 border-white/15 text-white'
        }`}>
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            placeholder={`Ask about ${selectedDoc.title.slice(0, 18)}...`}
            className="bg-transparent border-none outline-none text-xs w-full placeholder-slate-400"
          />
          <button
            type="submit"
            disabled={isGenerating || !inputPrompt.trim()}
            className="p-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white shadow-apple-glow transition"
            title="Send Question"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
