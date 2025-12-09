

import { StyleDNA, NodeType } from './types';
import { 
  Layout, Map, Image as ImageIcon, User, Box, 
  Flag, CloudRain, Film, Star, Ghost, Sword, Car, Trees, Skull,
  Gamepad2, LayoutTemplate, Grid, Cuboid, Layers, Monitor, Disc
} from 'lucide-react';

export const DEFAULT_STYLE_DNA: StyleDNA = {
  name: "Dark Fantasy - Default",
  version: "1.0",
  colorPalette: {
    primary: ["#2C1810", "#8B4513", "#D4A574"],
    accent: ["#FFD700", "#FF4500"],
    mood: "warm",
  },
  lighting: {
    style: "dramatic",
    intensity: 0.7,
  },
  camera: {
    fov: 65,
    angle: "low_angle",
  },
  artStyle: {
    rendering: "painterly",
    era: "Modern Fantasy",
    texture: "Detailed Digital Painting",
    influences: ["Dark Souls", "Elden Ring"],
  },
};

export const NODE_TYPES_CONFIG: Record<NodeType, { 
  label: string; 
  icon: any; 
  color: string; 
  borderColor: string;
  aspectRatio: string; // Tailwind class
  width: string; // Tailwind class
}> = {
  world: { 
    label: 'World', 
    icon: Map, 
    color: 'bg-indigo-500', 
    borderColor: 'border-indigo-400',
    aspectRatio: 'aspect-video',
    width: 'w-80'
  },
  zone: { 
    label: 'Zone', 
    icon: Layout, 
    color: 'bg-blue-500', 
    borderColor: 'border-blue-400',
    aspectRatio: 'aspect-video',
    width: 'w-72'
  },
  scene: { 
    label: 'Scene', 
    icon: ImageIcon, 
    color: 'bg-teal-500', 
    borderColor: 'border-teal-400',
    aspectRatio: 'aspect-video',
    width: 'w-72'
  },
  character: { 
    label: 'Character', 
    icon: User, 
    color: 'bg-rose-500', 
    borderColor: 'border-rose-400',
    aspectRatio: 'aspect-[3/4]', // Taller for portraits
    width: 'w-64'
  },
  prop: { 
    label: 'Prop', 
    icon: Box, 
    color: 'bg-amber-500', 
    borderColor: 'border-amber-400',
    aspectRatio: 'aspect-square', // Square for items
    width: 'w-56'
  },
  mechanic: { 
    label: 'Mechanic', 
    icon: Gamepad2, 
    color: 'bg-violet-500', 
    borderColor: 'border-violet-400',
    aspectRatio: 'aspect-video',
    width: 'w-64'
  },
  ui: { 
    label: 'Interface', 
    icon: LayoutTemplate, 
    color: 'bg-fuchsia-500', 
    borderColor: 'border-fuchsia-400',
    aspectRatio: 'aspect-video',
    width: 'w-64'
  },
};

// Map specific subtypes to specific icons
export const SUBTYPE_ICONS: Record<string, any> = {
  'faction': Flag,
  'biome': CloudRain,
  'storyboard': Film,
  'key_art': Star,
  'creature': Ghost,
  'villain': Skull,
  'weapon': Sword,
  'vehicle': Car,
  'vegetation': Trees,
  'tilemap': Grid,
  'sprite': User,
  'mesh': Cuboid,
  'level': Layers,
  'hud': Monitor,
  'menu': LayoutTemplate,
  'loop': Disc,
  'system': Gamepad2
};

// 2D Specific Library
export const ASSET_LIBRARY_2D = [
  {
    category: 'World & Levels',
    items: [
      { type: 'world', subtype: 'world', label: 'World Map (2D)' },
      { type: 'zone', subtype: 'level', label: 'Level Layout' },
      { type: 'zone', subtype: 'tilemap', label: 'Tilemap / Grid' },
      { type: 'zone', subtype: 'parallax', label: 'Parallax Background' },
    ]
  },
  {
    category: 'Characters & Sprites',
    items: [
      { type: 'character', subtype: 'sprite_sheet', label: 'Sprite Sheet' },
      { type: 'character', subtype: 'portrait', label: 'Dialogue Portrait' },
      { type: 'character', subtype: 'npc', label: 'NPC Sprite' },
      { type: 'character', subtype: 'boss', label: 'Boss Sprite' },
    ]
  },
  {
    category: 'UI & HUD',
    items: [
      { type: 'ui', subtype: 'hud', label: 'In-Game HUD' },
      { type: 'ui', subtype: 'menu', label: 'Main Menu' },
      { type: 'ui', subtype: 'inventory', label: 'Inventory Grid' },
    ]
  },
  {
    category: 'Mechanics (2D)',
    items: [
      { type: 'mechanic', subtype: 'platforming', label: 'Platforming Logic' },
      { type: 'mechanic', subtype: 'physics', label: '2D Physics' },
    ]
  },
  {
    category: 'Assets',
    items: [
      { type: 'prop', subtype: 'icon', label: 'Item Icon' },
      { type: 'prop', subtype: 'pickup', label: 'Pickup Item' },
    ]
  }
];

// 3D Specific Library
export const ASSET_LIBRARY_3D = [
  {
    category: 'World & Environments',
    items: [
      { type: 'world', subtype: 'world', label: 'World Map (3D)' },
      { type: 'zone', subtype: 'terrain', label: 'Terrain / Heightmap' },
      { type: 'zone', subtype: 'skybox', label: 'Skybox / HDR' },
      { type: 'scene', subtype: 'scene', label: '3D Environment' },
    ]
  },
  {
    category: 'Characters & Models',
    items: [
      { type: 'character', subtype: 'mesh', label: 'Character Mesh' },
      { type: 'character', subtype: 'rig', label: 'Rig / Skeleton' },
      { type: 'character', subtype: 'npc', label: 'NPC Model' },
    ]
  },
  {
    category: 'UI & Interface',
    items: [
      { type: 'ui', subtype: 'hud', label: 'Diegetic HUD' },
      { type: 'ui', subtype: 'menu', label: '3D Menu Scene' },
    ]
  },
  {
    category: 'Mechanics (3D)',
    items: [
      { type: 'mechanic', subtype: 'camera', label: 'Camera Controller' },
      { type: 'mechanic', subtype: 'physics', label: 'RigidBody Physics' },
      { type: 'mechanic', subtype: 'navmesh', label: 'NavMesh AI' },
    ]
  },
  {
    category: 'Assets',
    items: [
      { type: 'prop', subtype: 'prop', label: '3D Prop' },
      { type: 'prop', subtype: 'vehicle', label: 'Vehicle Model' },
      { type: 'prop', subtype: 'material', label: 'Texture / Material' },
    ]
  }
];