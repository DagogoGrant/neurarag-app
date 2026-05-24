/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Network, Database, Layers, Compass, HelpCircle } from 'lucide-react';
import { GroundingNode, GroundingEdge } from '../types';

interface KnowledgeGraphProps {
  graphData?: { nodes: GroundingNode[]; edges: GroundingEdge[] };
}

export default function KnowledgeGraph({ graphData }: KnowledgeGraphProps) {
  // Safe mock defaults if no conversational steps have loaded them
  const defaultNodes: GroundingNode[] = [];
  const defaultEdges: GroundingEdge[] = [];

  const nodes = graphData?.nodes || defaultNodes;
  const edges = graphData?.edges || defaultEdges;

  // Add coordinates if not pre-populated in dynamic RAG runs
  const renderedNodes = nodes.map((n, i) => {
    if (n.x !== undefined && n.y !== undefined) return n;
    // Distribute nicely across grid space
    const angles = [0, 60, 120, 180, 240, 300];
    const angle = (angles[i % angles.length] * Math.PI) / 180;
    const radius = 90 + (i % 2) * 20;
    return {
      ...n,
      x: 160 + radius * Math.cos(angle),
      y: 130 + radius * Math.sin(angle)
    };
  });

  const [hoveredNode, setHoveredNode] = useState<GroundingNode | null>(null);

  const getNodeColor = (type: GroundingNode['type']) => {
    switch (type) {
      case 'agent':
        return { fill: 'fill-indigo-500', stroke: 'stroke-indigo-300 dark:stroke-indigo-400/50', bg: 'bg-indigo-500' };
      case 'document':
        return { fill: 'fill-orange-500', stroke: 'stroke-orange-300 dark:stroke-orange-400/50', bg: 'bg-orange-500' };
      case 'vector':
        return { fill: 'fill-sky-500', stroke: 'stroke-sky-300 dark:stroke-sky-450/50', bg: 'bg-sky-500' };
      case 'entity':
        return { fill: 'fill-pink-500', stroke: 'stroke-pink-300 dark:stroke-pink-400/50', bg: 'bg-pink-500' };
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
        <span className="text-[9.5px] font-sans font-semibold text-indigo-600 bg-indigo-50/70 dark:bg-indigo-500/10 dark:text-sky-400 px-2.5 py-0.5 rounded-lg border border-indigo-100 dark:border-indigo-500/10">
          Inference RAG
        </span>
      </div>

      {/* Vector Visualization canvas */}
      <div className="relative flex-1 bg-[#faf8f5]/60 border border-slate-200/25 rounded-xl overflow-hidden dark:bg-[#08090d]/85 dark:border-white/[0.02] min-h-[220px]">
        <svg className="w-full h-full" viewBox="0 0 350 260" preserveAspectRatio="xMidYMid meet">
          
          {/* Connecting relational vectors */}
          {edges.map((edge, index) => {
            const srcNode = renderedNodes.find((n) => n.id === edge.source);
            const tgtNode = renderedNodes.find((n) => n.id === edge.target);

            if (!srcNode || !tgtNode) return null;

            return (
              <g key={`edge-${index}`}>
                <line
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="1.2"
                  strokeDasharray={edge.label === 'queries' ? '3 3' : undefined}
                />
                
                {/* Visual tiny flow ticks */}
                <circle
                  r="2"
                  className="fill-sky-400/60 dark:fill-sky-400/45 animate-[move_4s_linear_infinite]"
                  style={{
                    animationDelay: `${index * 0.5}s`
                  }}
                >
                  <animateMotion
                    dur="4s"
                    repeatCount="indefinite"
                    path={`M ${srcNode.x} ${srcNode.y} L ${tgtNode.x} ${tgtNode.y}`}
                  />
                </circle>
              </g>
            );
          })}

          {/* Render interactive vector vertices */}
          {renderedNodes.map((node) => {
            const colors = getNodeColor(node.type);
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Hover radar expand ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.val / 2 + 6}
                  className={`fill-none transition-all duration-300
                    ${isHovered ? 'stroke-sky-400/40 opacity-100 scale-125' : 'stroke-transparent opacity-0'}`}
                  strokeWidth="2.5"
                />

                {/* Base node circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.val / 2}
                  className={`${colors.fill} ${colors.stroke} transition-transform duration-300 group-hover:scale-110`}
                  strokeWidth="1.8"
                />

                {/* Direct vertex tiny labels */}
                <text
                  x={node.x}
                  y={(node.y || 0) + (node.val / 2) + 12}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400 font-mono text-[8px] font-medium pointer-events-none select-none"
                >
                  {node.label.length > 14 ? `${node.label.slice(0, 11)}...` : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover card overlays */}
        {hoveredNode && (
          <div className="absolute bottom-2 left-2 right-2 p-2 bg-gradient-to-r from-slate-50 to-white dark:from-[#09101d] dark:to-[#050a12] border border-slate-150 dark:border-sky-500/20 rounded shadow-lg text-[10px] font-mono leading-relaxed space-y-0.5 select-none z-30">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${getNodeColor(hoveredNode.type).bg}`}></span>
              <span className="font-bold text-slate-950 dark:text-slate-100">{hoveredNode.label}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Category: <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{hoveredNode.type}</span></span>
              <span>Weight: <span className="font-bold text-sky-400">{(hoveredNode.val * 3.1).toFixed(0)} df</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Guide explanation legend */}
      <div className="flex gap-4 mt-3 flex-wrap justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#131d2f]/40 pt-2 pb-0.5">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500"></span>Agent</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-orange-500"></span>Source</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-500"></span>Vector</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-pink-500"></span>Entity</span>
      </div>
    </div>
  );
}
