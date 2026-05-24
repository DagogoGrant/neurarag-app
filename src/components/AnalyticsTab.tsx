/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BarChart3, TrendingUp, AlertCircle, DollarSign, Activity, Cpu, Layers, HelpCircle, ArrowUpRight } from 'lucide-react';
import { Conversation } from '../types';

interface AnalyticsTabProps {
  conversations: Conversation[];
}

export default function AnalyticsTab({ conversations }: AnalyticsTabProps) {
  // Sum up actual metric values
  let totalCost = 0;
  let totalTokens = 0;
  let totalLatency = 0;
  let totalLatencyCount = 0;
  let totalConfidence = 0;
  let totalConfidenceCount = 0;

  // Record active query response latencies to draw in the chart
  const recentLatencies: number[] = [];

  conversations?.forEach(c => {
    c.messages?.forEach(m => {
      if (m.sender === 'assistant') {
        if (m.tokensUsed?.cost) totalCost += m.tokensUsed.cost;
        if (m.tokensUsed?.prompt && m.tokensUsed?.completion) {
          totalTokens += m.tokensUsed.prompt + m.tokensUsed.completion;
        }
        
        let msgLatency = 0;
        let msgAgentsCount = 0;
        if (m.agents) {
          Object.values(m.agents).forEach(a => {
            if (a.latency) {
              totalLatency += a.latency;
              totalLatencyCount++;
              msgLatency += a.latency;
              msgAgentsCount++;
            }
          });
        }
        
        if (msgAgentsCount > 0) {
          recentLatencies.push(msgLatency);
        }

        if (m.sources) {
          m.sources.forEach(src => {
            if (src.confidence) {
              totalConfidence += src.confidence;
              totalConfidenceCount++;
            }
          });
        }
      }
    });
  });

  const avgLatency = totalLatencyCount > 0 ? Math.round(totalLatency / totalLatencyCount) : 0;
  const avgSimilarity = totalConfidenceCount > 0 ? (totalConfidence / totalConfidenceCount) * 100 : 0;

  const metrics = [
    { 
      label: 'Cumulative Cost', 
      value: totalCost > 0 ? `$${totalCost.toFixed(6)}` : '$0.000000', 
      status: totalCost > 0 ? 'Active Billing' : 'No cost accrued', 
      isIdle: totalCost === 0,
      icon: DollarSign, 
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-transparent' 
    },
    { 
      label: 'Total Tokens Consumed', 
      value: totalTokens > 0 ? `${totalTokens.toLocaleString()}` : '0', 
      suffix: ' tokens',
      status: totalTokens > 0 ? 'Usage Synced' : 'Idle Queue', 
      isIdle: totalTokens === 0,
      icon: Activity, 
      color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-transparent' 
    },
    { 
      label: 'Average Pipeline Latency', 
      value: avgLatency > 0 ? `${avgLatency}` : '0', 
      suffix: ' ms',
      status: avgLatency > 0 ? 'Latency Optimized' : 'System Idle', 
      isIdle: avgLatency === 0,
      icon: Cpu, 
      color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-transparent' 
    },
    { 
      label: 'Average Similarity Confidence', 
      value: avgSimilarity > 0 ? `${avgSimilarity.toFixed(1)}%` : '0.0%', 
      status: avgSimilarity > 0 ? 'Confidence Optimal' : 'Reference Idle', 
      isIdle: avgSimilarity === 0,
      icon: Layers, 
      color: 'text-pink-650 bg-pink-50 dark:bg-pink-500/10 border-pink-100 dark:border-transparent' 
    }
  ];

  // Build 7 items for chart representing recent query transactions
  const hasChartData = recentLatencies.length > 0;
  const chartItems = Array.from({ length: 7 }).map((_, idx) => {
    const lat = recentLatencies[idx] || 0;
    const labels = ['Query 1', 'Query 2', 'Query 3', 'Query 4', 'Query 5', 'Query 6', 'Query 7'];
    return {
      label: labels[idx],
      delay: lat,
    };
  });

  return (
    <div className="w-full h-full p-6 space-y-6 overflow-y-auto select-none bg-transparent font-sans">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 dark:border-white/[0.04] pb-4">
        <div>
          <h2 className="text-[17px] font-sans font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <div className="p-1.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-indigo-400 rounded-xl border border-blue-100 dark:border-transparent">
              <BarChart3 className="w-4 h-4" />
            </div>
            Performance & Pricing Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Real-time inference parameters, vector storage fees tracking, and cluster query speeds metrics logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-sans font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-655 dark:bg-[#111218] dark:border-white/[0.06] dark:text-slate-350 shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Real-time billing index active
          </span>
        </div>
      </div>

      {/* Pricing/Usage cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-5 bg-white border rounded-2xl flex items-center justify-between shadow-xs border-slate-200/80 dark:bg-[#111218] dark:border-white/[0.04] transition-all hover:shadow-sm">
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">{m.label}</span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl font-bold text-slate-850 dark:text-slate-100 tracking-tight block">{m.value}</span>
                  {m.suffix && <span className="text-xs font-semibold text-slate-450 dark:text-slate-500">{m.suffix}</span>}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border
                  ${m.isIdle 
                    ? 'bg-slate-50 text-slate-500 border-slate-150 dark:bg-white/[0.02] dark:border-white/[0.03] dark:text-slate-400' 
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/10'}`}>
                  {m.status}
                </span>
              </div>
              <div className={`p-2.5 rounded-xl ${m.color} border shrink-0`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Responsive Custom Latency Bar SVG Chart */}
        <div className="lg:col-span-2 p-5 bg-white border rounded-2xl shadow-xs border-slate-200/80 dark:bg-[#111218] dark:border-white/[0.04] text-left space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.03] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Active Query Latencies (ms vs prompt transaction)
            </h3>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Target baseline: &lt; 1,000ms</span>
          </div>

          {/* Chart Wrapper Container */}
          <div className="h-56 w-full relative flex items-center justify-center select-none bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-slate-200/50 dark:border-white/[0.02] overflow-hidden">
            
            {hasChartData ? (
              <div className="h-full w-full flex items-end justify-between px-6 pb-4 pt-10 font-sans relative">
                
                {/* Horizontal target guide lines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-200/30 dark:border-white/[0.02] border-dashed pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-200/30 dark:border-white/[0.02] border-dashed pointer-events-none"></div>
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-200/30 dark:border-white/[0.02] border-dashed pointer-events-none"></div>

                {/* Bars */}
                {chartItems.map((d, index) => (
                  <div key={index} className="flex flex-col items-center gap-2.5 group w-1/12 relative z-10">
                    <span className="opacity-0 group-hover:opacity-100 bg-slate-900 border border-slate-700 text-white rounded-lg text-[9px] px-2 py-1 absolute -top-10 transition-all z-20 font-mono font-bold shadow-md">
                      {d.delay} ms
                    </span>
                    
                    <div
                      className="w-full rounded-full bg-gradient-to-t from-blue-600 via-indigo-500 to-indigo-400 transition-all duration-500 group-hover:opacity-85 shadow-sm shadow-blue-500/10"
                      style={{ height: `${Math.min(150, Math.max(8, d.delay / 8))}px` }}
                    ></div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold truncate max-w-full text-center leading-none">{d.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* High-end design layout empty state with a subtle, dotted pulse animation */
              <div className="flex flex-col items-center justify-center p-8 space-y-3.5 z-10">
                <div className="relative flex items-center justify-center">
                  <div className="absolute h-10 w-10 bg-blue-500/5 rounded-full animate-ping duration-1000"></div>
                  <div className="p-3 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-2xl border border-blue-100/50 dark:border-transparent shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-center space-y-1 max-w-xs">
                  <h4 className="text-[12.5px] font-bold text-slate-805 dark:text-slate-200">Awaiting Query Transactions</h4>
                  <p className="text-[10.5px] text-slate-450 dark:text-slate-450 leading-relaxed">
                    Start messaging the assistant in the chat playground to record and track real-time pipeline latencies.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Info Box: Model Pricing Index list */}
        <div className="lg:col-span-1 p-5 bg-white border rounded-2xl shadow-xs border-slate-200/80 dark:bg-[#111218] dark:border-white/[0.04] text-left space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.03] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              Pricing Log Comparison Index
            </h3>
          </div>

          <div className="space-y-3 font-sans">
            
            {/* Active Model card */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/5 rounded-2xl border border-blue-100 dark:border-blue-500/20 space-y-2.5 transition-all shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-blue-800 dark:text-blue-400">Gemini 3.5 Flash</span>
                <span className="px-2 py-0.5 text-[8.5px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 rounded-md">ACTIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-blue-100/50 dark:border-blue-950/20">
                <div className="space-y-0.5">
                  <span className="text-slate-450 block font-medium">Input Pricing</span>
                  <strong className="text-slate-700 dark:text-slate-300 font-mono text-[10.5px]">$0.000075 <span className="font-sans text-[8.5px] text-slate-400 font-normal">/ 1K</span></strong>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-450 block font-medium">Output Pricing</span>
                  <strong className="text-slate-700 dark:text-slate-300 font-mono text-[10.5px]">$0.000300 <span className="font-sans text-[8.5px] text-slate-400 font-normal">/ 1K</span></strong>
                </div>
              </div>
            </div>

            {/* Standard Model card */}
            <div className="p-4 bg-slate-50/50 dark:bg-[#151720] rounded-2xl border border-slate-200 dark:border-[#222530] space-y-2.5 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">Gemini 1.5 Pro</span>
                <span className="px-2 py-0.5 text-[8.5px] font-bold bg-slate-100 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400 rounded-md border border-slate-200/50 dark:border-transparent">STANDARD</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-100/50 dark:border-white/[0.02]">
                <div className="space-y-0.5">
                  <span className="text-slate-450 block font-medium">Input Pricing</span>
                  <strong className="text-slate-700 dark:text-slate-300 font-mono text-[10.5px]">$0.001250 <span className="font-sans text-[8.5px] text-slate-400 font-normal">/ 1K</span></strong>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-450 block font-medium">Output Pricing</span>
                  <strong className="text-slate-700 dark:text-slate-300 font-mono text-[10.5px]">$0.003750 <span className="font-sans text-[8.5px] text-slate-400 font-normal">/ 1K</span></strong>
                </div>
              </div>
            </div>

            {/* Database Hosting card */}
            <div className="p-4 bg-slate-50/50 dark:bg-[#151720] rounded-2xl border border-slate-200 dark:border-[#222530] space-y-2.5 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200">Pinecone Vector Hosting</span>
                <span className="px-2 py-0.5 text-[8.5px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-md">VECTOR STORE</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-100/50 dark:border-white/[0.02]">
                <div className="space-y-0.5">
                  <span className="text-slate-450 block font-medium">Monthly Cost</span>
                  <strong className="text-slate-700 dark:text-slate-300 font-mono text-[10.5px]">$0.00 <span className="font-sans text-[8.5px] text-slate-400 font-normal">(Dev)</span></strong>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-450 block font-medium">Database Tier</span>
                  <strong className="text-slate-700 dark:text-slate-300 text-[10.5px]">Sandbox</strong>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

