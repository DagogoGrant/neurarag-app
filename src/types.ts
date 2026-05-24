/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Theme = 'light' | 'dark';

export interface Source {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'web' | 'api';
  url: string;
  confidence: number; // 0 to 1.00
  snippet: string;
}

export interface AgentState {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: number; // 0 to 100
  latency: number; // milliseconds
  reasoning: string;
}

export interface GroundingNode {
  id: string;
  label: string;
  type: 'entity' | 'document' | 'vector' | 'agent';
  val: number; // weight size
  x?: number;
  y?: number;
}

export interface GroundingEdge {
  source: string;
  target: string;
  label: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  agentId: string;
  title: string;
  detail: string;
  status: 'info' | 'success' | 'warn' | 'error';
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  // Agent run details for this specific interaction
  agents?: Record<string, AgentState>;
  sources?: Source[];
  timeline?: TimelineEvent[];
  graph?: { nodes: GroundingNode[]; edges: GroundingEdge[] };
  // Expandable reasoning block
  thought?: string;
  tokensUsed?: { prompt: number; completion: number; cost: number };
  attachedFiles?: { name: string; mimeType: string }[];
}

export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  activeModel: string;
}

export interface WorkspaceState {
  theme: Theme;
  activeTab: 'workspace' | 'knowledge' | 'workflows' | 'analytics' | 'settings';
  conversations: Conversation[];
  activeConversationId: string;
  sidebarCollapsed: boolean;
  selectedModel: string;
  memoryTags: string[];
}
