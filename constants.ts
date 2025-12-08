
import { StyleDNA, NodeType } from './types';
import { 
  Layout, Map, Image as ImageIcon, User, Box, 
  Flag, CloudRain, Film, Star, Ghost, Sword, Car, Trees, Skull 
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
};

// Asset Library Structure
export const ASSET_LIBRARY = [
  {
    category: 'World Building',
    items: [
      { type: 'world', subtype: 'world', label: 'World Map' },
      { type: 'zone', subtype: 'zone', label: 'Zone / Region' },
      { type: 'zone', subtype: 'biome', label: 'Biome' },
      { type: 'world', subtype: 'faction', label: 'Faction' },
    ]
  },
  {
    category: 'Narrative & Scenes',
    items: [
      { type: 'scene', subtype: 'scene', label: 'Environment' },
      { type: 'scene', subtype: 'storyboard', label: 'Storyboard' },
      { type: 'scene', subtype: 'key_art', label: 'Key Art' },
    ]
  },
  {
    category: 'Characters',
    items: [
      { type: 'character', subtype: 'protagonist', label: 'Protagonist' },
      { type: 'character', subtype: 'npc', label: 'NPC' },
      { type: 'character', subtype: 'creature', label: 'Creature' },
      { type: 'character', subtype: 'villain', label: 'Boss / Villain' },
    ]
  },
  {
    category: 'Assets & Props',
    items: [
      { type: 'prop', subtype: 'weapon', label: 'Weapon' },
      { type: 'prop', subtype: 'vehicle', label: 'Vehicle' },
      { type: 'prop', subtype: 'vegetation', label: 'Vegetation' },
      { type: 'prop', subtype: 'prop', label: 'Generic Prop' },
    ]
  },
];
