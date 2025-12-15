

import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, StyleDNA, GameMode } from '../types';
import { NODE_TYPES_CONFIG } from '../constants';
import { Sparkles, Wand2, Download, RefreshCw, Layers, Lock, Unlock, Maximize2, Box, Eye, Code } from 'lucide-react';
import { generateDescription, generateGameAsset, generateDepthMap } from '../services/geminiService';
import { extractFIBOParams } from '../services/briaService';
import { useImageZoom } from '../contexts/ImageZoomContext';
import Model3DViewer from './Model3DViewer';

interface GenerationPanelProps {
  selectedNode: Node<NodeData> | null;
  styleDNA: StyleDNA;
  onUpdateNode: (id: string, data: Partial<NodeData>) => void;
  edges: Edge[];
  nodes: Node<NodeData>[];
  gameMode: GameMode;
}

const GenerationPanel: React.FC<GenerationPanelProps> = ({ selectedNode, styleDNA, onUpdateNode, edges, nodes, gameMode }) => {
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  // COMMENTED OUT: 3D generation state variables
  // const [isGenerating3D, setIsGenerating3D] = useState(false);
  // const [show3DViewer, setShow3DViewer] = useState(false);
  const [showJSONInspector, setShowJSONInspector] = useState(false);

  const { setZoomedImage } = useImageZoom();

  if (!selectedNode) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center">
        <Layers size={48} className="mb-4 opacity-20" />
        <p>Select a node to begin generation</p>
      </div>
    );
  }

  const config = NODE_TYPES_CONFIG[selectedNode.data.type] || NODE_TYPES_CONFIG.prop;
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

      const desc = await generateDescription(
        selectedNode.data.type, 
        selectedNode.data.subtype, 
        selectedNode.data.label, 
        context,
        selectedNode.data.description // Pass existing description to be enhanced
      );
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
      // Pass gameMode, type, and subtype to generation service
      const imageUrl = await generateGameAsset(
        selectedNode.data.description, 
        styleDNA, 
        selectedNode.data.type,
        selectedNode.data.subtype,
        parentContext, 
        gameMode,
        selectedNode.data.perspective // Pass specific perspective if set
      );
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

  // COMMENTED OUT: 3D generation feature temporarily disabled
  // const handleGenerate3D = async () => {
  //   if (isLocked || !selectedNode.data.image) return;
  //   setIsGenerating3D(true);
  //   try {
  //     const depthMap = await generateDepthMap(selectedNode.data.image);
  //     if (depthMap) {
  //       onUpdateNode(selectedNode.id, { depthMap });
  //       setShow3DViewer(true);
  //     } else {
  //       alert("Failed to generate 3D model data.");
  //     }
  //   } catch (e) {
  //     console.error(e);
  //     alert("Error generating 3D model.");
  //   } finally {
  //     setIsGenerating3D(false);
  //   }
  // };

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
        
        {/* Mode & Perspective Badge */}
        <div className="absolute bottom-2 right-2 z-10 flex gap-1">
          {selectedNode.data.perspective && (
             <span className="text-[10px] font-bold bg-black/30 px-2 py-0.5 rounded text-white/80">
              {selectedNode.data.perspective}
            </span>
          )}
          <span className="text-[10px] font-bold bg-black/30 px-2 py-0.5 rounded text-white/80">
            {gameMode}
          </span>
        </div>
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
            <div>Era: <span className="text-slate-200">{styleDNA.artStyle.era || 'Standard'}</span></div>
            <div>Texture: <span className="text-slate-200">{styleDNA.artStyle.texture || 'Default'}</span></div>
          </div>
        </div>

        {/* FIBO JSON Inspector */}
        <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/30 overflow-hidden">
          <button
            onClick={() => setShowJSONInspector(!showJSONInspector)}
            className="w-full px-3 py-2 flex items-center justify-between text-sm hover:bg-purple-500/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Code size={14} className="text-purple-400" />
              <span className="font-bold text-purple-300">FIBO JSON Parameters</span>
            </div>
            <span className="text-purple-400 text-xs">
              {showJSONInspector ? '▼' : '▶'}
            </span>
          </button>

          {showJSONInspector && (
            <div className="p-3 border-t border-purple-500/20">
              <p className="text-[10px] text-purple-400/60 mb-2">
                JSON-native parameters used for Bria FIBO generation:
              </p>
              <pre className="bg-slate-950/50 rounded p-2 text-[10px] text-slate-300 overflow-x-auto border border-slate-700/50 font-mono">
                {JSON.stringify(
                  extractFIBOParams(
                    styleDNA,
                    selectedNode.data.subtype || selectedNode.data.type,
                    gameMode
                  ),
                  null,
                  2
                )}
              </pre>
              <div className="mt-2 flex items-center gap-1 text-[9px] text-purple-400/40">
                <span>💡 These parameters ensure consistency across your game assets</span>
              </div>
            </div>
          )}
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
            <> <Sparkles /> Generate {gameMode} Concept </>
          )}
        </button>
        
        {/* View Full Action */}
        {selectedNode.data.image && !isGeneratingImage && (
           <button
             onClick={() => setZoomedImage(selectedNode.data.image!)}
             className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2"
           >
             <Maximize2 size={14} /> View Full
           </button>
        )}

        {/* COMMENTED OUT: 3D Generation / View Action */}
        {/* {selectedNode.data.image && !isGeneratingImage && (
           <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setZoomedImage(selectedNode.data.image!)}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <Maximize2 size={14} /> View Full
              </button>

              <button
                onClick={selectedNode.data.depthMap ? () => setShow3DViewer(true) : handleGenerate3D}
                disabled={isGenerating3D}
                className={`
                  py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-2 transition-colors
                  ${selectedNode.data.depthMap
                    ? 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-900/20'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-indigo-400'
                  }
                `}
              >
                {isGenerating3D ? (
                  <> <RefreshCw size={14} className="animate-spin" /> Processing... </>
                ) : selectedNode.data.depthMap ? (
                  <> <Box size={14} /> View 3D Model </>
                ) : (
                  <> <Box size={14} /> Convert to 3D </>
                )}
              </button>
           </div>
        )} */}

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

      {/* COMMENTED OUT: 3D Viewer Modal */}
      {/* {show3DViewer && selectedNode.data.image && selectedNode.data.depthMap && (
        <Model3DViewer
          imageUrl={selectedNode.data.image}
          depthMapUrl={selectedNode.data.depthMap}
          onClose={() => setShow3DViewer(false)}
        />
      )} */}
    </div>
  );
};

export default GenerationPanel;