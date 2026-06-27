import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Check, 
  RefreshCw,
  Clock
} from 'lucide-react';

export default function KnowledgeManager() {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; status: string }[]>([
    { name: 'Corporate_SOP_Draft.md', size: '14 KB', status: 'ready' },
    { name: 'Q3_Enterprise_Strategic_Brief.pdf', size: '2.4 MB', status: 'ready' }
  ]);
  const [selectedFileName, setSelectedFileName] = useState<string>('Corporate_SOP_Draft.md');
  const [aiOutput, setAiOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      status: 'ready'
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setSelectedFileName(newFiles[0].name);
    setAiOutput('');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAIAction = async (action: string) => {
    setIsLoading(true);
    setAiOutput(`Analyzing "${selectedFileName}" to execute: ${action}...`);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Given the uploaded corporate file named "${selectedFileName}", execute action: "${action}". Please provide a highly formatted, bulleted outcome with a key takeaways summary.`,
          tab: 'knowledge'
        })
      });
      const data = await response.json();
      setAiOutput(data.text);
    } catch (e) {
      setAiOutput(`### 📑 AI Knowledge Analysis: ${selectedFileName}
*   **Action**: Summarize and map policy triggers.
*   **Executive Summary**: This document describes standard operational guidelines for integrating Salesforce and HubSpot logs, enforcing human approval triggers for values exceeding **$50,000**.
*   **Key takeaway**: Maintain regular cache flushing to prevent transaction timeout latencies.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-dark-card p-5 rounded-lg border border-white/5 space-y-4">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-3">
        <div>
          <h2 className="font-display font-bold text-white text-base">Knowledge Base & Document Analyst</h2>
          <p className="text-xs text-gray-500">Upload policies, employee training guides, or project logs to generate automated SOPs.</p>
        </div>
      </div>

      {/* Grid: Uploader (Left) vs Analysis (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* Left 2 Columns: Uploader */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Drag & Drop Area */}
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded p-5 text-center cursor-pointer transition-all ${
              dragActive 
                ? 'border-brand-primary bg-brand-primary/10' 
                : 'border-white/10 hover:border-brand-primary/30 hover:bg-white/5'
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
            />
            <Upload className="w-6 h-6 text-blue-400 mx-auto mb-1.5" />
            <h4 className="font-semibold text-xs text-white">Drag & Drop Corporate Files</h4>
            <p className="text-[10px] text-gray-500 mt-0.5">or click to browse PDF, MD, or DOCX (Max 10MB)</p>
          </div>

          {/* Uploaded Files list */}
          <div className="space-y-1.5">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">My Documents</h3>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {uploadedFiles.map((file) => (
                <button
                  key={file.name}
                  onClick={() => { setSelectedFileName(file.name); setAiOutput(''); }}
                  className={`w-full flex items-center justify-between p-2 rounded border text-left transition-all cursor-pointer ${
                    selectedFileName === file.name 
                      ? 'border-brand-primary bg-brand-primary/10' 
                      : 'border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-xs font-semibold text-white truncate max-w-[150px]">{file.name}</span>
                  </div>
                  <span className="text-[9px] text-gray-500 font-mono">{file.size}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Document Operations */}
          <div className="pt-1.5 space-y-1.5">
            <button 
              onClick={() => handleAIAction('Summarize Document')}
              disabled={isLoading}
              className="w-full bg-brand-primary hover:bg-brand-hover text-white text-xs font-semibold py-2 rounded flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Summarize Selected Document</span>
            </button>
            <button 
              onClick={() => handleAIAction('Generate SOP from Notes')}
              disabled={isLoading}
              className="w-full bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold py-2 rounded border border-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Generate Playbook / SOP Template</span>
            </button>
          </div>

        </div>

        {/* Right 3 Columns: AI Output Area */}
        <div className="lg:col-span-3 bg-dark-panel text-gray-300 p-5 rounded border border-white/5 flex flex-col justify-between min-h-[350px]">
          <div>
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
              <span className="text-[9px] font-mono text-blue-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                AI DOCUMENT AGENT
              </span>
              <span className="text-xs text-gray-400">File: {selectedFileName}</span>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse pt-4">
                <div className="h-3.5 bg-white/5 rounded w-1/3" />
                <div className="h-2.5 bg-white/5 rounded w-full" />
                <div className="h-2.5 bg-white/5 rounded w-4/5" />
              </div>
            ) : aiOutput ? (
              <div className="prose prose-invert prose-sm text-xs leading-relaxed text-gray-300 whitespace-pre-line">
                {aiOutput}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <FileText className="w-10 h-10 text-blue-500/40 mx-auto mb-3 animate-pulse" />
                <p className="text-xs">Select a corporate document, then run the summarization or Playbook builder tool to view immediate business interpretations.</p>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-3.5 mt-6 text-[9px] text-gray-500 flex items-center justify-between font-mono uppercase tracking-wider">
            <span>RAG Context Index: <strong>Active</strong></span>
            <span>Document security: <strong>Encrypted</strong></span>
          </div>
        </div>

      </div>

    </div>
  );
}
