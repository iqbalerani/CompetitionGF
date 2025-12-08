import React from 'react';
import { StyleDNA } from '../types';
import { X, Sliders } from 'lucide-react';

interface StyleDNAEditorProps {
  styleDNA: StyleDNA;
  onChange: (newStyle: StyleDNA) => void;
  onClose: () => void;
}

const StyleDNAEditor: React.FC<StyleDNAEditorProps> = ({ styleDNA, onChange, onClose }) => {
  
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
        {/* Color Palette Section */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Color Palette</h3>
          <div className="flex gap-2 mb-2">
            {styleDNA.colorPalette.primary.map((color, i) => (
              <div key={i} className="w-8 h-8 rounded-full border border-slate-600" style={{ backgroundColor: color }} />
            ))}
          </div>
          <label className="block text-sm text-slate-300 mb-1">Mood</label>
          <select 
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
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
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-3"
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
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white mb-3"
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

        {/* Art Style Section */}
        <div>
           <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Art Direction</h3>
           <textarea 
             className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white h-24"
             value={styleDNA.artStyle.influences.join(', ')}
             onChange={(e) => onChange({...styleDNA, artStyle: {...styleDNA.artStyle, influences: e.target.value.split(', ')}})}
           />
           <p className="text-xs text-slate-500 mt-1">Comma separated influences</p>
        </div>
      </div>
    </div>
  );
};

export default StyleDNAEditor;
