

export type NodeType = 'world' | 'zone' | 'scene' | 'character' | 'prop' | 'mechanic' | 'ui';

export type GameMode = '2D' | '3D';

export interface StyleDNA {
  name: string;
  version: string;
  colorPalette: {
    primary: string[];
    accent: string[];
    mood: 'warm' | 'cool' | 'neutral' | 'vibrant' | 'muted';
  };
  lighting: {
    style: 'natural' | 'studio' | 'dramatic' | 'soft' | 'hard';
    intensity: number; // 0-1
  };
  camera: {
    fov: number;
    angle: 'eye_level' | 'low_angle' | 'high_angle';
  };
  artStyle: {
    rendering: string;
    era: string; // New: e.g. '8-bit', 'PS1-era', 'Next-Gen'
    texture: string; // New: e.g. 'Pixelated', 'Hand-painted', 'Photorealistic'
    influences: string[];
  };
}

export interface NodeData {
  label: string;
  type: NodeType;
  subtype?: string; // New field for granular types (e.g., 'weapon', 'vehicle')
  description: string;
  image?: string; // Base64 or URL
  depthMap?: string; // Base64 depth map for 3D generation
  styleOverrides?: Partial<StyleDNA>;
  status?: 'draft' | 'generating' | 'done';
  locked?: boolean;
  tags?: string[];
  perspective?: string; // Specific perspective setting (e.g. 'Isometric', 'VR')
}

export interface GeneratedAsset {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}

export interface BlueprintParams {
  prompt: string;
  platform: string;
  perspective: string; // '2D' | '3D' etc
  genre: string;
  artStyle: string;
  mechanics: string;
  audience: string;
  gameMode: GameMode; // Added to pass global context
}