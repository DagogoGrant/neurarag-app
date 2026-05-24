import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Layers,
  Database,
  ArrowRight,
  Shield,
  Zap,
  Globe,
  Terminal,
  ChevronRight,
  Cpu,
  Code
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLaunchApp = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-600/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#07080f]/80 backdrop-blur-xl border-b border-white/[0.04] py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-wide text-white">NeuraRAG</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex text-[13px] font-medium text-slate-300 hover:text-white transition-colors">
              Documentation
            </button>
            <button
              onClick={handleLaunchApp}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-slate-900 text-[13px] font-bold hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Launch App
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[11.5px] font-bold uppercase tracking-widest mb-8"
          >
            <SparklesIcon className="w-3.5 h-3.5" />
            Introducing NeuraRAG v1.0
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-white max-w-4xl leading-[1.1]"
          >
            The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">Multi-Agent</span> RAG Orchestrator.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl font-medium leading-relaxed"
          >
            Deploy fully autonomous agent swarms that instantly index your local documents, map semantic relationships, and synthesize ground-breaking insights with zero cloud lock-in.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4"
          >
            <button
              onClick={handleLaunchApp}
              className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-[15px] font-bold transition-all shadow-[0_0_30px_rgba(79,70,229,0.3)] hover:shadow-[0_0_40px_rgba(79,70,229,0.5)] active:scale-95"
            >
              Enter Workspace
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-[15px] font-bold transition-all active:scale-95">
              <Terminal className="w-4 h-4 text-slate-400" />
              View Documentation
            </button>
          </motion.div>

          {/* Hero Image Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="mt-24 w-full max-w-6xl relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080f] via-transparent to-transparent z-10 bottom-[-2px]"></div>
            <div className="rounded-3xl border border-white/[0.08] bg-[#121318] p-2 md:p-4 shadow-2xl overflow-hidden relative">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="aspect-[16/9] md:aspect-[21/9] bg-[#0c0d12] rounded-2xl border border-white/[0.04] flex items-center justify-center overflow-hidden relative">
                {/* Simulated App View */}
                <div className="absolute inset-0 flex">
                  {/* Sidebar Mock */}
                  <div className="w-48 border-r border-white/[0.04] p-4 hidden md:flex flex-col gap-3">
                    <div className="w-24 h-4 rounded bg-white/[0.05] mb-4"></div>
                    <div className="w-full h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20"></div>
                    <div className="w-full h-8 rounded-lg bg-white/[0.02]"></div>
                    <div className="w-full h-8 rounded-lg bg-white/[0.02]"></div>
                  </div>
                  {/* Main Mock */}
                  <div className="flex-1 flex flex-col p-6 gap-4 relative">
                    <div className="absolute right-0 top-0 w-64 h-full border-l border-white/[0.04] bg-[#0c0d12]/50 p-4 hidden lg:block">
                      <div className="w-32 h-3 rounded bg-white/[0.05] mb-6"></div>
                      <div className="w-full aspect-square rounded-xl bg-white/[0.02] border border-white/[0.04] mb-4 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full border border-indigo-500/30 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-sky-400"></div>
                        </div>
                      </div>
                      <div className="w-full h-16 rounded-xl bg-white/[0.02] border border-white/[0.04]"></div>
                    </div>
                    <div className="w-full max-w-md mx-auto mt-8 flex flex-col gap-4">
                      <div className="w-full h-24 rounded-2xl bg-white/[0.02] border border-white/[0.04] self-end rounded-tr-none"></div>
                      <div className="w-3/4 h-32 rounded-2xl bg-slate-800/50 border border-slate-700/50 self-start rounded-tl-none"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto border-t border-white/[0.04]">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">Everything you need to build intelligent AI.</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-[15px]">NeuraRAG combines dense vector similarity search with local LLM orchestration to give you total control over your enterprise data pipelines.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Multi-Agent Swarms</h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                Automatically deploy Planner, Retriever, Critic, and Synthesizer agents that collaborate to solve complex reasoning tasks in parallel.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Local Vector Ingestion</h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                Drag and drop PDFs or TXT files to instantly compute dense embeddings and index them locally with zero external API calls.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Privacy-First Architecture</h3>
              <p className="text-[14px] text-slate-400 leading-relaxed">
                Connect directly to local Ollama endpoints or your own private models to ensure sensitive enterprise data never leaves your network.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-600/5 border-y border-indigo-500/10"></div>
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Ready to upgrade your workflows?</h2>
            <p className="text-lg text-indigo-200/80 mb-10 max-w-2xl mx-auto">
              Join the elite developers building next-generation RAG systems with NeuraRAG's cutting-edge dashboard.
            </p>
            <button
              onClick={handleLaunchApp}
              className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-2xl bg-white text-slate-900 text-[16px] font-bold hover:bg-slate-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.15)]"
            >
              Start Building Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-12 relative z-10 bg-[#07080f]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="font-display font-bold text-lg text-white">NeuraRAG</span>
          </div>
          <p className="text-[13px] text-slate-500">
            © 2026 NeuraRAG Systems. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[13px] text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  );
}
