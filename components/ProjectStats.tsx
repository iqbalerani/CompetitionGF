import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Node } from 'reactflow';
import { NodeData, NodeType } from '../types';
import { NODE_TYPES_CONFIG } from '../constants';

interface ProjectStatsProps {
  nodes: Node<NodeData>[];
  onClose: () => void;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ nodes, onClose }) => {
  
  const typeData = Object.keys(NODE_TYPES_CONFIG).map(type => {
    return {
      name: NODE_TYPES_CONFIG[type as NodeType].label,
      value: nodes.filter(n => n.data.type === type).length,
      color: NODE_TYPES_CONFIG[type as NodeType].color.replace('bg-', '').replace('-600', '') // approximate mapping for tailwind classes to hex usually requires a map, but we'll use generic colors for chart
    };
  }).filter(d => d.value > 0);

  const COLORS = ['#4f46e5', '#2563eb', '#0d9488', '#e11d48', '#d97706'];

  const statusData = [
    { name: 'Draft', value: nodes.filter(n => !n.data.status || n.data.status === 'draft').length },
    { name: 'Done', value: nodes.filter(n => n.data.status === 'done').length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl w-[800px] max-w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Project Analytics</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>

        <div className="grid grid-cols-2 gap-8 h-64">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 text-center">Node Distribution</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-400 mb-4 text-center">Completion Status</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="mt-8 text-center text-slate-500 text-sm">
          Total Nodes: <span className="text-white font-bold">{nodes.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectStats;
