import React, { useState } from 'react';
import { 
  Folder, 
  FileCode, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  BrainCircuit, 
  Activity, 
  Sparkles 
} from 'lucide-react';
import { microservicesData, FileNode } from '../data/microservicesData';

interface CodeExplorerProps {
  onAskGemini: (prompt: string, context: string) => void;
  geminiExplanation: string;
  isExplaining: boolean;
}

export default function CodeExplorer({ onAskGemini, geminiExplanation, isExplaining }: CodeExplorerProps) {
  const [selectedService, setSelectedService] = useState<string>('gateway-service');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  // Default select first file on render/change service
  React.useEffect(() => {
    const serviceRoot = microservicesData[selectedService];
    if (serviceRoot) {
      const firstFile = findFirstFile(serviceRoot);
      setSelectedFile(firstFile);
    }
  }, [selectedService]);

  const findFirstFile = (node: FileNode): FileNode | null => {
    if (node.type === 'file') return node;
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const found = findFirstFile(child);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplain = () => {
    if (!selectedFile || !selectedFile.content) return;
    const prompt = `Review this Java source file from our '${selectedService}' microservice. Explain its architecture, SOLID patterns, potential edge cases, and its purpose in a Spring Boot system:`;
    onAskGemini(prompt, selectedFile.content);
  };

  const renderTree = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedDirs[node.path] ?? depth < 2; // Expand top levels by default
    const isSelected = selectedFile?.path === node.path;

    if (node.type === 'file') {
      return (
        <button
          key={node.path}
          onClick={() => setSelectedFile(node)}
          className={`w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-md font-mono text-xs transition-colors ${
            isSelected 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold' 
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <FileCode className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
      );
    }

    return (
      <div key={node.path} className="space-y-0.5">
        <button
          onClick={() => toggleDirectory(node.path)}
          className="w-full text-left flex items-center gap-2 py-1.5 px-2 rounded-md text-slate-300 hover:bg-slate-800/40 font-medium text-xs"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-500" />
          )}
          <Folder className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>
        {isExpanded && node.children && (
          <div className="space-y-0.5">
            {node.children.map(child => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Overview Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            Java 21 Enterprise Code Sandbox
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse ready-to-compile production Java classes built with Spring Boot 3.x, Spring Security, Spring Cloud Gateway, and JPA.
          </p>
        </div>

        {/* Microservice selector chips */}
        <div className="flex flex-wrap gap-1.5 bg-zinc-900/40 p-1 rounded-lg border border-zinc-800">
          {Object.keys(microservicesData).map(svc => (
            <button
              key={svc}
              onClick={() => setSelectedService(svc)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-mono tracking-wider uppercase font-semibold transition-all ${
                selectedService === svc
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                  : 'text-zinc-450 hover:text-zinc-200'
              }`}
            >
              {svc.replace('-service', '')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side Tree Navigation (Col 4) */}
        <div className="lg:col-span-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col h-[650px] overflow-hidden">
          <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
              {selectedService.toUpperCase()} FILES
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 rounded">
              SPRING BOOT 3
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {microservicesData[selectedService] && renderTree(microservicesData[selectedService])}
          </div>
        </div>

        {/* Right Side Code View (Col 8) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col h-[650px] overflow-hidden">
            {/* Header bar */}
            <div className="p-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="text-xs font-mono text-zinc-400 ml-2 truncate max-w-xs sm:max-w-md">
                  {selectedFile ? selectedFile.path : 'No file selected'}
                </span>
              </div>
              
              {selectedFile?.content && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(selectedFile.content || '')}
                    className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 rounded text-zinc-300 transition"
                    title="Copy code block"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExplain}
                    disabled={isExplaining}
                    className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 border border-indigo-400/20 rounded text-zinc-100 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                    <span>{isExplaining ? 'AI Analyzing...' : 'Explain with Gemini'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Code viewport with real line numbers */}
            <div className="flex-1 overflow-auto p-4 bg-zinc-950 font-mono text-xs text-zinc-300 leading-relaxed">
              {selectedFile?.content ? (
                <div className="flex">
                  {/* Line Numbers */}
                  <div className="text-zinc-650 text-right pr-4 select-none border-r border-zinc-800 mr-4 font-mono text-xs leading-relaxed">
                    {selectedFile.content.split('\n').map((_, index) => (
                      <div key={index} className="h-5">{index + 1}</div>
                    ))}
                  </div>
                  {/* Code Block */}
                  <pre className="text-left font-mono text-xs text-zinc-300 leading-relaxed overflow-x-auto w-full">
                    <code>
                      {selectedFile.content.split('\n').map((line, idx) => (
                        <div key={idx} className="h-5 whitespace-pre">{line || ' '}</div>
                      ))}
                    </code>
                  </pre>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  Select a Java resource from the tree view to inspect.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Gemini Code Review Output */}
      {isExplaining || geminiExplanation ? (
        <div className="bg-zinc-950 rounded-xl border border-indigo-500/20 overflow-hidden shadow-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-semibold text-zinc-100 font-mono">Gemini AI Architect Code Explanation</h3>
            </div>
            <span className="px-2 py-0.5 bg-indigo-500/10 text-[9px] font-mono text-indigo-400 rounded">
              gemini-3.5-flash
            </span>
          </div>

          {isExplaining ? (
            <div className="flex items-center gap-3 py-6 justify-center">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-400 font-mono animate-pulse">Gemini is performing deep structural and design pattern analysis on the Java class...</p>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed space-y-2">
              <div className="whitespace-pre-wrap font-sans bg-zinc-900/60 p-4 rounded-lg border border-zinc-800/50">
                {geminiExplanation}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
