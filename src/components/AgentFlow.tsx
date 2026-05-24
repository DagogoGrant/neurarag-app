/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Sparkles,
  ClipboardList,
  Search,
  BookOpen,
  CheckCircle,
  HelpCircle,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import { AgentState } from '../types';

interface AgentFlowProps {
  agentsState?: Record<string, AgentState>;
}

export default function AgentFlow({ agentsState }: AgentFlowProps) {
  // Default fallback states if no active chat has driven them
  const defaultAgents: Record<string, AgentState> = {};

  if (!agentsState) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-slate-400 dark:text-slate-500 font-sans text-xs bg-white dark:bg-[#121318]/40 border border-dashed border-slate-200 dark:border-white/[0.04] rounded-2xl mx-4 my-2 shadow-xs">
        <Zap className="w-5 h-5 text-indigo-500 mb-1.5 animate-pulse" />
        <span className="font-bold text-slate-700 dark:text-slate-300">Agent Pipeline Idle</span>
        <span className="text-[10px] text-slate-450 mt-0.5 font-medium">Submit a query to trace real live multi-agent execution steps.</span>
      </div>
    );
  }

  const agents = agentsState;

  const agentDetails = [
    {
      key: 'planner',
      icon: ClipboardList,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/20'
    },
    {
      key: 'retriever',
      icon: Search,
      color: 'from-amber-400 to-orange-500',
      textColor: 'text-amber-500',
      borderColor: 'border-orange-500/20'
    },
    {
      key: 'memory',
      icon: BookOpen,
      color: 'from-pink-500 to-purple-600',
      textColor: 'text-pink-400',
      borderColor: 'border-pink-500/20'
    },
    {
      key: 'critic',
      icon: ShieldCheck,
      color: 'from-emerald-400 to-teal-600',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20'
    },
    {
      key: 'synthesizer',
      icon: Sparkles,
      color: 'from-sky-400 via-indigo-500 to-purple-600',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/30'
    }
  ];

  const getStatusStyle = (status: AgentState['status']) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
          border: 'border-emerald-500/30',
          text: 'Completed',
          dot: 'bg-emerald-500'
        };
      case 'running':
        return {
          bg: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 animate-pulse',
          border: 'border-sky-500/40',
          text: 'Active',
          dot: 'bg-sky-500'
        };
      case 'idle':
        return {
          bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
          border: 'border-slate-300 dark:border-[#1e2538]',
          text: 'Idle',
          dot: 'bg-slate-300 dark:bg-slate-600'
        };
      case 'failed':
        return {
          bg: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400',
          border: 'border-red-500/30',
          text: 'Halted',
          dot: 'bg-red-500'
        };
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-transparent select-none overflow-hidden">
      
      {/* Header Info */}
      <div className="flex items-center justify-between gap-1 mb-2 shrink-0">
        <div className="text-left">
          <h3 className="text-[11px] font-sans font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
            LIVE MULTI-AGENT PIPELINE
          </h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium font-sans mt-0.5">
            Real-time visual graphs mapping operational latency checkpoints and vector logic.
          </p>
        </div>

        {/* Right Metric indicators */}
        <div className="hidden sm:flex items-center gap-3">
          <span className="text-[10px] font-sans font-bold text-slate-400 bg-slate-100 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] px-2 py-0.5 rounded-lg">
            Index: Pinecone Vector v3
          </span>
          <span className="text-[10px] font-sans font-bold text-slate-400 bg-slate-100 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] px-2 py-0.5 rounded-lg">
            Total Sync Delay: ~1.0s
          </span>
        </div>
      </div>

      {/* SVG Flow Canvas & Gridded Nodes */}
      <div className="relative flex-1 flex flex-row md:grid md:grid-cols-5 gap-3 items-center p-0.5 w-full min-h-0 overflow-y-hidden overflow-x-auto scrollbar-thin">
        {/* Animated Connections Canvas */}
        <div className="absolute inset-x-0 top-[40%] pointer-events-none select-none overflow-hidden hidden md:block z-0">
          <svg className="w-full h-1" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 30,2 L 1150,2"
              fill="none"
              stroke="#2563eb"
              strokeOpacity="0.15"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              className="animate-[dash_50s_linear_infinite]"
              style={{ strokeDashoffset: 'var(--dash-offset, 0)' }}
            />
          </svg>
          <style>{`
            @keyframes dash {
              to {
                stroke-dashoffset: -1000;
              }
            }
          `}</style>
        </div>

        {/* Dynamic Nodes Mapping */}
        {agentDetails.map((det, index) => {
          const defaultName = det.key.charAt(0).toUpperCase() + det.key.slice(1) + ' Agent';
          const aData = agents[det.key] || {
            id: det.key,
            name: defaultName,
            status: 'idle',
            progress: 0,
            latency: 0,
            reasoning: 'Waiting for pipeline execution...'
          };
          const Icon = det.icon;
          const isCurrent = aData.status === 'running';
          const statusStyle = getStatusStyle(aData.status);

          return (
            <div
              key={det.key}
              className={`relative z-10 flex flex-col p-3.5 rounded-2xl border transition-all duration-300
                shrink-0 min-w-[155px] md:min-w-0 h-full justify-between select-none shadow-sm
                bg-white border-slate-200/80
                dark:bg-[#13151f]/40 dark:border-white/[0.04]
                ${isCurrent ? 'ring-2 ring-blue-500/20 border-blue-500/60 dark:ring-indigo-500/10 dark:border-indigo-500/55' : ''}
                `}
            >
              {/* Header inside node card */}
              <div className="flex items-center justify-between mb-1 shrink-0 gap-1">
                <span className="text-[11.5px] font-sans font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate">
                  {aData.name}
                </span>
                
                {/* Completed green status badge inside card */}
                <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 flex items-center gap-0.5
                  ${aData.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900/30'
                    : aData.status === 'running'
                      ? 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/20 dark:text-blue-450 dark:border-blue-900/30 animate-pulse'
                      : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800'}`}>
                  <span className={`w-1 h-1 rounded-full ${aData.status === 'completed' ? 'bg-emerald-500' : aData.status === 'running' ? 'bg-blue-500 animate-ping' : 'bg-slate-400'}`}></span>
                  {aData.status === 'completed' ? 'Completed' : aData.status === 'running' ? 'Active' : 'Idle'}
                </span>
              </div>

              {/* Middle Row inside node: Colored Icon badge + Delay in ms */}
              <div className="flex items-center gap-2 mt-1 mb-1 shrink-0">
                <div className={`p-1.5 rounded-lg bg-gradient-to-tr ${det.color} text-white shrink-0 shadow-sm`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[9.5px] font-sans font-bold text-slate-500 bg-slate-50 dark:bg-[#1a1c24] border border-slate-200/60 dark:border-white/[0.04] px-1.5 py-0.5 rounded-lg shadow-2xs">
                  Delay: {aData.latency} ms
                </span>
              </div>

              {/* Node Reasoning text block */}
              <div className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2 text-wrap font-sans text-left mt-0.5">
                {aData.reasoning}
              </div>

              {/* Position Connection arrow (except for last synthesizer agent) */}
              {index < 4 && (
                <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full hidden md:flex items-center justify-center text-[10px] font-sans font-bold border bg-white text-slate-400 border-slate-200 dark:bg-[#12141d] dark:border-white/[0.06] dark:text-indigo-400/80 select-none z-20 shadow-sm hover:scale-105 transition-transform">
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
