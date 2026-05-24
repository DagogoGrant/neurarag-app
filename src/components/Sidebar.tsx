/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Brain,
  MessageSquare,
  Database,
  GitFork,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FolderOpen,
  Activity,
  Layers,
  Home,
  LayoutGrid,
  Cpu
} from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  activeTab: 'workspace' | 'knowledge' | 'workflows' | 'analytics' | 'settings';
  setActiveTab: (tab: 'workspace' | 'knowledge' | 'workflows' | 'analytics' | 'settings') => void;
  conversations: Conversation[];
  activeConversationId: string;
  setActiveConversationId: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  selectedModel: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  conversations,
  activeConversationId,
  setActiveConversationId,
  onNewConversation,
  onDeleteConversation,
  sidebarCollapsed,
  setSidebarCollapsed,
  selectedModel
}: SidebarProps) {
  const navItems = [
    { id: 'workspace', label: 'Conversations', icon: MessageSquare },
    { id: 'knowledge', label: 'Knowledge Base', icon: Database },
    { id: 'workflows', label: 'Workflows', icon: GitFork },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  return (
    <div
      className={`relative h-full flex flex-col border-r transition-all duration-300 ease-in-out select-none shrink-0
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        bg-white border-slate-200 text-slate-800
        dark:bg-[#0c0d12]/80 dark:border-white/[0.04] dark:text-slate-200`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-white/[0.04]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="p-1.5 rounded-xl bg-[#2563eb] shrink-0 text-white shadow-sm">
            <Brain className="w-4.5 h-4.5" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col text-left">
              <span className="font-display font-semibold text-[15px] leading-tight tracking-tight text-slate-900 dark:text-slate-50">
                NeuraRAG
              </span>
              <span className="text-[9.5px] font-sans font-medium tracking-wide text-indigo-600/70 dark:text-sky-400/70 uppercase">
                AI Knowledge Workspace
              </span>
            </div>
          )}
        </div>

        {!sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-1.5 rounded-lg transition-colors hover:bg-slate-100/65 dark:hover:bg-white/[0.03] text-slate-450 hover:text-slate-800 dark:hover:text-slate-100"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {sidebarCollapsed && (
        <div className="flex justify-center my-2">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-1.5 rounded-md transition-colors bg-slate-50 dark:bg-[#111723] border border-slate-250 dark:border-[#1d2230] text-slate-405 hover:text-slate-250"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Action Button */}
      <div className="p-3">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 bg-[#2563eb] border border-[#2563eb] hover:bg-[#1d4ed8] text-white transition-all duration-200 py-2.5 rounded-xl text-xs font-medium shadow-sm active:scale-98"
        >
          <Plus className="w-3.5 h-3.5 shrink-0" />
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between flex-1">
              <span className="font-sans font-medium">New Conversation</span>
              <span className="text-[9px] opacity-60 font-mono scale-90">⌘ N</span>
            </div>
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Set active visually based on tab alignment
          const isSelected = activeTab === item.id || (item.id === 'workspace' && activeTab === 'workspace');
          
          return (
            <button
              key={item.id}
              onClick={() => {
                // Route templates and conversations correctly
                if (item.id === 'workspace' || item.id === 'knowledge' || item.id === 'workflows' || item.id === 'analytics' || item.id === 'settings') {
                  setActiveTab(item.id);
                } else if (item.id === 'templates') {
                  setActiveTab('workflows');
                } else if (item.id === 'conversations' || item.id === 'agents') {
                  setActiveTab('workspace');
                }
                if (sidebarCollapsed) setSidebarCollapsed(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-all duration-150 group border border-transparent
                ${isSelected 
                  ? 'bg-[#f0f4ff] text-[#2563eb] font-semibold dark:bg-white/[0.04] dark:text-slate-50' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02] hover:text-slate-900 dark:hover:text-slate-200'}`}
              title={item.label}
            >
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${isSelected ? 'text-[#2563eb] dark:text-indigo-400' : 'text-slate-400'}`} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Recent Conversations */}
        {!sidebarCollapsed && (
          <div className="pt-6">
            <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 pb-2 text-left">
              Recent Conversations
            </div>
            <div className="space-y-1.5 px-1 max-h-56 overflow-y-auto scrollbar-thin">
              {conversations && conversations.length > 0 ? (
                conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setActiveTab('workspace');
                      }}
                      className={`group w-full flex flex-col px-3 py-2 rounded-xl text-xs text-left cursor-pointer transition-colors border border-transparent
                        ${isActive 
                          ? 'bg-slate-50 border-slate-200/60 dark:bg-[#181a22] dark:border-white/[0.03]' 
                          : 'hover:bg-slate-50/50 dark:hover:bg-[#111726]/30'}`}
                    >
                      <span className={`font-semibold truncate text-[11px] leading-snug
                        ${isActive ? 'text-blue-600 dark:text-indigo-400' : 'text-slate-750 dark:text-slate-350'}`}>
                        {conv.title === 'Active New Session' ? 'New Conversation' : conv.title}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-medium mt-0.5 flex items-center justify-between">
                        <span>{conv.timestamp}</span>
                        {conversations.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteConversation(conv.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-0.5 rounded cursor-pointer"
                            title="Delete thread"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="p-3 text-xs italic text-slate-400 text-left">
                  No active discussions.
                </div>
              )}
            </div>
          </div>
        )}
      </nav>


    </div>
  );
}
