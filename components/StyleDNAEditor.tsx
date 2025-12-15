

import React, { useState } from 'react';
import { StyleDNA } from '../types';
import { X, Sliders, Wand2, Loader2 } from 'lucide-react';
import { generateAdaptiveStyleDNA } from '../services/geminiService';

interface StyleDNAEditorProps {
  styleDNA: StyleDNA;
  onChange: (newStyle: StyleDNA) => void;
  onClose: () => void;
}

const StyleDNAEditor: React.FC<StyleDNAEditorProps> = ({ styleDNA, onChange, onClose }) => {
  const [magicPrompt, setMagicPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const updateLighting = (key: keyof StyleDNA['lighting'], value: any) => {
    onChange({
      ...styleDNA,
      lighting: { ...styleDNA.lighting, [key]: value },
    });
  };

  const updateCamera = (key: keyof StyleDNA['camera'], value: any) => {
    onChange({
      ...styleDNA,
      camera: { ...styleDNA.camera, [key]: value },
    });
  };

  const updateArtStyle = (key: keyof StyleDNA['artStyle'], value: any) => {
    onChange({
        ...styleDNA,
        artStyle: { ...styleDNA.artStyle, [key]: value }
    });
  };

  const updateFIBO = (key: string, value: any) => {
    onChange({
      ...styleDNA,
      fibo: { ...styleDNA.fibo, [key]: value }
    });
  };

  const updateColor = (type: 'primary' | 'accent', index: number, newColor: string) => {
    const newColors = [...styleDNA.colorPalette[type]];
    newColors[index] = newColor;
    onChange({
      ...styleDNA,
      colorPalette: { ...styleDNA.colorPalette, [type]: newColors }
    });
  };

  const handleMagicGenerate = async () => {
    if (!magicPrompt) return;
    setIsGenerating(true);
    try {
        // We pass the prompt as a string to the adaptive generator
        const newDNA = await generateAdaptiveStyleDNA(magicPrompt);
        if (newDNA) {
            onChange(newDNA);
        }
    } catch (e) {
        console.error("Failed to generate DNA", e);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="absolute top-4 left-4 z-50 w-96 bg-slate-900/95 backdrop-blur shadow-2xl rounded-xl border border-slate-700 flex flex-col max-h-[90vh]">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2 text-amber-500">
          <Sliders size={20} />
          <h2 className="font-bold text-lg">Style DNA</h2>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      <div className="overflow-y-auto p-4 space-y-6">
        
        {/* Magic Generator */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-3 rounded-lg border border-indigo-500/30">
            <h3 className="text-xs font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2">
                <Wand2 size={12} /> Auto-Tune Style
            </h3>
            <div className="flex gap-2">
                <input 
                  type="text" 
                  value={magicPrompt}
                  onChange={(e) => setMagicPrompt(e.target.value)}
                  placeholder="e.g. 'Cyberpunk Nintendo 64 game'..."
                  className="flex-1 bg-slate-900/50 border border-slate-700 rounded text-xs px-2 py-1.5 text-white focus:outline-none focus:border-indigo-500"
                />
                <button 
                  onClick={handleMagicGenerate}
                  disabled={isGenerating || !magicPrompt}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded px-3 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                </button>
            </div>
        </div>

        {/* Art Style Section (Enhanced) */}
        <div>
           <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Art Direction</h3>
           
           <div className="grid grid-cols-2 gap-3 mb-3">
             <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Visual Era</label>
                <input 
                    type="text"
                    value={styleDNA.artStyle.era || ''}
                    onChange={(e) => updateArtStyle('era', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Retro, Modern"
                />
             </div>
             <div>
                <label className="block text-[10px] text-slate-400 font-bold mb-1">Texture Style</label>
                <input 
                    type="text"
                    value={styleDNA.artStyle.texture || ''}
                    onChange={(e) => updateArtStyle('texture', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Pixelated, PBR"
                />
             </div>
           </div>

           <label className="block text-[10px] text-slate-400 font-bold mb-1">Rendering Technique</label>
           <input 
                type="text"
                value={styleDNA.artStyle.rendering}
                onChange={(e) => updateArtStyle('rendering', e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded p-1.5 text-xs text-white mb-3 focus:outline-none focus:border-amber-500"
           />

           <label className="block text-[10px] text-slate-400 font-bold mb-1">Influences (Comma Separated)</label>
           <textarea 
             className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white h-16 focus:outline-none focus:border-amber-500 transition-colors resize-none"
             value={styleDNA.artStyle.influences.join(', ')}
             onChange={(e) => updateArtStyle('influences', e.target.value.split(', '))}
           />
        </div>

        {/* Color Palette Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Color Palette</h3>
          
          {/* Primary Colors */}
          <div className="mb-3">
            <label className="text-[10px] text-slate-400 font-bold mb-1 block">Primary</label>
            <div className="flex gap-2">
              {styleDNA.colorPalette.primary.map((color, i) => (
                <div key={`p-${i}`} className="relative w-8 h-8 rounded-full border border-slate-600 overflow-hidden hover:scale-110 transition-transform cursor-pointer shadow-sm group">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => updateColor('primary', i, e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: color }} />
                </div>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div className="mb-3">
            <label className="text-[10px] text-slate-400 font-bold mb-1 block">Accent</label>
            <div className="flex gap-2">
              {styleDNA.colorPalette.accent.map((color, i) => (
                <div key={`a-${i}`} className="relative w-8 h-8 rounded-full border border-slate-600 overflow-hidden hover:scale-110 transition-transform cursor-pointer shadow-sm group">
                  <input 
                    type="color" 
                    value={color}
                    onChange={(e) => updateColor('accent', i, e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 opacity-0 cursor-pointer"
                  />
                  <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: color }} />
                </div>
              ))}
            </div>
          </div>

          <label className="block text-sm text-slate-300 mb-1">Mood</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
            value={styleDNA.colorPalette.mood}
            onChange={(e) => onChange({...styleDNA, colorPalette: {...styleDNA.colorPalette, mood: e.target.value as any}})}
          >
            <option value="warm">Warm</option>
            <option value="cool">Cool</option>
            <option value="neutral">Neutral</option>
            <option value="vibrant">Vibrant</option>
            <option value="muted">Muted</option>
          </select>
        </div>

        {/* Lighting Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Lighting</h3>
          <label className="block text-sm text-slate-300 mb-1">Style</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-3 focus:outline-none focus:border-amber-500 transition-colors"
            value={styleDNA.lighting.style}
            onChange={(e) => updateLighting('style', e.target.value)}
          >
            <option value="natural">Natural</option>
            <option value="studio">Studio</option>
            <option value="dramatic">Dramatic</option>
            <option value="soft">Soft</option>
            <option value="hard">Hard</option>
          </select>

          <label className="block text-sm text-slate-300 mb-1">Intensity ({styleDNA.lighting.intensity})</label>
          <input 
            type="range" 
            min="0" max="1" step="0.1"
            value={styleDNA.lighting.intensity}
            onChange={(e) => updateLighting('intensity', parseFloat(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Camera Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Camera</h3>
          <label className="block text-sm text-slate-300 mb-1">Angle</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-3 focus:outline-none focus:border-amber-500 transition-colors"
            value={styleDNA.camera.angle}
            onChange={(e) => updateCamera('angle', e.target.value)}
          >
            <option value="eye_level">Eye Level</option>
            <option value="low_angle">Low Angle</option>
            <option value="high_angle">High Angle</option>
          </select>
          
          <label className="block text-sm text-slate-300 mb-1">Field of View ({styleDNA.camera.fov}°)</label>
          <input
            type="range"
            min="15" max="120" step="5"
            value={styleDNA.camera.fov}
            onChange={(e) => updateCamera('fov', parseInt(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        {/* FIBO Advanced Controls */}
        <div className="border-t border-slate-700 pt-4">
          <h3 className="text-xs font-bold text-purple-400 uppercase mb-2 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-purple-500/20 rounded text-[10px] border border-purple-500/30">FIBO</span>
            Advanced Controllability
          </h3>
          <p className="text-[10px] text-slate-500 mb-3">
            JSON-native parameters for precise control over Bria's FIBO generation
          </p>

          {/* Composition */}
          <div className="mb-3">
            <label className="block text-sm text-slate-300 mb-1">Composition</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              value={styleDNA.fibo?.composition || 'centered'}
              onChange={(e) => updateFIBO('composition', e.target.value)}
            >
              <option value="centered">Centered</option>
              <option value="rule_of_thirds">Rule of Thirds</option>
              <option value="dynamic">Dynamic</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>

          {/* Detail Level */}
          <div className="mb-3">
            <label className="block text-sm text-slate-300 mb-1">Detail Level</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              value={styleDNA.fibo?.detail_level || 'high'}
              onChange={(e) => updateFIBO('detail_level', e.target.value)}
            >
              <option value="low">Low (Fast)</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra (Slow)</option>
            </select>
          </div>

          {/* Style Strength */}
          <div className="mb-3">
            <label className="block text-sm text-slate-300 mb-1">
              Style Strength ({((styleDNA.fibo?.style_strength || 0.75) * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0" max="1" step="0.05"
              value={styleDNA.fibo?.style_strength || 0.75}
              onChange={(e) => updateFIBO('style_strength', parseFloat(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Flexible</span>
              <span>Strict</span>
            </div>
          </div>

          {/* Inference Steps */}
          <div className="mb-3">
            <label className="block text-sm text-slate-300 mb-1">
              Quality Steps ({styleDNA.fibo?.num_inference_steps || 30})
            </label>
            <input
              type="range"
              min="10" max="50" step="5"
              value={styleDNA.fibo?.num_inference_steps || 30}
              onChange={(e) => updateFIBO('num_inference_steps', parseInt(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>Faster</span>
              <span>Higher Quality</span>
            </div>
          </div>

          {/* Negative Prompt */}
          <div className="mb-3">
            <label className="block text-sm text-slate-300 mb-1">Negative Prompt</label>
            <textarea
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-white h-16 focus:outline-none focus:border-purple-500 transition-colors resize-none"
              placeholder="What to avoid (e.g., blurry, distorted)..."
              value={styleDNA.fibo?.negative_prompt || ''}
              onChange={(e) => updateFIBO('negative_prompt', e.target.value)}
            />
          </div>

          {/* Seed (Optional) */}
          <div>
            <label className="block text-sm text-slate-300 mb-1 flex items-center gap-2">
              Seed (Optional)
              <span className="text-[10px] text-slate-500">for reproducibility</span>
            </label>
            <input
              type="number"
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Leave blank for random"
              value={styleDNA.fibo?.seed || ''}
              onChange={(e) => updateFIBO('seed', e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleDNAEditor;