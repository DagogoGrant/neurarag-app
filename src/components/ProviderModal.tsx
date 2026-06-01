import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { CustomProvider } from '../types';

interface ProviderModalProps {
  onClose: () => void;
  onSave: (provider: CustomProvider) => void;
}

const PROVIDER_URLS: Record<string, string> = {
  'Custom OpenAI Compatible': '',
  'OpenAI': 'https://api.openai.com/v1',
  'Groq': 'https://api.groq.com/openai/v1',
  'Together AI': 'https://api.together.xyz/v1',
  'OpenRouter': 'https://openrouter.ai/api/v1',
  'Mistral': 'https://api.mistral.ai/v1',
  'Perplexity': 'https://api.perplexity.ai'
};

export default function ProviderModal({ onClose, onSave }: ProviderModalProps) {
  const [type, setType] = useState('Custom OpenAI Compatible');
  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [supportsImages, setSupportsImages] = useState(false);
  const [contextWindow, setContextWindow] = useState(128000);
  const [temperature, setTemperature] = useState(0.2);

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  const handleTest = async () => {
    setTestStatus('testing');
    setTestError('');
    try {
      const res = await fetch(`/api/proxy/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiKey })
      });
      
      if (res.status === 504 || res.status === 502 || res.status === 404) {
        throw new Error("Backend offline. Please start the Python backend (e.g. 'vercel dev') to bypass CORS.");
      }

      const resText = await res.text();
      let resData;
      try {
        resData = JSON.parse(resText);
      } catch (e) {
        throw new Error("Backend offline or returned invalid response. Please start the Python backend.");
      }

      if (!res.ok || resData.status === 'error') {
        throw new Error(resData.message || `Status ${res.status}: ${res.statusText}`);
      }
      
      // Our proxy returns the response inside a 'data' field.
      // A standard OpenAI /models response puts the models in a 'data' array.
      // So we access resData.data.data
      if (resData && resData.data && resData.data.data && Array.isArray(resData.data.data)) {
        const models = resData.data.data.map((m: any) => m.id);
        setAvailableModels(models);
        if (models.length > 0 && !model) {
          setModel(models[0]);
        }
      }

      setTestStatus('success');
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || 'Failed to connect');
    }
  };

  const handleSave = () => {
    if (!name || !baseUrl || !model) return;
    
    const provider: CustomProvider = {
      id: `custom-${Date.now()}`,
      type,
      name,
      baseUrl,
      apiKey,
      model,
      supportsImages,
      contextWindow,
      temperature
    };
    onSave(provider);
  };

  const isFormValid = name && baseUrl && model;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl dark:bg-[#121319] border border-slate-200 dark:border-[#242631] flex flex-col font-sans relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-white/[0.04]">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Configure New Provider</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add a new LLM provider configuration with API key and model settings.</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Provider Type *</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setType(newType);
                  if (PROVIDER_URLS[newType] !== undefined) {
                    setBaseUrl(PROVIDER_URLS[newType]);
                  }
                }}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200"
              >
                {Object.keys(PROVIDER_URLS).map(provider => (
                  <option key={provider} value={provider}>{provider}</option>
                ))}
                <option value="Anthropic (Coming Soon)" disabled>Anthropic (Coming Soon)</option>
                <option value="Google Vertex (Coming Soon)" disabled>Google Vertex (Coming Soon)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Provider Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Work OpenAI"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Base URL *</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.openai.com/v1"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key (optional)"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              Your API key is encrypted and stored locally. 
              <a href="#" className="text-blue-500 hover:text-blue-600 flex items-center gap-1 ml-1">
                <ExternalLink className="w-3 h-3" /> OpenAI setup guide
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Model *</label>
            {availableModels.length > 0 ? (
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200"
              >
                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., gpt-4o, my-custom-model"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200"
              />
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-white/[0.04] pt-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Model Configuration</h3>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={supportsImages}
                onChange={(e) => setSupportsImages(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Supports Images</span>
            </label>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Context Window Size</label>
                <input
                  type="number"
                  value={contextWindow}
                  onChange={(e) => setContextWindow(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Auto-filled based on model</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Temperature (0-2)</label>
                <input
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-slate-200"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">Controls response randomness</p>
              </div>
            </div>
          </div>
          
          {/* Test Status Messages */}
          {testStatus === 'testing' && <p className="text-sm text-blue-500">Testing connection...</p>}
          {testStatus === 'success' && <p className="text-sm text-emerald-500 font-semibold">Connection successful!</p>}
          {testStatus === 'error' && <p className="text-sm text-red-500 font-semibold">Connection failed: {testError}</p>}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-white/[0.04] bg-slate-50 dark:bg-[#15161c]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a1b23] border border-slate-200 dark:border-white/[0.1] rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTest}
            disabled={!baseUrl || testStatus === 'testing'}
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a1b23] border border-slate-200 dark:border-white/[0.1] rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-blue-500/20"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}
