
export type NodeType = 'world' | 'zone' | 'scene' | 'character' | 'prop';

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
    influences: string[];
  };
}

export interface NodeData {
  label: string;
  type: NodeType;
  subtype?: string; // New field for granular types (e.g., 'weapon', 'vehicle')
  description: string;
  image?: string; // Base64 or URL
  styleOverrides?: Partial<StyleDNA>;
  status?: 'draft' | 'generating' | 'done';
  locked?: boolean;
  tags?: string[];
}

export interface GeneratedAsset {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
}
