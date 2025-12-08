
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { ASSET_LIBRARY, SUBTYPE_ICONS, NODE_TYPES_CONFIG } from '../constants';
import { NodeType } from '../types';

interface NodeLibraryProps {
  onAddNode: (type: NodeType, subtype: string, label: string) => void;
}

const NodeLibrary: React.FC<NodeLibraryProps> = ({ onAddNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'World Building': true,
    'Narrative & Scenes': true,
    'Characters': true,
    'Assets & Props': true,
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredLibrary = ASSET_LIBRARY.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.subtype.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="w-64 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
      {/* Header */}
      <div className="p-3 border-b border-slate-800">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Asset Library</h2>
        <div className="relative">
          <Search size={14} className="absolute left-2 top-2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-md py-1.5 pl-8 pr-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500 placeholder:text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredLibrary.map((category) => (
          <div key={category.category} className="rounded-lg overflow-hidden">
            <button 
              onClick={() => toggleCategory(category.category)}
              className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
            >
              <span>{category.category}</span>
              {expandedCategories[category.category] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            
            {expandedCategories[category.category] && (
              <div className="space-y-0.5 mt-1">
                {category.items.map((item, idx) => {
                  // Resolve Icon
                  const config = NODE_TYPES_CONFIG[item.type as NodeType];
                  let Icon = config?.icon;
                  if (item.subtype && SUBTYPE_ICONS[item.subtype]) {
                    Icon = SUBTYPE_ICONS[item.subtype];
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => onAddNode(item.type as NodeType, item.subtype, item.label)}
                      className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-slate-800 group transition-all text-left"
                    >
                      <div className={`
                        p-1.5 rounded bg-slate-800 border border-slate-700 text-slate-400 
                        group-hover:text-amber-500 group-hover:border-amber-500/50 group-hover:bg-amber-500/10 transition-colors
                      `}>
                        {Icon && <Icon size={14} />}
                      </div>
                      <div className="flex-1">
                        <span className="block text-sm text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                        <span className="block text-[10px] text-slate-600 font-mono uppercase">{item.subtype}</span>
                      </div>
                      <Plus size={14} className="opacity-0 group-hover:opacity-100 text-amber-500 -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeLibrary;
