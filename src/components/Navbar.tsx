/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Sun,
  Moon,
  Search,
  Bell,
  Cpu,
  Terminal,
  Server,
  Sparkles,
  Command,
  Settings,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';
import { Theme, TimelineEvent } from '../types';

import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  onSearch: (searchTerm: string) => void;
  onTriggerCommandPalette?: () => void;
  timelineEvents: TimelineEvent[];
  onClearNotifications: () => void;
  session?: Session;
}

export default function Navbar({
  theme,
  setTheme,
  selectedModel,
  setSelectedModel,
  onSearch,
  onTriggerCommandPalette,
  timelineEvents,
  onClearNotifications,
  session
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const models = [
    { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', desc: 'Google Cloud fast reasoning' },
    { id: 'gemini-pro-latest', label: 'Gemini Pro Latest', desc: 'Google Cloud complex reasoning' },
    { id: 'openai-gpt-4o', label: 'OpenAI GPT-4o', desc: 'OpenAI flagship reasoning model' },
    { id: 'openai-gpt-4o-mini', label: 'OpenAI GPT-4o-mini', desc: 'OpenAI fast lightweight reasoning' },
    { id: 'neurarag-simulation', label: 'NeuraRAG Simulation', desc: 'Mock pipeline response logs' },
    { id: 'ollama-local', label: 'Ollama: Local Node', desc: 'Run locally via Ollama endpoint' }
  ];

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 transition-colors duration-200 select-none bg-white border-slate-200 dark:bg-[#0c0d12]/90 dark:border-white/[0.04] backdrop-blur-xl z-20">
      
      {/* Search Input Box */}
      <div className="flex items-center gap-4 w-1/3">
        <div className="relative w-full group">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Search documents, entities, previous prompts..."
            onChange={(e) => onSearch(e.target.value)}
            className="w-full text-xs font-semibold pl-9 pr-12 py-2 rounded-xl border focus:outline-none transition-all duration-200
              bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-slate-350 focus:ring-4 focus:ring-slate-100/30
              dark:bg-white/[0.03] dark:border-transparent dark:text-slate-100 dark:placeholder-slate-500 focus:dark:bg-[#111218]/90 focus:dark:border-indigo-505/30 focus:dark:ring-4 focus:dark:ring-indigo-500/5"
          />
          <span
            onClick={onTriggerCommandPalette}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer flex items-center gap-1 px-2 py-0.5 text-[9.5px] font-sans font-medium rounded-lg border text-slate-400 bg-slate-100/40 border-slate-200 dark:bg-white/[0.02] dark:border-white/[0.06] dark:text-slate-400 hover:scale-102 transition-transform select-none"
          >
            <Command className="w-2.5 h-2.5" />
            <span>K</span>
          </span>
        </div>
      </div>

      {/* Center Model Selector and Cluster Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-white/[0.02] dark:border-white/[0.04]">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Model Node:
            </span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="text-[11px] font-sans font-bold py-0.5 pl-0 pr-6 rounded-lg appearance-none bg-transparent focus:outline-none cursor-pointer transition-all text-blue-600 dark:text-indigo-400"
            >
              {models.map((m) => (
                <option key={m.id} value={m.id} className="bg-white dark:bg-[#121319] text-slate-800 dark:text-slate-200" title={m.desc}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-8 pointer-events-none" />
            <button className="p-0.5 hover:bg-slate-200/50 dark:hover:bg-white/[0.04] rounded-lg transition-colors ml-1" title="Model settings">
              <Settings className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            </button>
          </div>
        </div>


      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl border border-slate-205 hover:bg-slate-50 dark:border-white/[0.04] dark:hover:bg-white/[0.03] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer" 
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {timelineEvents && timelineEvents.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border border-white"></span>
            )}
          </button>

          {/* Popover Notification Panel Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-h-96 bg-white border border-slate-200 rounded-2xl shadow-xl dark:bg-[#121318] dark:border-[#242631] z-50 p-4 space-y-3 font-sans text-left">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.04] pb-2">
                <span className="text-[10px] font-sans font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  System Logs ({timelineEvents?.length || 0})
                </span>
                {timelineEvents && timelineEvents.length > 0 && (
                  <button 
                    onClick={() => {
                      onClearNotifications();
                      setShowNotifications(false);
                    }}
                    className="text-[9.5px] font-bold text-red-500 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto scrollbar-thin">
                {timelineEvents && timelineEvents.length > 0 ? (
                  timelineEvents.map((evt) => (
                    <div 
                      key={evt.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-150/70 dark:bg-slate-900/50 dark:border-white/[0.02] text-[10.5px] leading-relaxed text-slate-650 dark:text-slate-400"
                    >
                      <div className="flex justify-between items-center gap-2 mb-1">
                        <span className={`font-bold text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md border
                          ${evt.status === 'success' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30' 
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30'}`}>
                          {evt.agentId}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{evt.timestamp}</span>
                      </div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{evt.title}</div>
                      <p className="text-[9.5px] text-slate-500 mt-0.5 leading-snug">{evt.detail}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 italic text-[11px] select-none">
                    No active notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Icon (Sun/Moon style matching mockup) */}
        <button
          onClick={() => {
            const nextTheme = theme === 'light' ? 'dark' : 'light';
            setTheme(nextTheme);
          }}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 dark:border-white/[0.04] dark:hover:bg-white/[0.03] text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
          title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-500" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
        </button>

        {/* Dynamic User Profile Badge */}
        <div className="relative">
          <div 
            className="flex items-center gap-2.5 px-3 py-1 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-white/[0.02] dark:border-white/[0.04] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="w-7.5 h-7.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center justify-center overflow-hidden border border-indigo-200 dark:border-indigo-500/30">
              <User className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left max-w-[120px]">
              <span className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200 leading-none truncate">
                {session?.user?.email || "Guest Session"}
              </span>
              <span className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Secure Workspace
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0f111a] rounded-xl border border-slate-200 dark:border-white/[0.05] shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-white/[0.05]">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Signed in as</p>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                  {session?.user?.email || "Guest"}
                </p>
              </div>
              <div className="p-1">
                <button
                  onClick={async () => {
                    setShowProfileMenu(false);
                    await supabase.auth.signOut();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
