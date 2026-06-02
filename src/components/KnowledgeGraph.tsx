import { useState, useMemo, useEffect, useRef } from 'react';
import { Network, Database, Layers, Compass, HelpCircle } from 'lucide-react';
import { GroundingNode, GroundingEdge } from '../types';
import ForceGraph3D from 'react-force-graph-3d';

interface KnowledgeGraphProps {
  graphData?: { nodes: GroundingNode[]; edges: GroundingEdge[] };
}

export default function KnowledgeGraph({ graphData }: KnowledgeGraphProps) {
  const fgRef = useRef<any>();
  const [dimensions, setDimensions] = useState({ width: 350, height: 260 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Resize observer to make the 3D canvas responsive
  useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      }
    });

    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  // Generate a premium dynamic idle constellation if no data is provided
  const gData = useMemo(() => {
    if (graphData && graphData.nodes.length > 0) return graphData;

    const N = 40;
    const types: GroundingNode['type'][] = ['agent', 'document', 'vector', 'entity'];
    const nodes: GroundingNode[] = Array.from({ length: N }).map((_, i) => ({
      id: `idle_${i}`,
      label: `Semantic Tensor ${i}`,
      type: types[Math.floor(Math.random() * types.length)],
      val: Math.random() * 4 + 2
    }));

    const edges: GroundingEdge[] = [];
    for (let i = 0; i < N * 1.5; i++) {
      edges.push({
        source: `idle_${Math.floor(Math.random() * N)}`,
        target: `idle_${Math.floor(Math.random() * N)}`,
        label: 'similarity link'
      });
    }

    return { nodes, edges };
  }, [graphData]);

  const getNodeColor = (type: GroundingNode['type']) => {
    switch (type) {
      case 'agent': return '#6366f1'; // indigo-500
      case 'document': return '#f97316'; // orange-500
      case 'vector': return '#0ea5e9'; // sky-500
      case 'entity': return '#ec4899'; // pink-500
      default: return '#94a3b8';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/40 border border-slate-200/40 rounded-2xl overflow-hidden p-4 dark:bg-[#13151f]/40 dark:border-white/[0.04] backdrop-blur-md">
      
      {/* Title block */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 animate-pulse" />
          <span className="text-[10.5px] font-display font-medium uppercase tracking-wider text-slate-550 dark:text-slate-450">
            Semantic Embeddings Graph
          </span>
        </div>
        <span className="text-[9.5px] font-sans font-semibold text-indigo-600 bg-indigo-50/70 dark:bg-indigo-500/10 dark:text-sky-400 px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-500/10 shadow-xs">
          Interactive 3D View
        </span>
      </div>

      {/* Vector Visualization canvas */}
      <div 
        ref={containerRef}
        className="relative flex-1 bg-[#faf8f5]/60 border border-slate-200/25 rounded-xl overflow-hidden dark:bg-[#08090d]/85 dark:border-white/[0.02] min-h-[220px] cursor-grab active:cursor-grabbing shadow-inner"
      >
        <ForceGraph3D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={gData}
          nodeLabel={(node: any) => `<div style="background: rgba(10, 15, 30, 0.9); border: 1px solid rgba(255,255,255,0.1); padding: 6px 10px; border-radius: 6px; color: white; font-family: monospace; font-size: 11px;">
            <span style="font-weight: bold; color: ${getNodeColor(node.type)}">${node.type.toUpperCase()}</span><br/>
            ${node.label}<br/>
            <span style="color: #94a3b8; font-size: 9px;">Weight: ${(node.val * 3.1).toFixed(1)} df</span>
          </div>`}
          nodeColor={(node: any) => getNodeColor(node.type)}
          nodeVal={(node: any) => node.val || 2}
          linkColor={() => 'rgba(148, 163, 184, 0.25)'}
          linkWidth={1}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1.5}
          linkDirectionalParticleSpeed={0.005}
          backgroundColor="rgba(0,0,0,0)" // Transparent to show parent div background
          showNavInfo={false}
        />
        
        {/* Overlay instruction */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 text-[9px] font-mono font-medium text-slate-400 dark:text-slate-500 pointer-events-none opacity-60">
          <Compass className="w-3 h-3" />
          Drag to spin
        </div>
      </div>

      {/* Guide explanation legend */}
      <div className="flex gap-4 mt-3 flex-wrap justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#131d2f]/40 pt-2 pb-0.5">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>Agent</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span>Source</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></span>Vector</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]"></span>Entity</span>
      </div>
    </div>
  );
}
