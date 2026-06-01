import { Handle, Position } from '@xyflow/react';
import { Zap, Cpu, Database, ShieldCheck } from 'lucide-react';

const icons = {
  Trigger: Zap,
  Agent: Cpu,
  Retrieval: Database,
  Validation: ShieldCheck,
};

export default function CustomNode({ data, selected }: any) {
  const IconComponent = icons[data.type as keyof typeof icons] || Cpu;
  
  return (
    <div className={`rounded-2xl border cursor-pointer select-none transition-all duration-200 shadow-sm text-left w-40 overflow-hidden bg-white dark:bg-[#111218] ${
      selected 
        ? 'border-blue-600 ring-4 ring-blue-500/10 dark:border-blue-500 dark:ring-transparent scale-[1.02]' 
        : 'border-slate-200/80 dark:border-white/[0.06] hover:border-slate-350 dark:hover:border-white/[0.12]'
    }`}>
      {/* Hide target handle for Trigger nodes */}
      {data.type !== 'Trigger' && (
        <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 !bg-slate-300 dark:!bg-slate-600 !border-2 !border-white dark:!border-[#111218]" />
      )}
      
      <div className={`px-3 py-2 border-b flex items-center justify-between font-sans ${data.colorClass}`}>
        <div className="flex items-center gap-1.5">
          <IconComponent className="w-3.5 h-3.5" />
          <span className="text-[8.5px] font-extrabold uppercase tracking-wider">{data.type}</span>
        </div>
        <span className="flex h-2 w-2 relative shrink-0">
          {data.status === 'Active' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${data.status === 'Active' ? 'bg-blue-500' : data.status === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
        </span>
      </div>

      <div className="p-3 space-y-1">
        <h4 className="text-[11.5px] font-bold text-slate-800 dark:text-slate-100 truncate leading-snug">{data.label}</h4>
        <p className="text-[9.5px] text-slate-450 dark:text-slate-400 truncate leading-relaxed">{data.desc}</p>
        <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400 dark:text-slate-500 border-t border-slate-100/50 dark:border-white/[0.02]">
          <span>Latency</span>
          <span className="font-semibold text-slate-600 dark:text-slate-400">{data.delay}</span>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 !bg-slate-300 dark:!bg-slate-600 !border-2 !border-white dark:!border-[#111218]" />
    </div>
  );
}
