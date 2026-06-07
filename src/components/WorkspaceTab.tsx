/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Send,
  Loader2,
  FileUp,
  Mic,
  ArrowRight,
  Sparkles,
  Paperclip,
  CheckCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Tag,
  BookOpen,
  CornerDownRight,
  Database,
  Globe
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Message, Conversation, Source, AgentState } from '../types';

interface WorkspaceTabProps {
  activeConversation?: Conversation;
  onSendMessage: (text: string, files?: File[]) => void;
  isSending: boolean;
  onSelectSuggestedPrompt: (text: string) => void;
  memoryTags: string[];
  onAddMemoryTag: (tag: string) => void;
  onRemoveMemoryTag: (tag: string) => void;
  webSearchEnabled: boolean;
  setWebSearchEnabled: (val: boolean) => void;
}

function parseBoldStyles(text: string): React.ReactNode[] {
  const boldRegex = /\*\*([^*]+)\*\*/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const textBefore = text.substring(lastIndex, matchIndex);
    const boldContent = match[1];

    if (textBefore) {
      parts.push(<span key={`text-${lastIndex}`}>{textBefore}</span>);
    }

    parts.push(
      <strong key={`bold-${matchIndex}`} className="font-semibold text-[#0f111a] dark:text-white">
        {boldContent}
      </strong>
    );

    lastIndex = boldRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
  }

  return parts;
}

function parseInlineStyles(text: string): React.ReactNode {
  if (!text) return "";

  const inlineCodeRegex = /`([^`]+)`/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = inlineCodeRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const textBefore = text.substring(lastIndex, matchIndex);
    const codeContent = match[1];

    if (textBefore) {
      parts.push(...parseBoldStyles(textBefore));
    }

    parts.push(
      <code key={`inline-code-${matchIndex}`} className="font-mono px-1.5 py-0.5 rounded-md text-[11px] bg-[#f0f2f8] text-[#4f46e5] border border-[#dbe0f0] dark:bg-[#1a1c25]/85 dark:text-[#8ab4f8] dark:border-white/[0.04]">
        {codeContent}
      </code>
    );

    lastIndex = inlineCodeRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(...parseBoldStyles(text.substring(lastIndex)));
  }

  return <>{parts}</>;
}

function parseNonCodeMarkdown(text: string, baseKey: number): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  
  let currentParagraph: string[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTableLines: string[] = [];

  const flushParagraph = (key: string) => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={`p-${key}`} className="text-[13.5px] leading-relaxed text-[#1e2029] dark:text-[#e2e8f0] whitespace-pre-wrap mb-3 last:mb-0">
          {parseInlineStyles(currentParagraph.join('\n'))}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = (key: string) => {
    if (currentList) {
      if (currentList.type === 'ul') {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 text-[13px] text-[#2d2f39] dark:text-[#cbd5e1] space-y-1.5 my-3">
            {currentList.items.map((item, idx) => (
              <li key={idx}>{parseInlineStyles(item)}</li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 text-[13px] text-[#2d2f39] dark:text-[#cbd5e1] space-y-1.5 my-3">
            {currentList.items.map((item, idx) => (
              <li key={idx}>{parseInlineStyles(item)}</li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  const flushTable = (key: string) => {
    if (currentTableLines.length > 0) {
      const rows = currentTableLines.map(line => 
        line.split('|').map(cell => cell.trim()).filter((_, i) => i > 0 && i < line.split('|').length - 1)
      );

      const headCells = rows[0];
      // Skip the separator row if it exists
      const hasSeparator = rows[1] && rows[1].every(cell => /^:?-+:?$/.test(cell));
      const dataRows = hasSeparator ? rows.slice(2) : rows.slice(1);

      elements.push(
        <div key={`table-${key}`} className="overflow-x-auto my-4 border border-slate-200/50 dark:border-[#242631] rounded-2xl bg-white/40 dark:bg-[#1f2029]/10 shadow-xs">
          <table className="w-full text-xs text-left border-collapse bg-white/30 dark:bg-[#15161d]/50">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-[#181920]/80 border-b border-slate-200/50 dark:border-[#242631]">
                {headCells?.map((cell, cIdx) => (
                  <th key={cIdx} className="p-3.5 font-sans font-semibold text-[#2d2f3b] dark:text-slate-350 text-[11px] uppercase tracking-wider">
                    {parseInlineStyles(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#242631]">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-[#1f2029]/30 transition-colors">
                  {row.map((cell, cIdx) => {
                    const isAspect = cIdx === 0;
                    return (
                      <td key={cIdx} className={`p-3 text-[12px] leading-relaxed ${isAspect ? 'font-sans font-semibold text-[#181920] dark:text-slate-200' : 'text-[#3f4150] dark:text-[#a9b1d6]'}`}>
                        {parseInlineStyles(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTableLines = [];
    }
  };

  const flushAll = (key: string) => {
    flushParagraph(key);
    flushList(key);
    flushTable(key);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineKey = `${baseKey}-${i}`;

    // A. Blank line
    if (trimmed === "") {
      flushAll(lineKey);
      continue;
    }

    // B. Horizontal rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      flushAll(lineKey);
      elements.push(<hr key={`hr-${lineKey}`} className="my-5 border-slate-250/20 dark:border-white/[0.04]" />);
      continue;
    }

    // C. Mathematical display blocks
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$')) {
      flushAll(lineKey);
      const mathContent = trimmed.substring(2, trimmed.length - 2).trim();
      elements.push(
        <div key={`math-${lineKey}`} className="my-4 text-center font-serif text-[12.5px] italic bg-[#f8f9fc] dark:bg-white/[0.01] border border-slate-200/50 dark:border-white/[0.04] p-4.5 rounded-2xl text-[#1a1c25] dark:text-slate-200 tracking-wide select-all shadow-inner">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-2">Mathematical Grounding Formula</span>
          {mathContent}
        </div>
      );
      continue;
    }

    // D. Headers
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        flushAll(lineKey);
        const level = match[1].length;
        const headingText = match[2];
        
        if (level === 1) {
          elements.push(<h1 key={`h1-${lineKey}`} className="text-[17px] font-sans font-bold text-[#0f111a] dark:text-white pt-4 pb-2 border-b dark:border-white/[0.04] mb-3">{parseInlineStyles(headingText)}</h1>);
        } else if (level === 2) {
          elements.push(<h2 key={`h2-${lineKey}`} className="text-[15px] font-sans font-semibold text-[#181a24] dark:text-[#f1f5f9] pt-3.5 pb-1.5 mb-2.5">{parseInlineStyles(headingText)}</h2>);
        } else if (level === 3) {
          elements.push(<h3 key={`h3-${lineKey}`} className="text-[13px] font-sans font-bold text-[#242631] dark:text-[#e2e8f0] pt-3 pb-1 mb-2">{parseInlineStyles(headingText)}</h3>);
        } else {
          elements.push(<h4 key={`h4-${lineKey}`} className="text-[11.5px] font-sans font-bold text-[#474a57] dark:text-[#94a3b8] pt-2 pb-0.5 mb-2 uppercase tracking-wider">{parseInlineStyles(headingText)}</h4>);
        }
        continue;
      }
    }

    // E. Table rows
    if (trimmed.startsWith('|')) {
      flushParagraph(lineKey);
      flushList(lineKey);
      currentTableLines.push(line);
      continue;
    }

    // F. Bullet lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      flushParagraph(lineKey);
      flushTable(lineKey);
      const bulletContent = trimmed.replace(/^[-•*]\s*/, "");
      if (!currentList || currentList.type !== 'ul') {
        flushList(lineKey);
        currentList = { type: 'ul', items: [bulletContent] };
      } else {
        currentList.items.push(bulletContent);
      }
      continue;
    }

    // G. Numbered lists
    const numListMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numListMatch) {
      flushParagraph(lineKey);
      flushTable(lineKey);
      const listContent = numListMatch[2];
      if (!currentList || currentList.type !== 'ol') {
        flushList(lineKey);
        currentList = { type: 'ol', items: [listContent] };
      } else {
        currentList.items.push(listContent);
      }
      continue;
    }

    // H. Normal paragraph line
    flushList(lineKey);
    flushTable(lineKey);
    currentParagraph.push(line);
  }

  // Flush remaining elements
  flushAll(`${baseKey}-final`);

  return elements;
}

export function renderFormattedMessage(text: string) {
  if (!text) return null;

  // Pattern to match fenced code blocks
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const textBefore = text.substring(lastIndex, matchIndex);
    const language = match[1] || 'code';
    const codeContent = match[2];

    // Parse the text before the code block
    if (textBefore.trim()) {
      elements.push(...parseNonCodeMarkdown(textBefore, lastIndex));
    }

    // Render the code block
    elements.push(
      <div key={`code-${matchIndex}`} className="my-4 overflow-hidden rounded-2xl border border-slate-200/50 dark:border-white/[0.08] shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-[#161720] border-b border-slate-200/50 dark:border-white/[0.08] text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider select-none">
          <span>{language}</span>
          <button
            type="button"
            onClick={(e) => {
              navigator.clipboard.writeText(codeContent);
              const btn = e.currentTarget;
              btn.textContent = "Copied!";
              setTimeout(() => btn.textContent = "Copy", 2000);
            }}
            className="px-2 py-0.5 hover:bg-slate-200 dark:hover:bg-white/[0.06] rounded text-[9px] cursor-pointer normal-case text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
          >
            Copy
          </button>
        </div>
        <pre className="p-4.5 overflow-x-auto text-[11.5px] font-mono leading-relaxed bg-slate-950 text-slate-100 dark:bg-black/55 select-text text-left border-0 m-0 custom-scrollbar whitespace-pre">
          <code>{codeContent}</code>
        </pre>
      </div>
    );

    lastIndex = codeBlockRegex.lastIndex;
  }

  // Parse the remaining text
  if (lastIndex < text.length) {
    const textAfter = text.substring(lastIndex);
    if (textAfter.trim()) {
      elements.push(...parseNonCodeMarkdown(textAfter, lastIndex));
    }
  }

  return <>{elements}</>;
}

export default function WorkspaceTab({
  activeConversation,
  onSendMessage,
  isSending,
  onSelectSuggestedPrompt,
  memoryTags,
  onAddMemoryTag,
  onRemoveMemoryTag,
  webSearchEnabled,
  setWebSearchEnabled
}: WorkspaceTabProps) {
  const [inputText, setInputText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [showCitationPopup, setShowCitationPopup] = useState<Source | null>(null);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [newTagVal, setNewTagVal] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedPrompts = [
    "Write a python DenseVectorIndex similarity search script.",
    "Detail typical memory configurations for production RAG.",
    "Compare Ada similarity indexing against Gemini embeddings dimension limits."
  ];

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputText.trim() || stagedFiles.length > 0) {
      onSendMessage(inputText, stagedFiles);
      setInputText('');
      setStagedFiles([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag n Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files) as File[];
      setStagedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files) as File[];
      setStagedFiles(prev => [...prev, ...filesArr]);
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagVal.trim()) {
      onAddMemoryTag(newTagVal.trim());
      setNewTagVal('');
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-transparent select-none relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Absolute Drag and Drop Overlay dialog */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#07080c]/90 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-indigo-500 rounded-2xl z-50 p-6 text-center text-white"
          >
            <FileUp className="w-16 h-16 text-indigo-400 animate-bounce mb-4" />
            <h3 className="font-display font-medium text-lg tracking-wider">
              Ingest Document Metadata
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-2 max-w-sm">
              Release to instantly split PDF/txt structures into dense embeddings vectors.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Conversation Stack Frame */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin">
        {(!activeConversation || activeConversation.messages.length === 0) ? (
          
          /* Empty Active Conversation Welcome Area */
          <div className="max-w-2xl mx-auto h-full flex flex-col justify-center items-center text-center space-y-7 py-16 animate-cinematic-in">
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-[#181a24]/50 flex items-center justify-center border border-slate-200 dark:border-white/[0.04] shadow-sm">
              <Sparkles className="w-5 h-5 text-[#2563eb] dark:text-indigo-400 animate-pulse" />
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-display font-bold tracking-tight text-slate-800 dark:text-white leading-none">
                Hello, AI Researcher
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto leading-relaxed">
                Ask anything. Retrieve knowledge. Generate answers with citations.
              </p>
            </div>

            {/* Quick Suggested Prompts cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {suggestedPrompts.map((prom, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestedPrompt(prom)}
                  className="p-4.5 bg-white text-left text-[12.5px] leading-relaxed font-sans font-medium rounded-2xl border transition-all duration-300 group flex flex-col justify-between h-30
                    border-slate-200/80 text-slate-800 hover:border-blue-400 hover:shadow-md hover:shadow-blue-500/5 active:scale-98
                    dark:bg-[#13151f]/40 dark:border-white/[0.04] dark:text-slate-350 hover:dark:border-white/[0.09] hover:dark:bg-[#141622]/60 hover:dark:shadow-black/20"
                >
                  <span className="line-clamp-3 overflow-hidden text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-100 transition-colors">
                    {prom}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-sans font-bold text-[#2563eb] dark:text-indigo-400 transition-all pt-2 select-none">
                    Synthesize thread
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              ))}
            </div>

            {/* Default active memory indicator block */}
            <div className="w-full max-w-lg p-4 rounded-2xl border border-slate-200/60 bg-[#f8f9fc] dark:bg-white/[0.01] dark:border-white/[0.04] text-left select-none space-y-3">
              <span className="text-[10px] font-display font-bold text-[#474a57] dark:text-slate-500 uppercase tracking-widest block">
                Session Memory Recall
              </span>
              <div className="flex flex-wrap gap-2 items-center">
                {memoryTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10.5px] font-sans font-medium border bg-[#f0f2f8] border-[#dbe0f0] text-[#2d2f39] dark:bg-[#10121a]/60 dark:border-white/[0.04] dark:text-slate-350 shadow-xs"
                  >
                    <Tag className="w-2.5 h-2.5 text-[#4f46e5] dark:text-indigo-400" />
                    {t}
                    <button
                      onClick={() => onRemoveMemoryTag(t)}
                      className="text-[10.5px] ml-1 text-[#474a57] hover:text-rose-500 font-bold font-sans transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
                
                {/* Micro Input form for memory tags */}
                <form onSubmit={handleAddTag} className="flex items-center">
                  <input
                    type="text"
                    placeholder="+ Parameter..."
                    value={newTagVal}
                    onChange={(e) => setNewTagVal(e.target.value)}
                    className="px-2.5 py-1 rounded-xl text-[10.5px] font-mono bg-[#f0f2f8] text-[#1e2029] placeholder-[#94a3b8] focus:bg-white dark:bg-white/[0.02] dark:hover:bg-white/[0.04] focus:dark:bg-[#0c0d12] border-0 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 dark:text-slate-200 dark:placeholder-slate-600 w-28 transition-all"
                  />
                </form>
              </div>
            </div>
          </div>
        ) : (
          
          /* Active Chat Conversation History Frame */
          <div className="max-w-3xl mx-auto space-y-6">
            {activeConversation.messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col space-y-2 ${isUser ? 'items-end' : 'items-start'}`}
                >
                  {/* Sender Name tag */}
                  <div className="flex items-center gap-1.5 text-[10.5px] font-sans font-medium text-slate-400 dark:text-slate-500">
                    <span className="font-semibold text-slate-600 dark:text-slate-400">{isUser ? 'You' : 'Assistant'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-mono text-[9.5px]">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Message Bubble container */}
                  <div
                    className={`leading-relaxed text-[13px] font-sans transition-all
                      ${isUser
                        ? 'p-3.5 px-4.5 rounded-2xl bg-slate-100/80 text-slate-800 dark:bg-[#1a1b22] dark:text-slate-200 border border-slate-200/50 dark:border-transparent max-w-[85%] font-medium'
                        : 'bg-white border border-slate-150/70 shadow-sm p-6 rounded-2xl text-slate-800 dark:bg-transparent dark:border-none dark:shadow-none dark:p-0 dark:text-slate-200 w-full max-w-full text-[13.5px]'}`}
                  >
                    {/* Render attached files for user messages */}
                    {isUser && msg.attachedFiles && msg.attachedFiles.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {msg.attachedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/50 dark:bg-black/20 border border-slate-200/50 dark:border-white/[0.05] text-[11.5px] font-medium text-slate-700 dark:text-slate-300">
                            <FileUp className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="truncate max-w-[150px]">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Format list markdown or pre blocks simply and nicely */}
                    <div className="space-y-3 text-wrap break-words">
                      {renderFormattedMessage(msg.text)}
                    </div>

                    {/* Inline references matching sources parsed */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1d1f27] flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-sans font-semibold text-slate-400 dark:text-slate-500 tracking-normal shrink-0">
                          Retrieved context:
                        </span>
                        {msg.sources.map((src) => (
                          <button
                            key={src.id}
                            onClick={() => setShowCitationPopup(src)}
                            className="flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-sans font-medium transition-all border
                              bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/80
                              dark:bg-[#1a1b22] dark:border-[#242631] dark:text-slate-350 hover:dark:border-sky-500/20"
                          >
                            <BookOpen className="w-3 h-3 text-sky-400/90" />
                            {src.title}
                            <span className="text-emerald-500 text-[9px] font-mono font-bold">{(src.confidence * 100).toFixed(0)}%</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Thought / Expandable Reasoning blocks inside agent results */}
                  {!isUser && msg.thought && (
                    <div className="w-full max-w-[85%] border border-slate-150 bg-slate-100/20 dark:border-[#22242f] dark:bg-[#14151a]/40 rounded-xl p-3">
                      <details className="group focus:outline-none">
                        <summary className="cursor-pointer text-[10.5px] font-sans font-semibold text-slate-400 dark:text-slate-500 select-none flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CornerDownRight className="w-3.5 h-3.5 text-indigo-400" />
                            Process reasoning
                          </span>
                          <span className="transition-transform group-open:rotate-180 font-bold text-[8px]">▼</span>
                        </summary>
                        <div className="mt-2.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 border-l border-indigo-500/30 pl-3">
                          {msg.thought}
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Waiting loader container */}
            {isSending && (
              <div className="flex items-center gap-2.5 py-4 text-slate-400 select-none">
                <Loader2 className="w-3.5 h-3.5 text-sky-500 animate-spin" />
                <span className="text-[12.5px] font-sans text-slate-500 dark:text-slate-400">
                  Formulating response...
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Citation Context Popup overlay */}
      <AnimatePresence>
        {showCitationPopup && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full p-5 rounded-2xl border bg-white border-slate-200 dark:bg-[#0d121c] dark:border-[#202d46]"
            >
              <div className="flex items-center justify-between mb-3 border-b pb-2 dark:border-[#19243a]">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                    Vector Chunk Preview
                  </span>
                </div>
                <button
                  onClick={() => setShowCitationPopup(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-[#162135]"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3 font-mono">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Source: <span className="text-slate-900 dark:text-slate-200 font-bold">{showCitationPopup.title}</span></span>
                  <span>Type: <span className="uppercase font-bold text-indigo-400">{showCitationPopup.type}</span></span>
                </div>
                <div className="rounded p-3 bg-slate-50 dark:bg-[#080d15] text-[10.5px] leading-relaxed border dark:border-[#152033] text-slate-600 dark:text-slate-400">
                  "{showCitationPopup.snippet}"
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                  <span>Relevance: <span className="text-emerald-500 font-bold">{(showCitationPopup.confidence * 100).toFixed(0)}% match</span></span>
                  {showCitationPopup.url !== '#' && (
                    <a
                      href={showCitationPopup.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sky-400 hover:underline"
                    >
                      Inspect URL
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Primary Input Panel at bottom */}
      <div className="p-5 border-t bg-transparent border-slate-200/75 dark:bg-[#0c0d12]/45 dark:border-white/[0.04] shrink-0">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto space-y-3">
          
          <div className="relative rounded-2xl border bg-white border-slate-250/70 dark:bg-[#131520]/60 dark:border-white/[0.04] group focus-within:border-blue-500/50 focus-within:shadow-xl focus-within:shadow-blue-500/5 transition-all flex flex-col">
            
            {stagedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 pb-0">
                {stagedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#1e2029] border border-slate-200 dark:border-white/[0.04] text-xs font-medium text-slate-700 dark:text-slate-300">
                    <FileUp className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate max-w-[120px]">{f.name}</span>
                    <button 
                      type="button" 
                      onClick={() => setStagedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="ml-1.5 text-slate-400 hover:text-red-500 transition-colors font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Query multi-agent clusters... (Enter to send, Shift+Enter for newline)"
              className="w-full text-[12.5px] font-sans font-medium p-4.5 pr-32 bg-transparent border-none focus:outline-none placeholder-slate-400 text-slate-800 dark:text-slate-100 min-h-[64px] max-h-24 resize-none leading-relaxed"
              rows={2}
            />

            {/* Smart tool buttons floating on prompt box */}
            <div className="absolute right-3.5 bottom-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-450 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200"
                title="Ingest raw metadata files"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.txt,.doc,.docx"
              />

              <button
                type="button"
                className="p-2 rounded-xl transition-colors hover:bg-slate-100 text-slate-450 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200"
                title="Voice parameters prompt"
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium ${
                  webSearchEnabled 
                  ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' 
                  : 'hover:bg-slate-100 text-slate-450 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200'
                }`}
                title="Toggle Web Research Agent"
              >
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">Web Search</span>
              </button>

              <button
                type="submit"
                disabled={isSending || (!inputText.trim() && stagedFiles.length === 0)}
                className={`p-2 px-3 rounded-xl font-medium transition-all duration-150 flex items-center gap-1.5 text-xs
                  ${(inputText.trim() || stagedFiles.length > 0) && !isSending
                    ? 'bg-[#2563eb] text-white shadow-md hover:bg-[#1d4ed8]'
                    : 'bg-slate-100 text-slate-350 dark:bg-white/[0.02] dark:text-slate-650'}`}
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-sans text-slate-400 dark:text-slate-500 select-none px-1">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/85 animate-pulse"></span>
              Context aligned • Active corpus: Pinecone-Live (v3) • 2.6 GB
            </span>
            <span className="text-[10px] font-sans font-medium text-slate-400 dark:text-slate-500">Total index delay: ~4 ms</span>
          </div>
        </form>
      </div>
    </div>
  );
}
