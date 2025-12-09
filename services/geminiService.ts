
import { GoogleGenAI, Type } from "@google/genai";
import { StyleDNA, BlueprintParams, GameMode } from "../types";

// In a real app, strict error handling would be here.
// We assume process.env.API_KEY is available as per instructions.

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
};

const TYPE_SPECIFIC_INSTRUCTIONS: Record<string, string> = {
  // World / Environment
  'tilemap': 'Create a flat, orthogonal 2D tile set grid. Include ground tiles, edge tiles, wall variants, and environmental details. Modular and seamless.',
  'level': 'Top-down level design schematic. Structural blueprint view. Show clear pathing, collision zones, platforms, and obstacle placement. Game design layout.',
  'world': 'Stylized world map. Cartographic style with distinct biomes, landmarks, and travel routes. Top-down view.',
  'parallax': 'Wide, horizontally seamless background layers. Distinct depth separation (foreground, midground, background). Atmospheric perspective.',
  'skybox': 'Equirectangular skybox texture. Seamless horizon line. Atmospheric lighting (clouds, stars, sun).',
  'terrain': '3D terrain heightmap or textured landscape render. Isometric or perspective view showing elevation changes.',
  
  // Characters
  'sprite_sheet': 'Character sprite sheet sequence. Uniform scale. Idle, walk, run, and jump frames. Transparent background styling.',
  'protagonist': 'Hero character concept art. Full body pose showing equipment and personality. Distinctive silhouette.',
  'npc': 'Non-player character design. Standing pose with profession-related attire.',
  'boss': 'Boss monster design. Intimidating scale, distinct weak points or visual flair.',
  'portrait': 'Expressive character face portrait. High detail, focused on emotion and facial features.',

  // UI
  'hud': 'In-game Heads Up Display (HUD) overlay. Health bars, mini-map frame, ability icons, and status indicators. UX interface design.',
  'menu': 'Game menu screen layout. Button containers, title logo placement, background paneling. UI/UX wireframe style.',
  'inventory': 'Grid-based inventory system UI. Slot containers, item borders, and panel background.',
  'icon': '2D Item Icon. Square composition. High readability at small sizes. Symbolic representation.',

  // Props / Mechanics
  'weapon': 'Weapon concept art. Clear side profile (for 2D) or perspective view (for 3D). Focus on mechanism and material.',
  'vehicle': 'Vehicle design. Clear form and function.',
  'pickup': 'Floating game pickup item. Glow effect or outline. Distinct silhouette for readability.',
  'platforming': 'Platforming mechanic diagram. Showing jump arcs, moving platforms, and player traversal logic.',
  'physics': 'Physics interaction diagram. Showing collision, gravity, or object manipulation.',
};

export const generateDescription = async (
  nodeType: string,
  subtype: string | undefined,
  nodeName: string,
  context: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const targetType = subtype || nodeType;

    const prompt = `
      You are a creative director for a game studio.
      Write a concise, vivid visual description (max 50 words) for a ${targetType} named "${nodeName}".
      
      Context/Influences: ${context}
      
      Instructions:
      - Focus on visual elements suitable for concept art generation.
      - If it is a 'tilemap', describe the textures and ground types.
      - If it is a 'level', describe the layout structure and obstacles.
      - If it is a 'ui' element, describe the shapes, colors, and layout.
      
      Output exactly the description, nothing else.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || "A mysterious entity awaiting definition.";
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return `Failed to generate description for ${nodeName}.`;
  }
};

export const generateGameAsset = async (
  prompt: string,
  styleDNA: StyleDNA,
  nodeType: string,
  nodeSubtype: string | undefined,
  context: string = "",
  gameMode: GameMode = '3D',
  perspectiveOverride?: string
): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash-image"; 

    // Adjust instructions based on Game Mode and Perspective Override
    let perspectiveInstruction = "";
    
    if (perspectiveOverride && perspectiveOverride !== gameMode) {
      // User has explicitly chosen a perspective in the blueprint wizard (e.g. Isometric, VR)
      perspectiveInstruction = `Perspective: STRICTLY ${perspectiveOverride}.`;
      if (perspectiveOverride === 'Isometric') {
        perspectiveInstruction += " 3/4 view, parallel projection, no vanishing point. Suitable for isometric game assets.";
      } else if (perspectiveOverride === 'Top-Down') {
        perspectiveInstruction += " Directly from above. Map or plan view.";
      } else if (perspectiveOverride === 'VR') {
        perspectiveInstruction += " Immersive wide-angle or stereoscopic-ready composition.";
      }
    } else {
      // Fallback to standard Game Mode logic
      if (gameMode === '2D') {
        perspectiveInstruction = "Perspective: Strictly 2D. Flat, orthographic, or side-scrolling. No perspective distortion unless isometric. Clean lines, suitable for sprites or UI.";
      } else {
        perspectiveInstruction = "Perspective: 3D, cinematic, immersive depth. High fidelity rendering suitable for Unreal Engine 5 or Unity HDRP assets.";
      }
    }

    // Get type-specific instructions
    const typeInstruction = TYPE_SPECIFIC_INSTRUCTIONS[nodeSubtype || ''] || TYPE_SPECIFIC_INSTRUCTIONS[nodeType] || "";

    const fullPrompt = `
      Create game concept art / asset.
      Type: ${nodeSubtype || nodeType}.
      Subject: ${prompt}.
      ${context ? `Context: ${context}` : ''}
      
      Mode: ${gameMode} Game Asset.
      ${perspectiveInstruction}
      
      Specific Structural Requirement: ${typeInstruction}
      
      Art Style: ${styleDNA.artStyle.rendering}, influenced by ${styleDNA.artStyle.influences.join(', ')}.
      Lighting: ${styleDNA.lighting.style}, intensity ${styleDNA.lighting.intensity}.
      Colors: ${styleDNA.colorPalette.mood} mood, palette: ${styleDNA.colorPalette.primary.join(', ')}.
      
      Ensure the output is a high-quality, production-ready asset for a game developer.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: fullPrompt }],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    return `https://picsum.photos/seed/${Math.random()}/512/512`;
  }
};

interface BlueprintNode {
  id: string;
  type: string;
  subtype: string;
  label: string;
  description: string;
}

interface BlueprintEdge {
  source: string;
  target: string;
}

interface BlueprintResponse {
  gameTitle: string;
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
}

export const generateFullGameBlueprint = async (params: BlueprintParams): Promise<BlueprintResponse | null> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";

    const prompt = `
      Act as a Lead Game Designer. Create a cohesive game design blueprint based on the following specification:
      
      GAME MODE: ${params.gameMode} (Critical: Ensure all assets and descriptions match this mode).
      CORE CONCEPT: ${params.prompt}
      PLATFORM: ${params.platform}
      PERSPECTIVE: ${params.perspective}
      GENRE: ${params.genre || 'Not specified'}
      ART STYLE: ${params.artStyle || 'Not specified'}
      KEY MECHANICS: ${params.mechanics || 'Not specified'}
      TARGET AUDIENCE: ${params.audience || 'General'}

      The output must include:
      1. Main World/Map
      2. 2-3 Zones/Levels (Use 'Tilemap' or 'Level Layout' if 2D, 'Terrain' if 3D)
      3. Key Scenes
      4. Protagonist & Antagonist
      5. Core Mechanics (Use 'mechanic' type)
      6. UI Elements (Use 'ui' type)
      
      Ensure strict logical connection: World -> Zones -> Scenes -> Characters/Mechanics/UI.
      
      Valid Types: 'world', 'zone', 'scene', 'character', 'prop', 'mechanic', 'ui'.
      Valid Subtypes (Prioritize based on ${params.gameMode}): 
        - world: 'world', 'faction'
        - zone: 'zone', 'biome', 'tilemap' (2D), 'level' (2D), 'terrain' (3D), 'skybox' (3D), 'parallax' (2D)
        - scene: 'scene', 'key_art', 'storyboard'
        - character: 'protagonist', 'npc', 'creature', 'villain', 'sprite_sheet' (2D), 'mesh' (3D), 'rig' (3D), 'portrait' (2D)
        - prop: 'weapon', 'vehicle', 'prop', 'icon' (2D), 'pickup'
        - mechanic: 'system', 'loop', 'physics', 'platforming'
        - ui: 'hud', 'menu', 'inventory'

      Return a JSON object with 'gameTitle', 'nodes' (array), and 'edges' (array).
      Ensure IDs are unique strings (e.g., 'n1', 'n2').
      Descriptions should be vivid and visual (max 20 words).
      For 'tilemap' or 'level' nodes, describe the layout structure specifically.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gameTitle: { type: Type.STRING },
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  subtype: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["id", "type", "subtype", "label", "description"]
              }
            },
            edges: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                },
                required: ["source", "target"]
              }
            }
          },
          required: ["gameTitle", "nodes", "edges"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as BlueprintResponse;
    }
    return null;

  } catch (error) {
    console.error("Gemini Blueprint Generation Error:", error);
    return null;
  }
};

export const generatePlayableGame = async (
  nodes: any[], 
  gameMode: string, 
  styleDNA: StyleDNA
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash"; 

    // Construct a rich context with node descriptions and placeholders for images
    // We use placeholders to prevent hitting token limits with large base64 strings
    const contextNodes = nodes.map(n => {
       const hasImage = !!n.data.image;
       
       let imageRef = "No image available";
       if (hasImage) {
         imageRef = `__GAMEFORGE_ASSET_${n.id}__`;
       }

       return `
         Node ID: ${n.id}
         Type: ${n.data.subtype || n.data.type}
         Label: "${n.data.label}"
         Description: ${n.data.description}
         AssetReference: ${imageRef}
       `;
    }).join('\n----------------\n');

    const prompt = `
      Act as a Senior Game Engine Developer and Creative Coder.
      Create a fully functional, playable single-file HTML5 game based on the following Design Blueprint.
      
      GAME SETTINGS:
      - Mode: ${gameMode}
      - Mood: ${styleDNA.colorPalette.mood}
      - Primary Colors: ${styleDNA.colorPalette.primary.join(', ')}
      - Accent Colors: ${styleDNA.colorPalette.accent.join(', ')}
      
      BLUEPRINT & ASSETS:
      ${contextNodes}
      
      TECHNICAL REQUIREMENTS:
      1. Output a SINGLE HTML file containing all CSS, HTML, and JavaScript.
      2. If 3D: Use Three.js (Must import via CDN: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js).
      3. If 2D: Use HTML5 Canvas API (Context 2D) - no external libraries unless absolutely necessary (e.g. Phaser via CDN).
      4. IMPLEMENTATION DETAILS:
         - Create a game loop (requestAnimationFrame).
         - Implement player movement (WASD/Arrows).
         - Implement at least one core mechanic derived from the blueprint (e.g., shooting, jumping, collecting).
         - CRITICAL: For object textures/sprites, use the exact string provided in 'AssetReference' (e.g., "__GAMEFORGE_ASSET_1__") as the image source URL or texture path.
         - Do NOT put base64 data in the code yourself. Just use the placeholder string as a string literal.
         - If an object has "No image available", use procedural geometry (colored rectangles/cubes) matching the Style DNA colors.
         - Handle window resizing.
         - Add a simple UI overlay with the Game Title and Controls instructions.
         - Ensure the camera perspective matches the requested mode (${gameMode} - ${styleDNA.camera.angle}).
      
      CRITICAL: The output must be raw HTML code only. Do not wrap it in markdown blocks (no \`\`\`html).
      Ensure the code is complete and does not cut off.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    let code = response.text || "";
    // Cleanup if the model wraps it despite instructions
    code = code.replace(/```html/g, '').replace(/```/g, '');

    // Inject the actual Base64 data back into the generated code
    nodes.forEach(n => {
        if (n.data.image) {
            const placeholder = `__GAMEFORGE_ASSET_${n.id}__`;
            // Use split/join to replace all occurrences of the placeholder with the large base64 string
            code = code.split(placeholder).join(n.data.image);
        }
    });

    return code;

  } catch (error) {
    console.error("Game Generation Error:", error);
    return `
      <html>
        <body style="background:#111; color: #f55; font-family: monospace; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <div style="text-align: center">
            <h1>Game Build Failed</h1>
            <p>The AI could not compile the game prototype at this time.</p>
            <p>Error: ${error instanceof Error ? error.message : JSON.stringify(error)}</p>
          </div>
        </body>
      </html>
    `;
  }
};
