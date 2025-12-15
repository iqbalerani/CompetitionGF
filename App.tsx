

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
  Loader2,
  Box,
  Layers,
  Gamepad2,
  Hammer
} from 'lucide-react';
import CustomNode from './components/CustomNode';
import GenerationPanel from './components/GenerationPanel';
import StyleDNAEditor from './components/StyleDNAEditor';
import ProjectStats from './components/ProjectStats';
import NodeLibrary from './components/NodeLibrary';
import ImagePreviewModal from './components/ImagePreviewModal';
import BlueprintWizard from './components/BlueprintWizard';
import GamePlayerModal from './components/GamePlayerModal';
import LicenseCompliance from './components/LicenseCompliance';
import { ImageZoomProvider } from './contexts/ImageZoomContext';
import { generateFullGameBlueprint, generateGameAsset, generatePlayableGame, generateAdaptiveStyleDNA } from './services/geminiService';
import { uploadImagesToR2, generateAssetFilename, saveProjectMetadataToR2, generateMetadataFilename } from './services/cloudflareR2Service';
import { DEFAULT_STYLE_DNA } from './constants';
import { NodeData, NodeType, StyleDNA, BlueprintParams, GameMode } from './types';

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
  
  // Game Build State
  const [isBuildingGame, setIsBuildingGame] = useState(false);
  const [gameCode, setGameCode] = useState<string | null>(null);
  const [showGamePlayer, setShowGamePlayer] = useState(false);

  // Game Mode State (2D / 3D)
  const [gameMode, setGameMode] = useState<GameMode>('3D');

  // State to track the perspective chosen in the wizard for the loading screen
  const [loadingPerspective, setLoadingPerspective] = useState<string>('3D');

  // R2 Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);

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
      'level': 2,
      'tilemap': 2,
      'terrain': 2,
      'scene': 3,
      'key_art': 3,
      'character': 4,
      'protagonist': 4,
      'npc': 4,
      'creature': 4,
      'villain': 4,
      'sprite_sheet': 4,
      'mesh': 4,
      'mechanic': 5,
      'system': 5,
      'ui': 5,
      'hud': 5,
      'prop': 6,
      'weapon': 6,
      'vehicle': 6,
    };

    const grouped: Record<number, any[]> = {};
    
    newNodes.forEach(node => {
      // Use subtype first for ranking, fallback to type
      const rank = typeRank[node.data.subtype] ?? typeRank[node.data.type] ?? 7;
      if (!grouped[rank]) grouped[rank] = [];
      grouped[rank].push(node);
    });

    const ROW_HEIGHT = 350;
    const COL_WIDTH = 350;

    return newNodes.map(node => {
      const rank = typeRank[node.data.subtype] ?? typeRank[node.data.type] ?? 7;
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
  const generateImagesSequentially = async (nodesToProcess: Node<NodeData>[], edgesToProcess: Edge[], currentStyleDNA: StyleDNA) => {
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
        // Use the passed currentStyleDNA (which might be newly generated)
        const imageUrl = await generateGameAsset(
          node.data.description, 
          currentStyleDNA, 
          node.data.type,
          node.data.subtype,
          context, 
          gameMode,
          node.data.perspective // Pass specific perspective if available
        );
        
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
    setLoadingPerspective(params.perspective);
    setIsGeneratingBlueprint(true);
    
    // params includes the gameMode and perspective now
    
    try {
      // Run blueprint creation and adaptive style generation in parallel for efficiency
      const [blueprint, adaptiveStyle] = await Promise.all([
        generateFullGameBlueprint(params),
        generateAdaptiveStyleDNA(params)
      ]);

      // If we successfully generated a new style, update the global state
      let activeStyleDNA = styleDNA;
      if (adaptiveStyle) {
        setStyleDNA(adaptiveStyle);
        activeStyleDNA = adaptiveStyle;
      }

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
            status: 'draft',
            perspective: params.perspective // Save the blueprint perspective to the node
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

        // Start generating images using the NEW style
        generateImagesSequentially(layoutedNodes, newEdges, activeStyleDNA);
      } else {
        setIsGeneratingBlueprint(false);
      }
    } catch (error) {
      console.error("Blueprint failed", error);
      setIsGeneratingBlueprint(false);
    }
  };

  const handleBuildGame = async () => {
    setIsBuildingGame(true);
    try {
      const code = await generatePlayableGame(nodes, gameMode, styleDNA);
      setGameCode(code);
      setShowGamePlayer(true);
    } catch (e) {
      console.error(e);
      alert("Failed to build game prototype.");
    } finally {
      setIsBuildingGame(false);
    }
  };

  /**
   * Save all generated images to Cloudflare R2
   */
  const handleSaveToR2 = async () => {
    console.log('🔍 [DEBUG] handleSaveToR2 called - button click registered');

    // Collect all nodes with images
    const nodesWithImages = nodes.filter(n => n.data.image);

    console.log(`🔍 [DEBUG] Found ${nodesWithImages.length} nodes with images`);

    if (nodesWithImages.length === 0) {
      alert('No generated images to save. Generate some assets first!');
      return;
    }

    // Check if Worker URL is configured
    const workerUrl = import.meta.env.VITE_WORKER_URL;
    console.log(`🔍 [DEBUG] VITE_WORKER_URL value: "${workerUrl}"`);

    if (!workerUrl || workerUrl === 'YOUR_WORKER_URL_HERE') {
      alert('⚠️ Worker URL not configured!\n\nDeploy the Cloudflare Worker first, then add VITE_WORKER_URL to .env.local\n\nSee WORKER_SETUP_GUIDE.md for instructions.');
      console.error('');
      console.error('🚨 Cloudflare Worker not configured!');
      console.error('');
      console.error('Follow these steps:');
      console.error('1. cd workers');
      console.error('2. npx wrangler login');
      console.error('3. npx wrangler deploy');
      console.error('4. Copy the Worker URL from output');
      console.error('5. Add VITE_WORKER_URL=https://your-worker.workers.dev to .env.local');
      console.error('6. Restart dev server: npm run dev');
      console.error('');
      console.error('See WORKER_SETUP_GUIDE.md for detailed instructions.');
      console.error('');
      return;
    }

    setIsUploading(true);
    setUploadProgress({ current: 0, total: nodesWithImages.length });

    try {
      // Prepare images for upload
      const imagesToUpload = nodesWithImages.map(node => ({
        data: node.data.image!,
        filename: generateAssetFilename(node.id, node.data.subtype || node.data.type)
      }));

      console.log(`📤 Uploading ${imagesToUpload.length} images to R2...`);

      // Upload images with progress tracking
      const urls = await uploadImagesToR2(
        imagesToUpload,
        (current, total) => {
          setUploadProgress({ current, total });
          console.log(`✅ Uploaded ${current}/${total} images`);
        }
      );

      setUploadedUrls(urls);

      // Optionally save project metadata
      const projectName = nodes.find(n => n.data.type === 'world')?.data.label || 'game-project';
      const metadata = {
        projectName,
        gameMode,
        styleDNA,
        nodes: nodes.map(n => ({
          id: n.id,
          label: n.data.label,
          type: n.data.type,
          subtype: n.data.subtype,
          description: n.data.description,
          imageUrl: urls[nodesWithImages.findIndex(node => node.id === n.id)] || null
        })),
        generatedAt: new Date().toISOString(),
        totalAssets: nodesWithImages.length
      };

      const metadataUrl = await saveProjectMetadataToR2(
        metadata,
        generateMetadataFilename(projectName)
      );

      // Success notification
      console.log('');
      console.log('🎉 SUCCESS! All images uploaded to R2!');
      console.log('');
      console.log('📸 Image URLs:');
      urls.forEach((url, i) => {
        console.log(`  ${i + 1}. ${url}`);
      });
      console.log('');
      console.log(`📄 Project Metadata: ${metadataUrl}`);
      console.log('');

      alert(`✅ Success! Uploaded ${urls.length} images to Cloudflare R2!\n\nCheck browser console for URLs.`);

    } catch (error: any) {
      console.error('❌ R2 Upload Failed:', error);
      alert(`Failed to upload to R2: ${error.message}\n\nCheck browser console for details.`);
    } finally {
      setIsUploading(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  // Count generated assets for licensing compliance display
  const generatedAssetCount = nodes.filter(n => n.data.image).length;

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-slate-950 text-slate-200 font-sans">
      
      {/* Loading Overlay - Blueprint */}
      {isGeneratingBlueprint && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
           <div className="relative">
             <div className="absolute inset-0 bg-amber-500 blur-xl opacity-20 animate-pulse"></div>
             <Loader2 size={64} className="text-amber-500 animate-spin relative z-10" />
           </div>
           <h2 className="mt-8 text-2xl font-bold text-white tracking-widest uppercase">Architecting {loadingPerspective} Blueprint</h2>
           <p className="text-slate-400 mt-2 font-mono text-sm animate-pulse">Computing assets & adapting Style DNA...</p>
        </div>
      )}

      {/* Loading Overlay - Build Game */}
      {isBuildingGame && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
           <div className="relative group">
             <div className="absolute inset-0 bg-green-500 blur-2xl opacity-20 animate-pulse"></div>
             <Gamepad2 size={64} className="text-green-500 animate-bounce relative z-10" />
           </div>
           <h2 className="mt-8 text-2xl font-bold text-white tracking-widest uppercase">Compiling Game Prototype</h2>
           <p className="text-green-400 mt-2 font-mono text-sm animate-pulse">Injecting assets • Generating physics • Baking lighting</p>
        </div>
      )}

      {/* Loading Overlay - R2 Upload */}
      {isUploading && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
           <div className="relative group">
             <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 animate-pulse"></div>
             <Share2 size={64} className="text-blue-500 animate-pulse relative z-10" />
           </div>
           <h2 className="mt-8 text-2xl font-bold text-white tracking-widest uppercase">Uploading to Cloudflare R2</h2>
           <p className="text-blue-400 mt-2 font-mono text-sm">
             {uploadProgress.current > 0
               ? `${uploadProgress.current} / ${uploadProgress.total} images uploaded...`
               : 'Preparing upload...'}
           </p>
           <div className="mt-4 w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
             <div
               className="h-full bg-blue-500 transition-all duration-300"
               style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
             ></div>
           </div>
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
             
             {/* 2D / 3D Toggle */}
             <div className="flex bg-slate-950 rounded-md p-1 border border-slate-800">
               <button 
                 onClick={() => setGameMode('2D')}
                 className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${gameMode === '2D' ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <Layers size={12} /> 2D
               </button>
               <button 
                 onClick={() => setGameMode('3D')}
                 className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all ${gameMode === '3D' ? 'bg-amber-600 text-white shadow' : 'text-slate-500 hover:text-slate-300'}`}
               >
                 <Box size={12} /> 3D
               </button>
             </div>

             <div className="h-8 w-px bg-slate-700 mx-2"></div>

             <div className="flex items-center gap-1">
               <button 
                 onClick={() => setShowBlueprintWizard(true)}
                 disabled={isGeneratingBlueprint || isBuildingGame}
                 className={`
                   flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold text-white 
                   bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-900/20 
                   transition-all
                   ${isGeneratingBlueprint || isBuildingGame ? 'opacity-50 cursor-not-allowed' : 'hover:from-indigo-500 hover:to-violet-500 hover:scale-105'}
                 `}
                 title={`Generate Full ${gameMode} Game Blueprint`}
               >
                 <BrainCircuit size={16} />
                 Blueprint
               </button>

               <button 
                 onClick={handleBuildGame}
                 disabled={isGeneratingBlueprint || isBuildingGame || nodes.length < 2}
                 className={`
                   flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-bold text-white 
                   bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg shadow-green-900/20 
                   transition-all ml-1
                   ${isGeneratingBlueprint || isBuildingGame ? 'opacity-50 cursor-not-allowed' : 'hover:from-green-500 hover:to-emerald-500 hover:scale-105'}
                 `}
                 title="Build Playable Game Prototype"
               >
                 <Hammer size={16} />
                 Build Game
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
             <button
               onClick={handleSaveToR2}
               disabled={isUploading}
               className={`p-2 border rounded-md shadow-lg transition-all ${
                 isUploading
                   ? 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
                   : 'bg-amber-600 border-amber-500 text-white hover:bg-amber-500 shadow-amber-900/20'
               }`}
               title="Save all images to Cloudflare R2"
             >
               {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
             </button>
          </div>
        </div>

        {/* Node Library (Left) */}
        <div className="absolute left-4 top-24 bottom-4 z-10 pointer-events-none flex flex-col justify-start gap-4">
           <div className="pointer-events-auto">
              <NodeLibrary onAddNode={addNewNode} gameMode={gameMode} />
           </div>

           {/* License Compliance Info (Bottom Left) */}
           {generatedAssetCount > 0 && (
             <div className="pointer-events-auto w-80">
               <LicenseCompliance assetCount={generatedAssetCount} />
             </div>
           )}
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
          <Panel position="bottom-center" className="bg-slate-900/50 backdrop-blur px-4 py-2 rounded-full border border-slate-800 text-xs text-slate-500 flex gap-4">
            <span>{nodes.length} nodes • {edges.length} connections</span>
            <span className="text-slate-700">|</span>
            <span className={gameMode === '2D' ? 'text-indigo-400 font-bold' : 'text-amber-400 font-bold'}>{gameMode} MODE ACTIVE</span>
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
            gameMode={gameMode}
          />
        )}

        {/* Stats Modal */}
        {showStats && (
          <ProjectStats nodes={nodes} onClose={() => setShowStats(false)} />
        )}

        {/* Game Player Modal */}
        {showGamePlayer && gameCode && (
          <GamePlayerModal 
            gameCode={gameCode}
            onClose={() => setShowGamePlayer(false)}
          />
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
           gameMode={gameMode}
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