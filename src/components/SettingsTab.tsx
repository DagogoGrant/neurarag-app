/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Terminal,
  Activity,
  UserCheck,
  ToggleLeft,
  Sliders,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Clock,
  Unlock,
  KeyRound,
  Trash2,
  Cpu,
  Layers,
  ShieldAlert,
  Server,
  AlertCircle
} from 'lucide-react';
import { TimelineEvent } from '../types';

interface SettingsTabProps {
  timelineEvents: TimelineEvent[];
  onClearTimeline: () => void;
  ollamaUrl: string;
  setOllamaUrl: (url: string) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  openaiApiKey: string;
  setOpenaiApiKey: (key: string) => void;
}

export default function SettingsTab({
  timelineEvents,
  onClearTimeline,
  ollamaUrl,
  setOllamaUrl,
  ollamaModel,
  setOllamaModel,
  geminiApiKey,
  setGeminiApiKey,
  openaiApiKey,
  setOpenaiApiKey
}: SettingsTabProps) {
  const [safetyFilter, setSafetyFilter] = useState('high');
  const [enableStrictCitations, setEnableStrictCitations] = useState(true);
  const [maxConcurrencyThreads, setMaxConcurrencyThreads] = useState(4);
  const [systemAlertThreshold, setSystemAlertThreshold] = useState(0.85);

  const getStatusBadge = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'success':
        return 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-transparent';
      case 'info':
        return 'text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-transparent';
      case 'warn':
        return 'text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-transparent';
      case 'error':
        return 'text-red-700 bg-red-50 dark:bg-red-500/10 dark:text-red-400 border-transparent';
    }
  };

  return (
    <div className="w-full h-full p-8 space-y-8 overflow-y-auto bg-slate-50/30 dark:bg-transparent font-sans">
      
      {/* Title Block */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.06] pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <div className="p-2 bg-blue-100/50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            Preferences & Integrations
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Configure agent boundaries, API credentials, and monitor real-time execution logs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onClearTimeline}
            className="px-4 py-2.5 rounded-xl border text-sm font-semibold hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 bg-white border-slate-200 dark:bg-white/[0.02] dark:border-white/[0.08] dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 dark:hover:text-red-400 shadow-sm transition-all"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            Clear Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Parameters fine-tuning */}
        <div className="lg:col-span-1 space-y-8 text-left">
          
          {/* Credentials and local providers Card */}
          <div className="p-6 rounded-2xl border bg-white border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.08] space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <KeyRound className="w-4.5 h-4.5 text-blue-500" />
              API Credentials
            </h3>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Ollama Local URL</label>
                <input
                  type="text"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  placeholder="e.g. http://localhost:11434"
                  className="w-full text-sm py-2.5 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all
                    bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white dark:bg-black/20 dark:border-white/[0.1] dark:text-slate-200 focus:dark:bg-black/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Ollama Model Name</label>
                <input
                  type="text"
                  value={ollamaModel}
                  onChange={(e) => setOllamaModel(e.target.value)}
                  placeholder="e.g. llama3, mistral, phi3"
                  className="w-full text-sm py-2.5 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all
                    bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white dark:bg-black/20 dark:border-white/[0.1] dark:text-slate-200 focus:dark:bg-black/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Gemini API Key</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full text-sm py-2.5 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all
                    bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white dark:bg-black/20 dark:border-white/[0.1] dark:text-slate-200 focus:dark:bg-black/40"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">OpenAI API Key</label>
                <input
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="Enter custom OpenAI Key"
                  className="w-full text-sm py-2.5 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all
                    bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white dark:bg-black/20 dark:border-white/[0.1] dark:text-slate-200 focus:dark:bg-black/40"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border bg-white border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.08] space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-blue-500" />
              Agent Execution
            </h3>

            <div className="space-y-6">
              
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Model Safety Guardrail</label>
                <div className="bg-slate-50 dark:bg-black/20 p-1.5 rounded-xl border border-slate-200 dark:border-white/[0.05] grid grid-cols-3 gap-1.5">
                  {['minimum', 'medium', 'high'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSafetyFilter(lvl)}
                      className={`text-xs py-2 rounded-lg font-semibold capitalize transition-all duration-200
                        ${safetyFilter === lvl
                          ? 'bg-white text-blue-600 border border-slate-200 shadow-sm dark:bg-[#252836] dark:border-white/[0.1] dark:text-blue-400'
                          : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-transparent border border-transparent'}`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Similarity Threshold</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{(systemAlertThreshold * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.99"
                  step="0.05"
                  value={systemAlertThreshold}
                  onChange={(e) => setSystemAlertThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Parallel Threads</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{maxConcurrencyThreads} Nodes</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={maxConcurrencyThreads}
                  onChange={(e) => setMaxConcurrencyThreads(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.08]">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Strict Source Citations</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableStrictCitations}
                    onChange={(e) => setEnableStrictCitations(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none dark:bg-white/[0.1] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-transparent peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Execution logs timeline trace */}
        <div className="lg:col-span-2 p-6 bg-white border rounded-2xl shadow-sm border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.08] text-left flex flex-col">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/[0.08] mb-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-emerald-500" />
              Runtime Logs
            </h3>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-white/[0.05] rounded-full text-slate-600 dark:text-slate-400">
              {timelineEvents.length} Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {timelineEvents.length > 0 ? (
              timelineEvents.map((ev, index) => (
                <div key={ev.id || index} className="flex gap-4 items-start relative pb-2">
                  {index < timelineEvents.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-slate-200 dark:bg-white/[0.1]"></div>
                  )}

                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${getStatusBadge(ev.status)}`}>
                    <Terminal className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-2 pt-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{ev.title}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-white/[0.05] px-2 py-0.5 rounded">
                          {ev.agentId}
                        </span>
                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ev.timestamp}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-black/20 p-4 rounded-xl border border-slate-100 dark:border-white/[0.05] leading-relaxed">
                      {ev.detail}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/[0.02] flex items-center justify-center border border-slate-100 dark:border-white/[0.05]">
                  <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-sm font-medium">No execution logs recorded yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

