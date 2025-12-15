/**
 * Bria FIBO Service - JSON-Native Image Generation
 *
 * This service integrates Bria's FIBO model for text-to-image generation.
 * FIBO is trained exclusively on 1+ billion fully licensed images, making it
 * ideal for commercial game development.
 *
 * Key Features:
 * - JSON-native controllability through structured parameters
 * - Style DNA → FIBO parameter mapping for consistency
 * - Aspect ratio optimization per game asset type
 * - Commercially licensed outputs
 */

import * as fal from "@fal-ai/serverless-client";
import { StyleDNA, GameMode, NodeType } from "../types";

// Initialize Fal.ai client for Bria FIBO access
const initializeFalClient = () => {
  const apiKey = import.meta.env.VITE_BRIA_API_KEY;
  if (!apiKey || apiKey === 'your_fal_ai_api_key_here') {
    console.warn('');
    console.warn("⚠️ ⚠️ ⚠️  MISSING FIBO API KEY  ⚠️ ⚠️ ⚠️");
    console.warn("VITE_BRIA_API_KEY not found or using placeholder.");
    console.warn("FIBO image generation will fail with 401 errors.");
    console.warn("See API_KEY_SETUP_GUIDE.md for setup instructions.");
    console.warn('');
  }
  fal.config({
    credentials: apiKey || 'dummy-key'
  });
};

// Initialize on module load
initializeFalClient();

/**
 * Maps game asset node types to optimal aspect ratios for FIBO generations
 */
const getAspectRatioForNodeType = (nodeType: string, gameMode: GameMode): string => {
  // Aspect ratios optimized for different game asset types
  const aspectRatioMap: Record<string, string> = {
    // Environments - Wide formats
    'world': '16:9',
    'tilemap': '16:9',
    'level': '16:9',
    'parallax': '21:9', // Extra wide for parallax layers
    'skybox': '16:9',
    'terrain': '16:9',
    'zone': '16:9',
    'biome': '16:9',
    'scene': '16:9',
    'key_art': '16:9',

    // Characters - Portrait/Square formats
    'protagonist': '3:4', // Taller for character portraits
    'npc': '3:4',
    'villain': '3:4',
    'creature': '3:4',
    'boss': '3:4',
    'portrait': '3:4',
    'sprite_sheet': '1:1', // Square for sprite sheets
    'mesh': '1:1', // Square for 3D model renders
    'character': '3:4',

    // Props & Items - Square formats
    'weapon': '1:1',
    'vehicle': '4:3',
    'prop': '1:1',
    'icon': '1:1',
    'pickup': '1:1',
    'material': '1:1',

    // UI Elements - Wide formats
    'hud': '16:9',
    'menu': '16:9',
    'inventory': '16:9',
    'ui': '16:9',

    // Mechanics - Wide diagrams
    'mechanic': '16:9',
    'system': '16:9',
    'loop': '16:9',
    'physics': '16:9',
    'platforming': '16:9',
  };

  return aspectRatioMap[nodeType] || (gameMode === '2D' ? '16:9' : '4:3');
};

/**
 * Converts Style DNA configuration to FIBO-compatible JSON parameters
 * This mapping enables consistent art direction across all generated assets
 */
const styleDNAToFIBOParams = (styleDNA: StyleDNA, nodeType: string, gameMode: GameMode) => {
  // Build comprehensive style description from Style DNA
  const styleElements = [];

  // Art Style & Era
  styleElements.push(`${styleDNA.artStyle.era} style`);
  styleElements.push(`${styleDNA.artStyle.rendering} rendering`);
  styleElements.push(`${styleDNA.artStyle.texture} textures`);

  // Lighting
  const lightIntensity = styleDNA.lighting.intensity > 0.7 ? 'bright' :
                         styleDNA.lighting.intensity > 0.4 ? 'balanced' : 'dim';
  styleElements.push(`${styleDNA.lighting.style} ${lightIntensity} lighting`);

  // Color Palette
  const colorDesc = `${styleDNA.colorPalette.mood} color mood with ${styleDNA.colorPalette.primary.join(', ')} tones`;
  styleElements.push(colorDesc);

  // Camera/Composition
  styleElements.push(`${styleDNA.camera.angle.replace('_', ' ')} camera angle`);

  // Game Mode specific
  if (gameMode === '2D') {
    styleElements.push('flat 2D composition, no perspective distortion');
  } else {
    styleElements.push('3D perspective with depth');
  }

  // Art influences
  if (styleDNA.artStyle.influences.length > 0) {
    styleElements.push(`inspired by ${styleDNA.artStyle.influences.join(', ')}`);
  }

  return {
    stylePrompt: styleElements.join(', '),
    aspectRatio: getAspectRatioForNodeType(nodeType, gameMode),
    // FIBO-specific advanced parameters
    composition: styleDNA.fibo?.composition || 'centered',
    detailLevel: styleDNA.fibo?.detail_level || 'high',
    styleStrength: styleDNA.fibo?.style_strength || 0.75,
    negativePrompt: styleDNA.fibo?.negative_prompt || 'blurry, low quality, distorted, deformed',
    seed: styleDNA.fibo?.seed,
    numInferenceSteps: styleDNA.fibo?.num_inference_steps || 30,
  };
};

/**
 * Type-specific generation instructions optimized for game assets
 * These align with the TYPE_SPECIFIC_INSTRUCTIONS in geminiService but are
 * formatted for FIBO's generation style
 */
const getTypeSpecificGuidance = (nodeType: string, gameMode: GameMode): string => {
  const guidance: Record<string, string> = {
    // 2D specific
    'tilemap': '2D orthogonal tile grid, modular seamless tiles, ground and wall variants',
    'sprite_sheet': 'character sprite animation frames, uniform scale, transparent background style',
    'parallax': 'wide seamless horizontal background layer, atmospheric depth',
    'level': 'top-down level layout, clear paths and obstacles, game design blueprint',
    'icon': '2D game item icon, square composition, high contrast, small size readability',
    'portrait': 'expressive character face, detailed facial features, portrait framing',

    // 3D specific
    'terrain': '3D terrain with elevation, textured landscape, heightmap style',
    'mesh': '3D character model render, clean geometry, model sheet view',
    'skybox': 'panoramic sky environment, seamless horizon, atmospheric lighting',
    'rig': '3D character skeleton and joints visible, technical wireframe overlay',

    // Universal
    'protagonist': 'hero character design, full body, distinctive silhouette, equipment visible',
    'npc': 'non-player character, standing pose, profession-appropriate attire',
    'boss': 'intimidating boss design, larger scale, dramatic pose',
    'weapon': 'detailed weapon concept, clear mechanism, side profile view',
    'vehicle': 'vehicle design concept, functional form, dynamic angle',
    'hud': 'game HUD overlay design, UI elements, health bars, mini-map frame',
    'menu': 'game menu interface, button layout, title placement, panel design',
  };

  return guidance[nodeType] || '';
};

/**
 * Builds the final prompt by combining user description, context, and style guidance
 */
const buildEnhancedPrompt = (
  userPrompt: string,
  nodeType: string,
  context: string,
  stylePrompt: string,
  gameMode: GameMode
): string => {
  const parts = [];

  // Type-specific structural requirements
  const typeGuidance = getTypeSpecificGuidance(nodeType, gameMode);
  if (typeGuidance) {
    parts.push(typeGuidance);
  }

  // User's description
  parts.push(userPrompt);

  // Parent context for coherence
  if (context && context.trim().length > 0) {
    parts.push(`Context: ${context}`);
  }

  // Style DNA elements
  parts.push(stylePrompt);

  return parts.join('. ');
};

/**
 * Generate game asset using Bria FIBO with JSON-native parameters
 *
 * @param prompt - User's description of the asset
 * @param styleDNA - Style DNA configuration for consistent art direction
 * @param nodeType - Type of game asset (affects aspect ratio and guidance)
 * @param nodeSubtype - More specific asset subtype
 * @param context - Parent node context for hierarchical coherence
 * @param gameMode - 2D or 3D game mode
 * @param perspectiveOverride - Optional specific perspective (Isometric, Top-Down, etc)
 * @returns Base64 encoded image or null on failure
 */
export const generateWithFIBO = async (
  prompt: string,
  styleDNA: StyleDNA,
  nodeType: string,
  nodeSubtype: string | undefined,
  context: string = "",
  gameMode: GameMode = '3D',
  perspectiveOverride?: string
): Promise<string | null> => {
  try {
    const targetType = nodeSubtype || nodeType;

    // Map Style DNA to FIBO parameters
    const fiboParams = styleDNAToFIBOParams(styleDNA, targetType, gameMode);

    // Handle perspective overrides (Isometric, VR, Top-Down, etc)
    let perspectiveGuidance = '';
    if (perspectiveOverride && perspectiveOverride !== gameMode) {
      if (perspectiveOverride === 'Isometric') {
        perspectiveGuidance = '3/4 isometric view, parallel projection, no vanishing point';
      } else if (perspectiveOverride === 'Top-Down') {
        perspectiveGuidance = 'directly overhead view, map perspective';
      } else if (perspectiveOverride === 'VR') {
        perspectiveGuidance = 'wide-angle immersive view, VR-ready composition';
      }
    }

    // Build comprehensive prompt
    let enhancedPrompt = buildEnhancedPrompt(
      prompt,
      targetType,
      context,
      fiboParams.stylePrompt,
      gameMode
    );

    if (perspectiveGuidance) {
      enhancedPrompt = `${perspectiveGuidance}. ${enhancedPrompt}`;
    }

    console.log('🎨 FIBO Generation Request:', {
      nodeType: targetType,
      gameMode,
      aspectRatio: fiboParams.aspectRatio,
      promptLength: enhancedPrompt.length
    });

    // Call Bria FIBO via Fal.ai
    // Using the bria/fibo/generate text-to-image model
    const result = await fal.subscribe("bria/fibo/generate", {
      input: {
        prompt: enhancedPrompt,
        aspect_ratio: fiboParams.aspectRatio,
        steps_num: fiboParams.numInferenceSteps,
        guidance_scale: 5, // Max value per API spec (3-5)
        negative_prompt: fiboParams.negativePrompt,
        // Use seed if specified for reproducibility
        ...(fiboParams.seed && { seed: fiboParams.seed }),
      },
      logs: false,
    }) as any;

    console.log('✅ FIBO Generation Success');

    // Extract image URL from response
    // Bria FIBO returns image in result.image.url (singular)
    if (result?.image?.url) {
      const imageUrl = result.image.url;

      // Convert to base64 for consistent storage
      // In production, you might want to store the URL directly
      const base64Image = await fetchImageAsBase64(imageUrl);
      return base64Image;
    }

    console.warn('⚠️ FIBO returned no image');
    return null;

  } catch (error: any) {
    console.error("❌ FIBO Generation Error:", error);

    // Provide helpful error messages based on error type
    if (error.status === 403 || error.message?.includes('403') || error.message?.includes('Forbidden')) {
      console.error('');
      console.error('🚨 PERMISSION DENIED - Fal.ai Account Issue');
      console.error('');
      console.error('Your API key is valid, but your account lacks permission to use Bria FIBO.');
      console.error('');
      console.error('Common causes:');
      console.error('  • No credits in your Fal.ai account');
      console.error('  • Payment method required');
      console.error('  • Bria FIBO model not enabled for your account');
      console.error('  • Free tier doesn\'t include FIBO access');
      console.error('');
      console.error('To fix this:');
      console.error('1. Visit https://fal.ai/dashboard');
      console.error('2. Check "Billing" or "Credits" section');
      console.error('3. Add payment method and/or purchase credits');
      console.error('4. Try the model in Fal.ai playground first: https://fal.ai/models/bria/fibo/generate');
      console.error('');
      console.error('See FAL_ACCOUNT_SETUP_GUIDE.md for detailed instructions.');
      console.error('');
    } else if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      console.error('');
      console.error('🚨 AUTHENTICATION ERROR - Invalid Fal.ai API Key');
      console.error('');
      console.error('Your VITE_BRIA_API_KEY is invalid, expired, or incorrectly formatted.');
      console.error('');
      console.error('To fix this:');
      console.error('1. Visit https://fal.ai/dashboard');
      console.error('2. Generate a new API key');
      console.error('3. Update VITE_BRIA_API_KEY in your .env.local file');
      console.error('4. Restart dev server: npm run dev');
      console.error('');
      console.error('See API_KEY_SETUP_GUIDE.md for detailed instructions.');
      console.error('');
    } else if (error.message?.includes('credentials') || error.message?.includes('API key')) {
      console.error('Please set VITE_BRIA_API_KEY in your .env.local file');
    } else if (error.status === 404) {
      console.error('Model endpoint not found. Verify "bria/fibo/generate" is correct.');
    } else if (error.status === 429) {
      console.error('Rate limit exceeded. Wait a moment and try again.');
    }

    // Return null to allow fallback handling
    return null;
  }
};

/**
 * Helper: Convert image URL to base64 for consistent storage
 */
const fetchImageAsBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert image to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to base64:', error);
    // Return the URL as fallback
    return url;
  }
};

/**
 * Generate multiple variations of an asset with controlled parameter changes
 * Useful for A/B testing art direction or exploring options
 */
export const generateFIBOVariations = async (
  basePrompt: string,
  styleDNA: StyleDNA,
  nodeType: string,
  variationCount: number = 3,
  variationType: 'composition' | 'lighting' | 'seed' = 'seed'
): Promise<(string | null)[]> => {
  const variations: (string | null)[] = [];

  for (let i = 0; i < variationCount; i++) {
    // Modify Style DNA based on variation type
    const variantStyle = { ...styleDNA };

    if (variationType === 'seed' && variantStyle.fibo) {
      // Use different seeds for variations
      variantStyle.fibo.seed = Math.floor(Math.random() * 1000000);
    } else if (variationType === 'composition' && variantStyle.fibo) {
      // Cycle through composition types
      const compositions: ('centered' | 'rule_of_thirds' | 'dynamic')[] = ['centered', 'rule_of_thirds', 'dynamic'];
      variantStyle.fibo.composition = compositions[i % compositions.length];
    }

    const result = await generateWithFIBO(
      basePrompt,
      variantStyle,
      nodeType,
      undefined,
      '',
      '3D'
    );

    variations.push(result);
  }

  return variations;
};

/**
 * Extract FIBO parameters from a Style DNA configuration
 * Useful for debugging and JSON inspection in UI
 */
export const extractFIBOParams = (styleDNA: StyleDNA, nodeType: string, gameMode: GameMode) => {
  return styleDNAToFIBOParams(styleDNA, nodeType, gameMode);
};
