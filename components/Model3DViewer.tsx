
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { X, Box, Layers, Maximize } from 'lucide-react';

interface Model3DViewerProps {
  imageUrl: string;
  depthMapUrl: string;
  onClose: () => void;
}

const Model3DViewer: React.FC<Model3DViewerProps> = ({ imageUrl, depthMapUrl, onClose }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // Match app bg

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 2;
    camera.position.y = 1;
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x9999ff, 0.5);
    backLight.position.set(-5, 0, -5);
    scene.add(backLight);

    // --- Mesh Generation ---
    const textureLoader = new THREE.TextureLoader();
    
    // Load both textures
    Promise.all([
      new Promise<THREE.Texture>(resolve => textureLoader.load(imageUrl, resolve)),
      new Promise<THREE.Texture>(resolve => textureLoader.load(depthMapUrl, resolve))
    ]).then(([colorMap, displacementMap]) => {
      
      // Calculate aspect ratio
      const aspect = colorMap.image.width / colorMap.image.height;
      const width = 2;
      const height = width / aspect;

      // Create geometry with high segment count for detail
      const geometry = new THREE.PlaneGeometry(width, height, 512, 512);

      const material = new THREE.MeshStandardMaterial({
        map: colorMap,
        displacementMap: displacementMap,
        displacementScale: 0.5, // Depth intensity
        side: THREE.DoubleSide,
        roughness: 0.6,
        metalness: 0.2
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Animation Loop
      const animate = () => {
        requestAnimationFrame(animate);
        controls.update();
        // mesh.rotation.y += 0.002; // Gentle rotation
        renderer.render(scene, camera);
      };
      animate();

    }).catch(err => console.error("Failed to load textures", err));

    // --- Cleanup ---
    return () => {
      if (rendererRef.current) {
        rendererRef.current.dispose();
        // Simple cleanup, in production should dispose geometries/materials too
        const canvas = rendererRef.current.domElement;
        canvas.remove();
      }
    };
  }, [imageUrl, depthMapUrl]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full h-full max-w-5xl max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start pointer-events-none">
          <div className="bg-slate-950/80 backdrop-blur border border-slate-700 rounded-lg p-2 pointer-events-auto">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Box size={18} className="text-amber-500" />
              3D Model Viewer
            </h2>
            <p className="text-[10px] text-slate-400 font-mono mt-1">
              RENDER: Displacement Mesh • POLYGONS: High
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="pointer-events-auto p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-red-500/20 rounded-full transition-colors border border-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewport */}
        <div ref={containerRef} className="w-full h-full cursor-move bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black" />
        
        {/* Footer Instructions */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none opacity-50 text-xs text-white bg-black/30 px-3 py-1 rounded-full">
           Left Click: Rotate • Right Click: Pan • Scroll: Zoom
        </div>
      </div>
    </div>
  );
};

export default Model3DViewer;