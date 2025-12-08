
import React, { useState, useEffect } from 'react';
import { X, Gamepad2, Monitor, Smartphone, Globe, Box, Layers, Target, Wand2 } from 'lucide-react';
import { BlueprintParams, GameMode } from '../types';

interface BlueprintWizardProps {
  onGenerate: (params: BlueprintParams) => void;
  onClose: () => void;
  gameMode: GameMode;
}

const BlueprintWizard: React.FC<BlueprintWizardProps> = ({ onGenerate, onClose, gameMode }) => {
  const [params, setParams] = useState<BlueprintParams>({
    prompt: '',
    platform: 'PC',
    perspective: gameMode, // Default to current global mode
    genre: '',
    artStyle: '',
    mechanics: '',
    audience: '',
    gameMode: gameMode 
  });

  // Keep params in sync if needed, though initial state usually sufficient
  useEffect(() => {
    setParams(p => ({ ...p, perspective: gameMode, gameMode: gameMode }));
  }, [gameMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(params);
  };

  const platforms = ['PC', 'Console', 'Mobile', 'Web', 'VR/AR'];
  const perspectives = ['3D', '2D', 'Isometric', 'VR', 'Text-Based'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-[700px] max-w-full max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Blueprint Engine</h2>
              <p className="text-xs text-slate-400 uppercase tracking-wider">{gameMode} Mode Active</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Core Concept */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
              <Target size={14} /> Core Concept
            </label>
            <textarea 
              className="w-full h-24 bg-slate-800 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 resize-none"
              placeholder={`Describe your ${gameMode} game idea...`}
              value={params.prompt}
              onChange={(e) => setParams({...params, prompt: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Platform */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                <Monitor size={14} /> Platform
              </label>
              <div className="flex flex-wrap gap-2">
                {platforms.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setParams({...params, platform: p})}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                      ${params.platform === p 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                      }
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Perspective */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                <Box size={14} /> Perspective
              </label>
              <div className="flex flex-wrap gap-2">
                {perspectives.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setParams({...params, perspective: p as any})}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
                      ${params.perspective === p 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                      }
                    `}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Genre & Style */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                <Gamepad2 size={14} /> Genre
              </label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 text-sm"
                placeholder="e.g. Action RPG, Metroidvania, FPS"
                value={params.genre}
                onChange={(e) => setParams({...params, genre: e.target.value})}
              />
            </div>
            <div className="space-y-2">
               <label className="text-sm font-semibold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                <Layers size={14} /> Art Style
              </label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 text-sm"
                placeholder={gameMode === '2D' ? "e.g. Pixel Art, Hand-Drawn" : "e.g. Realistic, Low Poly, Cel Shaded"}
                value={params.artStyle}
                onChange={(e) => setParams({...params, artStyle: e.target.value})}
              />
            </div>
          </div>

          {/* Mechanics & Audience */}
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                <Box size={14} /> Key Mechanics
              </label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 text-sm"
                placeholder="e.g. Wall-running, Crafting, Permadeath"
                value={params.mechanics}
                onChange={(e) => setParams({...params, mechanics: e.target.value})}
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-semibold text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                <Globe size={14} /> Target Audience
              </label>
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600 text-sm"
                placeholder="e.g. Hardcore Gamers, Casual Mobile, Kids"
                value={params.audience}
                onChange={(e) => setParams({...params, audience: e.target.value})}
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 font-bold hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!params.prompt}
            className={`
              px-6 py-2 rounded-lg font-bold text-white shadow-lg flex items-center gap-2
              ${!params.prompt 
                ? 'bg-slate-700 cursor-not-allowed text-slate-500' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:scale-105 transition-all shadow-indigo-900/30'
              }
            `}
          >
            <Wand2 size={16} />
            Generate {gameMode} Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlueprintWizard;
