
import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  Connection,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Panel,
} from 'reactflow';
import { 
  Settings, 
  Share2, 
  Play, 
  LayoutDashboard,
  Save,
  Undo,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import CustomNode from './components/CustomNode';
import GenerationPanel from './components/GenerationPanel';
import StyleDNAEditor from './components/StyleDNAEditor';
import ProjectStats from './components/ProjectStats';
import NodeLibrary from './components/NodeLibrary';
import ImagePreviewModal from './components/ImagePreviewModal';
import BlueprintWizard from './components/BlueprintWizard';
import { ImageZoomProvider } from './contexts/ImageZoomContext';
import { generateFullGameBlueprint, generateGameAsset } from './services/geminiService';
import { DEFAULT_STYLE_DNA } from './constants';
import { NodeData, NodeType, StyleDNA, BlueprintParams } from './types';

// Initial Nodes
const initialNodes: Node<NodeData>[] = [
  { 
    id: '1', 
    type: 'custom', 
    position: { x: 250, y: 50 }, 
    data: { label: 'The Forgotten Kingdom', type: 'world', subtype: 'world', description: 'A fallen realm shrouded in eternal twilight, where ancient ruins float in a gravity-defying void.', status: 'draft' } 
  },
  { 
    id: '2', 
    type: 'custom', 
    position: { x: 100, y: 300 }, 
    data: { label: 'Crystal Caverns', type: 'zone', subtype: 'zone', description: 'Underground tunnels illuminated by giant, humming crystals.', status: 'draft' } 
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 400, y: 300 }, 
    data: { label: 'Protagonist', type: 'character', subtype: 'protagonist', description: 'A lone wanderer with a glowing mechanical arm.', status: 'draft' } 
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e1-3', source: '1', target: '3' },
];

function GameForgeBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [styleDNA, setStyleDNA] = useState<StyleDNA>(DEFAULT_STYLE_DNA);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showBlueprintWizard, setShowBlueprintWizard] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);

  // Custom Node Types Registration
  const nodeTypes = useMemo<NodeTypes>(() => ({ custom: CustomNode }), []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const addNewNode = (type: NodeType, subtype: string, label: string) => {
    const id = (nodes.length + 1 + Math.floor(Math.random() * 1000)).toString();
    const randomOffset = () => Math.random() * 50; 
    
    const newNode: Node<NodeData> = {
      id,
      type: 'custom',
      position: { x: 100 + randomOffset(), y: 200 + randomOffset() },
      data: {
        label: label, 
        type,
        subtype,
        description: '',
        status: 'draft',
      },
    };
    setNodes((nds) => nds.concat(newNode));
  };

  const updateNodeData = (id: string, newData: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
  };

  // --- Auto Layout Logic ---
  const organizeGraph = (newNodes: any[], newEdges: any[]) => {
    const typeRank: Record<string, number> = {
      'world': 0,
      'faction': 1,
      'zone': 2,
      'biome': 2,
      'scene': 3,
      'key_art': 3,
      'character': 4,
      'protagonist': 4,
      'npc': 4,
      'creature': 4,
      'villain': 4,
      'prop': 5,
      'weapon': 5,
      'vehicle': 5,
    };

    const grouped: Record<number, any[]> = {};
    
    newNodes.forEach(node => {
      // Use subtype first for ranking, fallback to type
      const rank = typeRank[node.data.subtype] ?? typeRank[node.data.type] ?? 6;
      if (!grouped[rank]) grouped[rank] = [];
      grouped[rank].push(node);
    });

    const ROW_HEIGHT = 350;
    const COL_WIDTH = 350;

    return newNodes.map(node => {
      const rank = typeRank[node.data.subtype] ?? typeRank[node.data.type] ?? 6;
      const nodesInRank = grouped[rank] || [];
      const indexInRank = nodesInRank.findIndex(n => n.id === node.id);
      
      // Center the row
      const rowWidth = nodesInRank.length * COL_WIDTH;
      const startX = -rowWidth / 2;

      return {
        ...node,
        position: {
          x: startX + (indexInRank * COL_WIDTH) + 250, // 250 is center offset
          y: rank * ROW_HEIGHT + 50
        }
      };
    });
  };

  // --- Sequential Generation Logic ---
  const generateImagesSequentially = async (nodesToProcess: Node<NodeData>[], edgesToProcess: Edge[]) => {
    // We iterate sequentially to generate images one by one
    for (const node of nodesToProcess) {
      // Only process nodes that have a description and aren't already done (though new blueprint nodes are draft)
      if (!node.data.description || node.data.locked) continue;

      // 1. Update status to generating
      setNodes((nds) => 
        nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, status: 'generating' } } : n)
      );

      try {
        // 2. Calculate Context from the blueprint structure
        const incomingEdges = edgesToProcess.filter(e => e.target === node.id);
        const parentNodes = nodesToProcess.filter(n => incomingEdges.some(e => e.source === n.id));
        
        let context = "";
        if (parentNodes.length > 0) {
           context = parentNodes.map(n => {
             const type = n.data.subtype || n.data.type;
             return `${type} "${n.data.label}": ${n.data.description}`;
           }).join('\nContext: ');
        }

        // 3. Generate Image
        // Use the current styleDNA from state
        const imageUrl = await generateGameAsset(node.data.description, styleDNA, context);
        
        // 4. Update Node with Result
        setNodes((nds) => 
          nds.map((n) => n.id === node.id ? { 
            ...n, 
            data: { 
              ...n.data, 
              image: imageUrl || undefined, 
              status: imageUrl ? 'done' : 'draft' 
            } 
          } : n)
        );

      } catch (error) {
        console.error("Auto-generation failed for node", node.id, error);
        setNodes((nds) => 
          nds.map((n) => n.id === node.id ? { ...n, data: { ...n.data, status: 'draft' } } : n)
        );
      }
    }
  };

  const handleBlueprintSubmit = async (params: BlueprintParams) => {
    setShowBlueprintWizard(false);
    setIsGeneratingBlueprint(true);
    
    // Optionally update style DNA based on params here if desired, 
    // but for now we just use the params for blueprint generation context.

    try {
      const blueprint = await generateFullGameBlueprint(params);
      if (blueprint) {
        const newNodes: Node<NodeData>[] = blueprint.nodes.map(n => ({
          id: n.id,
          type: 'custom',
          position: { x: 0, y: 0 }, // Will be set by layout
          data: {
            label: n.label,
            type: n.type as NodeType,
            subtype: n.subtype,
            description: n.description,
            status: 'draft'
          }
        }));

        const newEdges: Edge[] = blueprint.edges.map((e, idx) => ({
          id: `e-${idx}`,
          source: e.source,
          target: e.target,
          animated: true
        }));

        const layoutedNodes = organizeGraph(newNodes, newEdges);

        // Update Graph
        setNodes(layoutedNodes);
        setEdges(newEdges);
        
        // Hide loader so user can see the graph structure
        setIsGeneratingBlueprint(false);

        // Start generating images for the new nodes
        generateImagesSequentially(layoutedNodes, newEdges);
      } else {
        setIsGeneratingBlueprint(false);
      }
    } catch (error) {
      console.error("Blueprint failed", error);
      setIsGeneratingBlueprint(false);
    }
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-slate-950 text-slate-200 font-sans">
      
      {/* Loading Overlay */}
      {isGeneratingBlueprint && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
           <div className="relative">
             <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 animate-pulse"></div>
             <Loader2 size={64} className="text-amber-500 animate-spin relative z-10" />
           </div>
           <h2 className="mt-8 text-2xl font-bold text-white tracking-widest uppercase">Architecting Neural Blueprint</h2>
           <p className="text-slate-400 mt-2 font-mono text-sm animate-pulse">Calculating graph connections...</p>
        </div>
      )}

      {/* --- Main Canvas Area --- */}
      <div className="flex-1 relative h-full">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 pointer-events-none flex justify-between items-start">
          <div className="pointer-events-auto bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-lg shadow-xl flex items-center gap-4">
             <div className="flex items-center gap-2 px-2">
                <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                  <Play size={16} className="text-white fill-white" />
                </div>
                <div>
                  <h1 className="font-bold text-white leading-none">GameForge</h1>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Pre-Production Studio</p>
                </div>
             </div>
             <div className="h-8 w-px bg-slate-700 mx-2"></div>
             <div className="flex items-center gap-1">
               <button 
                 onClick={() => setShowBlueprintWizard(true)}
                 disabled={isGeneratingBlueprint}
                 className={`
                   flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold text-white 
                   bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-900/20 
                   transition-all
                   ${isGeneratingBlueprint ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-500 hover:to-violet-500 hover:scale-105'}
                 `}
                 title="Generate Full Game Blueprint"
               >
                 <BrainCircuit size={16} />
                 Blueprint
               </button>
               <div className="h-4 w-px bg-slate-700 mx-1"></div>
               <button 
                 onClick={() => setShowStyleEditor(!showStyleEditor)}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${showStyleEditor ? 'bg-amber-500/20 text-amber-500' : 'hover:bg-slate-800 text-slate-300'}`}
               >
                 <Settings size={14} />
                 Style DNA
               </button>
               <button 
                 onClick={() => setShowStats(true)}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-slate-800 text-slate-300 transition-colors"
               >
                 <LayoutDashboard size={14} />
                 Stats
               </button>
             </div>
          </div>

          <div className="pointer-events-auto flex gap-2">
             <button className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-400 hover:text-white hover:bg-slate-800">
               <Undo size={18} />
             </button>
             <button className="p-2 bg-slate-900 border border-slate-700 rounded-md text-slate-400 hover:text-white hover:bg-slate-800">
               <Save size={18} />
             </button>
             <button className="p-2 bg-amber-600 border border-amber-500 rounded-md text-white hover:bg-amber-500 shadow-lg shadow-amber-900/20">
               <Share2 size={18} />
             </button>
          </div>
        </div>

        {/* Node Library (Left) */}
        <div className="absolute left-4 top-24 bottom-4 z-10 pointer-events-none flex flex-col justify-start">
           <div className="pointer-events-auto">
              <NodeLibrary onAddNode={addNewNode} />
           </div>
        </div>

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          className="bg-slate-950"
        >
          <Background color="#334155" gap={20} size={1} />
          <Controls className="bg-slate-800 border-slate-700 fill-slate-400" />
          
          {/* Legend/Info Panel inside Canvas */}
          <Panel position="bottom-center" className="bg-slate-900/50 backdrop-blur px-4 py-2 rounded-full border border-slate-800 text-xs text-slate-500">
            {nodes.length} nodes • {edges.length} connections • Style: {styleDNA.name}
          </Panel>
        </ReactFlow>

        {/* Style Editor Modal/Panel */}
        {showStyleEditor && (
          <StyleDNAEditor 
            styleDNA={styleDNA} 
            onChange={setStyleDNA} 
            onClose={() => setShowStyleEditor(false)} 
          />
        )}

        {/* Blueprint Wizard Modal */}
        {showBlueprintWizard && (
          <BlueprintWizard 
            onGenerate={handleBlueprintSubmit}
            onClose={() => setShowBlueprintWizard(false)}
          />
        )}

        {/* Stats Modal */}
        {showStats && (
          <ProjectStats nodes={nodes} onClose={() => setShowStats(false)} />
        )}
      </div>

      {/* --- Right Property/Generation Panel --- */}
      <div className={`
        w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-20 transition-transform duration-300 ease-in-out absolute right-0 top-0 bottom-0
        ${selectedNode ? 'translate-x-0' : 'translate-x-full'}
      `}>
         <GenerationPanel 
           selectedNode={selectedNode}
           styleDNA={styleDNA}
           onUpdateNode={updateNodeData}
           nodes={nodes}
           edges={edges}
         />
      </div>

    </div>
  );
}

export default function App() {
  return (
    <ImageZoomProvider>
      <GameForgeBoard />
      <ImagePreviewModal />
    </ImageZoomProvider>
  );
}
