import React, { useEffect, useRef } from 'react';
import { X, RotateCcw, Maximize2, Terminal } from 'lucide-react';

interface GamePlayerModalProps {
  gameCode: string;
  onClose: () => void;
}

const GamePlayerModal: React.FC<GamePlayerModalProps> = ({ gameCode, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = gameCode;
    }
  }, [gameCode]);

  const handleRestart = () => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = gameCode;
      iframeRef.current.focus();
    }
  };

  const handleIframeLoad = () => {
    // Focus the iframe so keyboard events are captured immediately
    iframeRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full h-full max-w-[95vw] max-h-[90vh] bg-slate-950 rounded-xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-800 ring-1 ring-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-green-500/20 rounded-md border border-green-500/30">
               <Terminal size={16} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-slate-100 font-bold text-sm leading-none">Playable Prototype</h2>
              <span className="text-[10px] text-green-400 font-mono flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                LIVE BUILD
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button 
               onClick={handleRestart} 
               className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md text-xs font-bold transition-colors border border-slate-700"
             >
               <RotateCcw size={14} /> Restart
             </button>
             <div className="h-6 w-px bg-slate-800 mx-1" />
             <button 
               onClick={onClose} 
               className="p-2 text-slate-400 hover:text-white hover:bg-red-500/10 hover:border-red-500/20 border border-transparent rounded-md transition-all"
             >
               <X size={18} />
             </button>
          </div>
        </div>

        {/* Game Container */}
        <div className="flex-1 bg-black relative">
          <iframe 
            ref={iframeRef}
            title="Generated Game"
            className="w-full h-full border-0 block"
            sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            onLoad={handleIframeLoad}
          />
        </div>
      </div>
    </div>
  );
};

export default GamePlayerModal;