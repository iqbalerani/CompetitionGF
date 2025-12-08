import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, StyleDNA } from '../types';
import { NODE_TYPES_CONFIG } from '../constants';
import { Sparkles, Wand2, Download, RefreshCw, Layers, Lock, Unlock, Maximize2 } from 'lucide-react';
import { generateDescription, generateGameAsset } from '../services/geminiService';
import { useImageZoom } from '../contexts/ImageZoomContext';

interface GenerationPanelProps {
  selectedNode: Node<NodeData> | null;
  styleDNA: StyleDNA;
  onUpdateNode: (id: string, data: Partial<NodeData>) => void;
  edges: Edge[];
  nodes: Node<NodeData>[];
}

const GenerationPanel: React.FC<GenerationPanelProps> = ({ selectedNode, styleDNA, onUpdateNode, edges, nodes }) => {
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { setZoomedImage } = useImageZoom();

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <Layers size={48} className="mb-4 opacity-20" />
        <p>Select a node to begin generation</p>
      </div>
    );
  }

  const config = NODE_TYPES_CONFIG[selectedNode.data.type];
  const isLocked = selectedNode.data.locked;

  const getParentContext = () => {
     const incomingEdges = edges.filter(e => e.target === selectedNode.id);
     const parentNodes = nodes.filter(n => incomingEdges.some(e => e.source === n.id));
     
     if (parentNodes.length === 0) return "";

     return parentNodes.map(n => {
       const type = n.data.subtype || n.data.type;
       return `${type} "${n.data.label}": ${n.data.description}`;
     }).join('\nContext: ');
  };

  const handleGenerateDescription = async () => {
    if (isLocked) return;
    setIsGeneratingDesc(true);
    try {
      const parentContext = getParentContext();
      const context = parentContext || "No specific parent context";

      const desc = await generateDescription(selectedNode.data.type, selectedNode.data.label, context);
      onUpdateNode(selectedNode.id, { description: desc });
    } finally {
      setIsGeneratingDesc(false);
    }
  };

  const handleGenerateImage = async () => {
    if (isLocked) return;
    setIsGeneratingImage(true);
    onUpdateNode(selectedNode.id, { status: 'generating' });
    try {
      const parentContext = getParentContext();
      const imageUrl = await generateGameAsset(selectedNode.data.description, styleDNA, parentContext);
      if (imageUrl) {
        onUpdateNode(selectedNode.id, { image: imageUrl, status: 'done' });
      } else {
        onUpdateNode(selectedNode.id, { status: 'draft' });
      }
    } catch (e) {
      console.error(e);
      onUpdateNode(selectedNode.id, { status: 'draft' });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const toggleLock = () => {
    onUpdateNode(selectedNode.id, { locked: !isLocked });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border-l border-slate-700">
      {/* Header */}
      <div className={`p-4 ${config.color} text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 p-2 opacity-30">
          <config.icon size={64} className="translate-x-4 -translate-y-4" />
        </div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <config.icon size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
          </div>
          <button 
            onClick={toggleLock} 
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isLocked ? "Unlock Node" : "Lock Node"}
          >
            {isLocked ? <Lock size={16} /> : <Unlock size={16} className="opacity-50" />}
          </button>
        </div>
        
        {/* Editable Title */}
        <input 
          type="text"
          value={selectedNode.data.label}
          onChange={(e) => !isLocked && onUpdateNode(selectedNode.id, { label: e.target.value })}
          className={`
            text-xl font-bold relative z-10 w-full bg-transparent border-b border-transparent 
            focus:border-white/50 focus:outline-none focus:bg-black/10 rounded-t px-1 -ml-1 transition-all
            placeholder-white/50
            ${isLocked ? 'cursor-not-allowed opacity-90' : 'cursor-text hover:bg-black/10'}
          `}
          readOnly={isLocked}
          placeholder="Node Name"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Description Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-300">Prompt / Description</label>
            <button 
              onClick={handleGenerateDescription}
              disabled={isGeneratingDesc || isLocked}
              className="text-xs flex items-center gap-1 text-amber-500 hover:text-amber-400 disabled:opacity-50"
            >
              <Wand2 size={12} />
              {isGeneratingDesc ? 'Thinking...' : 'AI Enhance'}
            </button>
          </div>
          <textarea
            className={`
              w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 
              focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[120px] transition-opacity
              ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            value={selectedNode.data.description}
            onChange={(e) => !isLocked && onUpdateNode(selectedNode.id, { description: e.target.value })}
            placeholder="Describe the visual appearance..."
            readOnly={isLocked}
          />
        </div>

        {/* Style Context */}
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Applied Style DNA</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div>Mode: <span className="text-slate-200">{styleDNA.lighting.style}</span></div>
            <div>Mood: <span className="text-slate-200">{styleDNA.colorPalette.mood}</span></div>
            <div>Camera: <span className="text-slate-200">{styleDNA.camera.angle}</span></div>
            <div>Render: <span className="text-slate-200">{styleDNA.artStyle.rendering}</span></div>
          </div>
        </div>

        {/* Generation Action */}
        <button
          onClick={handleGenerateImage}
          disabled={isGeneratingImage || !selectedNode.data.description || isLocked}
          className={`
            w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all
            ${isGeneratingImage || isLocked
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
              : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-900/20'
            }
          `}
        >
          {isLocked ? (
            <> <Lock size={18} /> Asset Locked </>
          ) : isGeneratingImage ? (
            <> <RefreshCw className="animate-spin" /> Generating... </>
          ) : (
            <> <Sparkles /> Generate Concept </>
          )}
        </button>

        {/* Preview Area */}
        {selectedNode.data.image && (
           <div className="space-y-2">
             <div className="flex justify-between items-center">
               <label className="text-sm font-semibold text-slate-300">Result</label>
               {isLocked && <span className="text-xs text-emerald-500 font-mono flex items-center gap-1"><Lock size={10} /> LOCKED</span>}
             </div>
             <div 
               className="rounded-lg overflow-hidden border border-slate-700 shadow-md group relative cursor-zoom-in"
               onClick={() => setZoomedImage(selectedNode.data.image!)}
             >
               <img src={selectedNode.data.image} alt="Generated" className="w-full h-auto hover:opacity-90 transition-opacity" />
               
               {/* Overlay actions */}
               <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  {/* Visual indicator only, click handled by container */}
                  <div className="p-2 bg-white/20 backdrop-blur rounded-full text-white">
                    <Maximize2 size={20} />
                  </div>
               </div>
               
               {/* Separate Download Button (stops propagation) */}
               <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <a 
                   href={selectedNode.data.image} 
                   download={`${selectedNode.data.label.replace(/\s+/g, '_')}.png`}
                   onClick={(e) => e.stopPropagation()}
                   className="p-2 bg-white rounded-full text-slate-900 hover:bg-slate-200 transition-colors shadow-lg block"
                   title="Download"
                 >
                   <Download size={16} />
                 </a>
               </div>
             </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default GenerationPanel;