/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  GitFork,
  Play,
  Copy,
  Plus,
  Trash2,
  Settings2,
  Cpu,
  ShieldCheck,
  Save,
  Grid,
  Zap,
  CheckCircle2,
  HelpCircle,
  Database,
  ArrowRight,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface WorkflowTemplate {
  id: string;
  name: string;
  desc: string;
  nodesCount: number;
  triggerType: string;
  status: 'active' | 'draft';
}

export default function WorkflowsTab() {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([
    { id: '1', name: 'Self-Corrective RAG Loop', desc: 'Retrieved chunks are passed back to Critic for hallucination checking before Synthesizer execution QA.', nodesCount: 5, triggerType: 'API POST', status: 'active' },
    { id: '2', name: 'Deep Multi-Agent Legal Grounding', desc: 'Planner agent splits task. Parallel retrievers query judicial vector store chunks, validated by compliance evaluator.', nodesCount: 7, triggerType: 'Webhook Pull', status: 'active' },
    { id: '3', name: 'Sequential Code Refactoring Chain', desc: 'Direct AST verification and safe sandbox tests of AI code fragments.', nodesCount: 4, triggerType: 'GitHub Commit', status: 'draft' }
  ]);

  const [activeWorkflowId, setActiveWorkflowId] = useState('1');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('n-2');

  const selectedTemplate = templates.find(t => t.id === activeWorkflowId) || templates[0];

  // Coordinates of nodes inside our visually stunning canvas
  const canvasNodes = [
    { 
      id: 'n-1', 
      label: 'User Trigger', 
      type: 'Trigger', 
      icon: Zap,
      desc: 'Incoming prompt payload',
      delay: '0 ms', 
      x: 30, 
      y: 110, 
      status: 'Completed',
      colorClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
    },
    { 
      id: 'n-2', 
      label: 'Query Intent Planner', 
      type: 'Agent', 
      icon: Cpu,
      desc: 'Formulates query strategy',
      delay: '124 ms', 
      x: 230, 
      y: 110, 
      status: 'Active',
      colorClass: 'bg-blue-50 text-blue-705 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20'
    },
    { 
      id: 'n-3', 
      label: 'Deep Vector Retriever', 
      type: 'Retrieval', 
      icon: Database,
      desc: 'Indexes metadata blocks',
      delay: '412 ms', 
      x: 430, 
      y: 30, 
      status: 'Idle',
      colorClass: 'bg-indigo-50 text-indigo-705 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20'
    },
    { 
      id: 'n-4', 
      label: 'Hallucination Critic', 
      type: 'Validation', 
      icon: ShieldCheck,
      desc: 'Validates factual alignment',
      delay: '202 ms', 
      x: 430, 
      y: 190, 
      status: 'Idle',
      colorClass: 'bg-amber-50 text-amber-705 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20'
    },
    { 
      id: 'n-5', 
      label: 'Response Synthesizer', 
      type: 'Agent', 
      icon: Cpu,
      desc: 'Generates final output text',
      delay: '98 ms', 
      x: 630, 
      y: 110, 
      status: 'Idle',
      colorClass: 'bg-violet-50 text-violet-705 dark:bg-violet-500/10 dark:text-violet-400 border-violet-100 dark:border-violet-500/20'
    }
  ];

  return (
    <div className="w-full h-full p-6 space-y-6 overflow-y-auto select-none bg-transparent font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 dark:border-white/[0.04] pb-4">
        <div>
          <h2 className="text-[17px] font-sans font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-indigo-400 rounded-xl border border-blue-100 dark:border-transparent">
              <GitFork className="w-4 h-4" />
            </div>
            Adaptive Agent Workflow Architect
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Construct recursive logic paths, configure pipeline components, and orchestrate RAG safety gates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 rounded-xl border text-xs font-bold hover:bg-slate-50 flex items-center gap-2 bg-white border-slate-200 dark:bg-[#111218] dark:border-white/[0.06] dark:text-slate-300 dark:hover:bg-white/[0.02] shadow-xs active:scale-[0.98]">
            <Save className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            Export Blueprint
          </button>
          <button className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]">
            <Plus className="w-3.5 h-3.5" />
            New Workflow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Templates and Triggers lists */}
        <div className="lg:col-span-1 space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
            Active Blueprints
          </div>
          <div className="space-y-3">
            {templates.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveWorkflowId(t.id)}
                className={`p-4.5 rounded-2xl border cursor-pointer transition-all text-left space-y-3 shadow-xs
                  ${activeWorkflowId === t.id
                    ? 'bg-white border-blue-600 ring-4 ring-blue-50 dark:bg-[#121625] dark:border-blue-500 dark:ring-transparent'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50/50 hover:border-slate-300 dark:bg-[#111218] dark:border-white/[0.04] dark:hover:bg-white/[0.01]'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[12px] font-bold truncate ${activeWorkflowId === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-800 dark:text-slate-205'}`}>
                    {t.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-sans font-bold tracking-normal uppercase border shrink-0
                    ${t.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/10' 
                      : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-white/[0.04] dark:border-transparent dark:text-slate-400'}`}>
                    {t.status}
                  </span>
                </div>
                <p className="text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-450 line-clamp-2">
                  {t.desc}
                </p>
                <div className="flex items-center justify-between text-[9.5px] font-semibold text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-white/[0.02]">
                  <span>Nodes: <strong className="text-slate-700 dark:text-slate-350">{t.nodesCount}</strong></span>
                  <span>Trigger: <strong className="text-slate-700 dark:text-slate-350">{t.triggerType}</strong></span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl border bg-white border-slate-200/80 dark:bg-[#111218] dark:border-white/[0.04] text-[10.5px] leading-relaxed space-y-2.5 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block mb-1">Execution Policies</span>
            
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Retry limit on Retrieval: <strong className="text-slate-805 dark:text-slate-100 font-bold">3</strong></span>
            </div>
            
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Parallel Retriever Threads: <strong className="text-slate-805 dark:text-slate-100 font-bold">Allowed</strong></span>
            </div>
            
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Max loop recursive depth: <strong className="text-slate-805 dark:text-slate-100 font-bold">5 runs</strong></span>
            </div>
          </div>
        </div>

        {/* Right column: Interactive flowchart canvas */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Active Title bar */}
          <div className="p-3.5 bg-white border rounded-2xl flex items-center justify-between border-slate-200/80 dark:bg-[#111218] dark:border-white/[0.04] shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11.5px] font-semibold text-slate-400 dark:text-slate-400">Editing Blueprint:</span>
              <span className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{selectedTemplate.name}</span>
            </div>
            <div>
              <button className="px-3 py-1.5 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-transparent rounded-xl flex items-center gap-1.5 transition-all cursor-pointer">
                <Play className="w-3 h-3 fill-emerald-700 dark:fill-emerald-400" /> Run Spec
              </button>
            </div>
          </div>

          {/* Canvas Wrapper */}
          <div className="relative h-[340px] bg-slate-50 border border-slate-200 rounded-2xl overflow-x-auto overflow-y-hidden dark:bg-[#090b11] dark:border-white/[0.04] select-none shadow-xs scrollbar-thin">
            
            {/* Custom visual styling injection for flowing line animation */}
            <style>{`
              @keyframes flow {
                from {
                  stroke-dashoffset: 20;
                }
                to {
                  stroke-dashoffset: 0;
                }
              }
              .animate-flow-dash {
                stroke-dasharray: 6 4;
                animation: flow 1.5s linear infinite;
              }
            `}</style>

            {/* High-end design layout dot grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none"></div>

            {/* Canvas Inner Container (forced width to support layout connections correctly) */}
            <div className="absolute w-[820px] h-full">
              
              {/* SVG Curved Linking Vectors */}
              <svg className="absolute inset-0 pointer-events-none select-none w-full h-full">
                <defs>
                  {/* Premium visual gradients */}
                  <linearGradient id="grad-emerald-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="grad-blue-indigo" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="grad-blue-amber" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                  <linearGradient id="grad-indigo-violet" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                  <linearGradient id="grad-amber-violet" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>

                {/* Smooth Bezier Connections with animated data flow */}
                {/* 1. Trigger to Planner */}
                <path d="M 190,148 C 210,148 210,148 230,148" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-white/[0.04]" />
                <path d="M 190,148 C 210,148 210,148 230,148" fill="none" stroke="url(#grad-emerald-blue)" strokeWidth="2" strokeLinecap="round" className="animate-flow-dash" />

                {/* 2. Planner to Retriever */}
                <path d="M 390,148 C 410,148 410,68 430,68" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-white/[0.04]" />
                <path d="M 390,148 C 410,148 410,68 430,68" fill="none" stroke="url(#grad-blue-indigo)" strokeWidth="2" strokeLinecap="round" className="animate-flow-dash" />

                {/* 3. Planner to Critic */}
                <path d="M 390,148 C 410,148 410,228 430,228" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-white/[0.04]" />
                <path d="M 390,148 C 410,148 410,228 430,228" fill="none" stroke="url(#grad-blue-amber)" strokeWidth="2" strokeLinecap="round" />

                {/* 4. Retriever to Synthesizer */}
                <path d="M 590,68 C 610,68 610,148 630,148" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-white/[0.04]" />
                <path d="M 590,68 C 610,68 610,148 630,148" fill="none" stroke="url(#grad-indigo-violet)" strokeWidth="2" strokeLinecap="round" />

                {/* 5. Critic to Synthesizer */}
                <path d="M 590,228 C 610,228 610,148 630,148" fill="none" stroke="#e2e8f0" strokeWidth="3" className="dark:stroke-white/[0.04]" />
                <path d="M 590,228 C 610,228 610,148 630,148" fill="none" stroke="url(#grad-amber-violet)" strokeWidth="2" strokeLinecap="round" />
              </svg>

              {/* In-canvas nodes placement */}
              {canvasNodes.map((n) => {
                const isActive = selectedNodeId === n.id;
                const IconComponent = n.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNodeId(n.id)}
                    style={{ left: `${n.x}px`, top: `${n.y}px` }}
                    className={`absolute rounded-2xl border cursor-pointer select-none transition-all duration-200 shadow-sm text-left z-10 w-40 overflow-hidden hover:-translate-y-0.5 hover:shadow-md
                      ${isActive
                        ? 'bg-white border-blue-600 ring-4 ring-blue-500/10 scale-102 dark:bg-[#121625] dark:border-blue-500 dark:ring-transparent'
                        : 'bg-white border-slate-200/80 dark:bg-[#111218] dark:border-white/[0.06] hover:border-slate-350 dark:hover:border-white/[0.12]'}`}
                  >
                    {/* Node Header Indicator */}
                    <div className={`px-3 py-2 border-b flex items-center justify-between font-sans ${n.colorClass}`}>
                      <div className="flex items-center gap-1.5">
                        <IconComponent className="w-3.5 h-3.5" />
                        <span className="text-[8.5px] font-extrabold uppercase tracking-wider">{n.type}</span>
                      </div>
                      <span className="flex h-2 w-2 relative shrink-0">
                        {n.status === 'Active' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${n.status === 'Active' ? 'bg-blue-500' : n.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                      </span>
                    </div>

                    {/* Node Body Details */}
                    <div className="p-3 space-y-1 bg-white dark:bg-transparent">
                      <h4 className="text-[11.5px] font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">{n.label}</h4>
                      <p className="text-[9.5px] text-slate-450 dark:text-slate-400 truncate leading-relaxed">{n.desc}</p>
                      <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-100/50 dark:border-white/[0.02]">
                        <span>Latency</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{n.delay}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Node detailed inspector card (Sleek SaaS Properties Panel Style) */}
          {selectedNodeId && (
            <div className="p-5 rounded-2xl border bg-white border-slate-200/80 dark:bg-[#111218] dark:border-white/[0.04] text-left shadow-xs flex flex-col gap-4">
              
              {/* Inspector Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.03] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-450 border border-blue-100/50 dark:border-transparent shrink-0">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Configuration Properties</span>
                    <span className="text-[13px] font-bold text-slate-850 dark:text-slate-200 flex items-center gap-2">
                      Query Intent Planner
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.03] text-[9.5px] font-semibold text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.03]">ID: n-2</span>
                    </span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <span>Type:</span>
                  <span className="font-bold text-slate-600 dark:text-slate-350">Agent Node</span>
                </div>
              </div>

              {/* Grid of clean visual parameters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                
                {/* 1. Core Model & Routing */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide block">Node Class & Status</label>
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-white/[0.03] dark:bg-white/[0.01] flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Active reasoning agent</span>
                    <span className="px-2 py-0.5 text-[9.5px] font-bold bg-blue-50 text-blue-600 border border-blue-100 rounded-md dark:bg-blue-500/10 dark:text-blue-400 dark:border-transparent">ACTIVE</span>
                  </div>
                </div>
                
                {/* 2. Compliance policy status */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide block">Compliance Check</label>
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-white/[0.03] dark:bg-white/[0.01] flex items-center gap-2">
                    <div className="h-4.5 w-4.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-450 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block leading-tight">Critic Validation Pass</span>
                      <span className="text-[9.5px] text-slate-400 mt-0.5 block leading-none">Strict alignment logic enabled</span>
                    </div>
                  </div>
                </div>

                {/* 3. Inference controls */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide block">Inference Temperature: 0.70</label>
                  <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 dark:border-white/[0.03] dark:bg-white/[0.01] space-y-1.5">
                    {/* Visual SaaS Temperature Slider representation */}
                    <div className="relative pt-1">
                      <div className="flex mb-1 items-center justify-between text-[9px] text-slate-400">
                        <span>Precise (0.0)</span>
                        <span>Creative (1.0)</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-white/[0.06] rounded-full overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full" style={{ width: '70%' }}></div>
                        <div className="absolute top-1/2 -translate-y-1/2 h-3 w-3 bg-white border-2 border-blue-500 rounded-full shadow-xs" style={{ left: '68%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

