import React, { memo } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from 'reactflow';
import { NODE_TYPES_CONFIG, SUBTYPE_ICONS } from '../constants';
import { NodeData } from '../types';
import { Loader2, Lock, Unlock, RefreshCw, Trash2, Image as ImageIcon, Maximize2 } from 'lucide-react';
import { useImageZoom } from '../contexts/ImageZoomContext';

const CustomNode = ({ id, data, selected }: NodeProps<NodeData>) => {
  const { deleteElements } = useReactFlow();
  const { setZoomedImage } = useImageZoom();
  const config = NODE_TYPES_CONFIG[data.type] || NODE_TYPES_CONFIG.prop;
  
  // Resolve Icon: Check subtype first, then fallback to config default
  let Icon = config.icon;
  if (data.subtype && SUBTYPE_ICONS[data.subtype]) {
    Icon = SUBTYPE_ICONS[data.subtype];
  }

  const isGenerating = data.status === 'generating';
  const isDone = data.status === 'done';
  const isLocked = data.locked;

  // Status Color Logic
  const getStatusColor = () => {
    if (isGenerating) return 'text-amber-400 border-amber-500/50 shadow-amber-500/20';
    if (isLocked) return 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/20';
    if (isDone) return 'text-sky-400 border-sky-500/50 shadow-sky-500/20';
    return 'text-slate-400 border-slate-700 shadow-none';
  };

  const statusStyles = getStatusColor();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLocked) {
      deleteElements({ nodes: [{ id }] });
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    // Removed e.stopPropagation() to allow node selection to bubble up to React Flow
    // This ensures the side panel opens even when clicking the node body
    if (data.image) {
      setZoomedImage(data.image);
    }
  };

  return (
    <div className="group relative">
      {/* Selection Glow / Ring */}
      <div 
        className={`
          absolute -inset-0.5 rounded-xl blur opacity-0 transition-opacity duration-500
          ${selected ? 'opacity-75 bg-gradient-to-r from-amber-500 to-purple-600' : ''}
        `} 
      />

      {/* Main Node Chassis */}
      <div
        className={`
          relative ${config.width} flex flex-col
          bg-slate-900/90 backdrop-blur-md 
          rounded-xl border shadow-2xl transition-all duration-300
          ${selected ? 'border-amber-500/80 ring-1 ring-amber-500/20' : 'border-slate-700/80 hover:border-slate-500'}
        `}
      >
        {/* Header: Tech Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800 bg-slate-950/30 rounded-t-xl">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md bg-opacity-20 ${config.color.replace('bg-', 'bg-opacity-20 bg-')}`}>
              <Icon size={12} className={config.color.replace('bg-', 'text-')} />
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              {config.label}
            </span>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5">
            {isLocked && <Lock size={10} className="text-emerald-500" />}
            <div className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-amber-500 animate-pulse' : isDone ? 'bg-sky-500' : 'bg-slate-600'}`} />
          </div>
        </div>

        {/* Content Area */}
        <div className="p-2 space-y-2">
          
          {/* Image Container with Adaptive Ratio */}
          <div 
            className={`
              relative w-full ${config.aspectRatio} 
              bg-slate-950 rounded-lg border border-slate-800 overflow-hidden 
              group-hover:border-slate-600 transition-colors
              ${data.image ? 'cursor-zoom-in' : ''}
            `}
            onClick={handleImageClick}
          >
            
            {/* Image State Handling */}
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-amber-500 bg-slate-900/50">
                <Loader2 className="animate-spin" size={24} />
                <span className="text-[10px] font-mono uppercase tracking-widest animate-pulse">Rendering</span>
              </div>
            ) : data.image ? (
              <>
                <img src={data.image} alt={data.label} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                {/* Zoom Hint */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded backdrop-blur">
                  <Maximize2 size={12} className="text-white/80" />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <ImageIcon size={32} strokeWidth={1} className="opacity-50" />
                <span className="text-[10px] mt-2 font-mono opacity-50">NO_DATA</span>
              </div>
            )}

            {/* Floating Title (Overlaid on bottom of image area) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
              <h3 className="font-bold text-slate-100 text-sm leading-tight drop-shadow-md truncate">
                {data.label}
              </h3>
            </div>
          </div>

          {/* Mini-Description / Metadata */}
          {data.description && (
            <div className="px-1">
              <p className="text-[10px] text-slate-400 line-clamp-2 font-mono leading-relaxed opacity-80">
                {">"} {data.description}
              </p>
            </div>
          )}
        </div>

        {/* Hover Quick Actions (HUD) */}
        {/* We use left-full and padding-left to ensure the hover area is continuous from the node to the buttons */}
        <div className="absolute left-full top-2 pl-4 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-10px] group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto z-50">
           <button className="w-8 h-8 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center shadow-lg transition-colors" title="Generate">
             <RefreshCw size={14} />
           </button>
           <button className="w-8 h-8 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 flex items-center justify-center shadow-lg transition-colors" title="Lock">
             {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
           </button>
           <button 
             onClick={handleDelete}
             className={`
               w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg transition-colors
               ${isLocked 
                 ? 'text-slate-600 cursor-not-allowed' 
                 : 'text-slate-400 hover:text-red-400 hover:bg-slate-700 hover:border-red-900/30'
               }
             `}
             title={isLocked ? "Cannot delete locked node" : "Delete Node"}
             disabled={isLocked}
           >
             <Trash2 size={14} />
           </button>
        </div>

        {/* Handles */}
        <Handle 
          type="target" 
          position={Position.Top} 
          className="!bg-slate-400 !w-3 !h-1 !rounded-[1px] !border-none hover:!bg-amber-500 transition-colors" 
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          className="!bg-slate-400 !w-3 !h-1 !rounded-[1px] !border-none hover:!bg-amber-500 transition-colors" 
        />
      </div>
    </div>
  );
};

export default memo(CustomNode);