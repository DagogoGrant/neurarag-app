/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  PlusSquare,
  FileText,
  Activity,
  Layers,
  Settings,
  Sliders,
  Sparkles,
  Info,
  Loader2,
  CheckCircle,
  FileCode,
  Globe2,
  Trash2,
  HardDrive
} from 'lucide-react';

interface IngestedDocument {
  id: string;
  name: string;
  size: string;
  status: string;
  chunksCount: number;
  addedAt: string;
}

export default function KnowledgeTab() {
  const [docs, setDocs] = useState<IngestedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Controls for chunk configurations
  const [chunkSize, setChunkSize] = useState(512);
  const [overlapVal, setOverlapVal] = useState(128);
  const [embeddingModel, setEmbeddingModel] = useState('gemini-embedding-2-preview');

  // Load from backend
  const fetchDocs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/kb/documents");
      const data = await res.json();
      setDocs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const uploadFile = (file: File) => {
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();

    reader.onload = async (event) => {
      let fileData = event.target?.result as string;
      if (isPdf) {
        fileData = fileData.split(',')[1];
      }

      // TRUNCATE: Prevent Vercel 4.5MB Free Tier Serverless limit crashes
      if (fileData.length > 1000000) {
        fileData = fileData.substring(0, 1000000);
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/kb/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            text: fileData,
            isBinary: isPdf,
            chunkSize: chunkSize,
            overlap: overlapVal
          })
        });
        const data = await res.json();
        if (data.success) {
          setDocs(prev => [data.document, ...prev]);
        } else {
          alert(`Upload failed: ${data.error || 'Unknown error'}`);
        }
      } catch (err: any) {
        console.error(err);
        alert(`Upload request error: ${err.message || err}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (isPdf) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleRealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDeleteDoc = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/kb/documents/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        setDocs(prev => prev.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = docs.filter(
    d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full p-8 space-y-8 overflow-y-auto bg-slate-50/30 dark:bg-transparent font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 dark:border-white/[0.06] pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
            <div className="p-2 bg-indigo-100/50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            Knowledge Base Assets
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Upload custom context manuals, configure semantic partitions, and deploy high-density neural vectors.
          </p>
        </div>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Custom Configurations and Upload Form */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* Document Ingestion Card */}
          <div className="p-6 rounded-2xl border bg-white border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.08] shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
              <PlusSquare className="w-4.5 h-4.5 text-indigo-500" />
              Ingest Document
            </h3>

            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-slate-200 hover:border-indigo-400 dark:border-white/[0.1] dark:hover:border-indigo-400/50 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 bg-slate-50/50 dark:bg-black/20"
                onClick={() => document.getElementById('slide-file-input')?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  id="slide-file-input"
                  type="file"
                  accept=".txt,.md,.json,.csv,.html,.js,.ts,.pdf"
                  className="hidden"
                  onChange={handleRealFileUpload}
                />
                <HardDrive className="w-8 h-8 text-indigo-400 dark:text-indigo-500 mx-auto mb-3" />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 block">
                  Select or Drag & Drop File
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mt-2">
                  Supports .txt, .md, .csv, .json, .pdf (Max 10MB)
                </span>
              </div>
            </div>
          </div>

          {/* RAG Configuration Panel */}
          <div className="p-6 rounded-2xl border bg-white border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.08] shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-6">
              <Sliders className="w-4.5 h-4.5 text-indigo-500" />
              Partition Config
            </h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Chunk Max Tokens</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{chunkSize} tokens</span>
                </div>
                <input
                  type="range"
                  min="128"
                  max="2048"
                  step="128"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold">Semantic Overlap</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{overlapVal} tokens</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="512"
                  step="16"
                  value={overlapVal}
                  onChange={(e) => setOverlapVal(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">Embedding Model</label>
                <select
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="w-full text-sm py-2.5 px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all
                    bg-slate-50 border-slate-200 text-slate-800 focus:bg-white dark:bg-black/20 dark:border-white/[0.1] dark:text-slate-200 focus:dark:bg-black/40"
                >
                  <option value="gemini-embedding-2-preview">gemini-embedding-2-preview (1536d)</option>
                  <option value="text-embedding-004">text-embedding-004 (768d)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Documents List */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="p-6 rounded-2xl border bg-white border-slate-200/80 dark:bg-white/[0.02] dark:border-white/[0.08] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-indigo-500" />
                Active Knowledge Indexes
              </h3>

              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search index metadata..."
                  className="w-full text-sm font-medium pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all
                    bg-slate-50 border-slate-200 text-slate-800 focus:bg-white placeholder-slate-400 dark:bg-black/20 dark:border-white/[0.1] dark:text-slate-200 focus:dark:bg-black/40"
                />
              </div>
            </div>

            {/* Docs Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-transparent">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08]">
                    <th className="py-3 px-5 font-semibold">Asset Title</th>
                    <th className="py-3 px-4 font-semibold">Size</th>
                    <th className="py-3 px-4 font-semibold">Vectors</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Added</th>
                    <th className="py-3 px-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] text-slate-700 dark:text-slate-300">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                        <span className="text-sm font-medium text-slate-500 mt-4 block">Synchronizing indexes...</span>
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-slate-400">
                        <div className="flex justify-center mb-3">
                          <Database className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        No documents found matching the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-5 font-medium text-slate-900 dark:text-slate-100 flex items-center gap-3">
                          {doc.name.endsWith('.pdf') ? (
                            <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg dark:bg-rose-500/10 dark:text-rose-400">
                              <FileText className="w-4 h-4" />
                            </div>
                          ) : doc.name.endsWith('.csv') || doc.name.endsWith('.xlsx') ? (
                            <div className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg dark:bg-emerald-500/10 dark:text-emerald-400">
                              <Activity className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg dark:bg-blue-500/10 dark:text-blue-400">
                              <FileCode className="w-4 h-4" />
                            </div>
                          )}
                          {doc.name}
                        </td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{doc.size}</td>
                        <td className="py-4 px-4 font-semibold text-indigo-600 dark:text-indigo-400">
                          {doc.chunksCount === 0 ? (
                            <span className="text-amber-500">Processing...</span>
                          ) : (
                            `${doc.chunksCount}`
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold
                            ${doc.status === 'Indexed'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>
                            {doc.status === 'Indexed' && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">{doc.addedAt}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Delete from index"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
