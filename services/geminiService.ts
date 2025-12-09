import { GoogleGenAI, Type } from "@google/genai";
import { StyleDNA, BlueprintParams, GameMode } from "../types";
import { DEFAULT_STYLE_DNA } from "../constants";

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
  context: string,
  existingDescription?: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const targetType = subtype || nodeType;
    let prompt = "";

    if (existingDescription && existingDescription.trim().length > 0) {
       // Enhance existing user input
       prompt = `
        You are a creative director for a game studio.
        Enhance and refine the following description for a ${targetType} named "${nodeName}".

        USER INPUT: "${existingDescription}"
        
        Context/Influences: ${context}
        
        Instructions:
        - Keep the core intent of the user's input but make it more vivid and descriptive.
        - Focus on visual details suitable for concept art generation.
        - Fix any grammar issues and make it sound professional.
        - Keep it under 60 words.
        - Output exactly the enhanced description, nothing else.
       `;
    } else {
       // Generate from scratch
       prompt = `
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
    }

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

export const generateAdaptiveStyleDNA = async (
  params: BlueprintParams | string
): Promise<StyleDNA | null> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";

    let inputDescription = "";
    let gameMode = "3D";

    if (typeof params === 'string') {
      inputDescription = params;
    } else {
      inputDescription = `
        Core Concept: ${params.prompt}
        Genre: ${params.genre}
        Platform: ${params.platform}
        Audience: ${params.audience}
        Art Intent: ${params.artStyle}
        Perspective: ${params.perspective}
      `;
      gameMode = params.gameMode;
    }

    const prompt = `
      Act as an Art Director.
      Create a "Style DNA" visual guide configuration for a game based on the description below.
      The output must be a JSON object matching the schema.

      GAME DESCRIPTION:
      ${inputDescription}

      CRITICAL INSTRUCTIONS:
      1. Game Mode is: ${gameMode}. 
         - If '2D': Adapt the 'texture' and 'rendering' for 2D (e.g., 'Pixel Art', 'Vector', 'Hand-drawn').
         - If '3D': Adapt for 3D (e.g., 'Low Poly', 'PBR Realistic', 'Cel Shaded').
      2. 'era' should define the visual period (e.g., '8-bit Retro', '90s Arcade', 'PS1 Era', 'Modern', 'Futuristic').
      3. 'texture' should define the surface detail style (e.g., 'Noisy Pixel', 'Flat', 'High-Res Diffuse', 'Painterly').
      4. Colors should be cohesive.
      5. Mood/Lighting should match the genre.

      Output JSON format only.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            version: { type: Type.STRING },
            colorPalette: {
              type: Type.OBJECT,
              properties: {
                primary: { type: Type.ARRAY, items: { type: Type.STRING } },
                accent: { type: Type.ARRAY, items: { type: Type.STRING } },
                mood: { type: Type.STRING, enum: ['warm', 'cool', 'neutral', 'vibrant', 'muted'] }
              },
              required: ['primary', 'accent', 'mood']
            },
            lighting: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING, enum: ['natural', 'studio', 'dramatic', 'soft', 'hard'] },
                intensity: { type: Type.NUMBER }
              },
              required: ['style', 'intensity']
            },
            camera: {
              type: Type.OBJECT,
              properties: {
                fov: { type: Type.NUMBER },
                angle: { type: Type.STRING, enum: ['eye_level', 'low_angle', 'high_angle'] }
              },
              required: ['fov', 'angle']
            },
            artStyle: {
              type: Type.OBJECT,
              properties: {
                rendering: { type: Type.STRING },
                era: { type: Type.STRING },
                texture: { type: Type.STRING },
                influences: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['rendering', 'era', 'texture', 'influences']
            }
          },
          required: ['name', 'colorPalette', 'lighting', 'camera', 'artStyle']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as StyleDNA;
    }
    return null;

  } catch (error) {
    console.error("Style DNA Generation Error:", error);
    return null;
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

    // Safely handle potentially missing new fields if using old DNA
    const era = styleDNA.artStyle.era || "Modern";
    const texture = styleDNA.artStyle.texture || "Detailed";

    const fullPrompt = `
      Create game concept art / asset.
      Type: ${nodeSubtype || nodeType}.
      Subject: ${prompt}.
      ${context ? `Context: ${context}` : ''}
      
      Mode: ${gameMode} Game Asset.
      ${perspectiveInstruction}
      
      Specific Structural Requirement: ${typeInstruction}
      
      VISUAL STYLE (Strict Adherence):
      - Era/Vibe: ${era}
      - Texture Style: ${texture}
      - Rendering: ${styleDNA.artStyle.rendering}
      - Influences: ${styleDNA.artStyle.influences.join(', ')}
      - Lighting: ${styleDNA.lighting.style} (${styleDNA.lighting.intensity * 100}% intensity)
      - Colors: ${styleDNA.colorPalette.mood} mood, Dominant: ${styleDNA.colorPalette.primary.join(', ')}.
      
      Ensure the output matches the "${era}" aesthetic perfectly. 
      If 'Pixel Art', ensure crisp pixels. 
      If 'Low Poly', ensure sharp facets.
      If 'Nintendo-like', ensure vibrant, clean, rounded shapes.
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

export const generateDepthMap = async (originalImageBase64: string): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash-image";

    // Extract raw base64 data if it has the data prefix
    const base64Data = originalImageBase64.split(',')[1] || originalImageBase64;

    const prompt = `
      Generate a high-quality grayscale DEPTH MAP for the provided image.
      - White represents pixels closest to the camera.
      - Black represents pixels furthest away.
      - Ensure smooth gradients to create a high-quality 3D displacement effect.
      - Do not change the composition, just output the depth information.
      - High contrast is preferred.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data
            }
          },
          { text: prompt }
        ]
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
    console.error("Depth Map Generation Error:", error);
    return null;
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
       
       let imageRef = "undefined";
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
      Generate a SINGLE HTML file containing a playable game prototype.
      
      TARGET SPEC:
      - Mode: ${gameMode} (CRITICAL: Use ${gameMode === '3D' ? 'Three.js' : 'HTML5 Canvas API'})
      - Title: Game Prototype
      - Visual Theme: ${styleDNA.colorPalette.mood} / ${styleDNA.artStyle.era}
      
      BLUEPRINT DATA:
      ${contextNodes}
      
      CRITICAL IMPLEMENTATION REQUIREMENTS:
      
      1. HTML STRUCTURE:
         - <style> 
             body { margin: 0; overflow: hidden; background: #000; } 
             canvas { display: block; position: absolute; top: 0; left: 0; z-index: 0; } 
             #ui-layer { 
                position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                display: flex; flex-direction: column; justify-content: center; align-items: center; 
                background: rgba(0,0,0,0.8); color: white; font-family: sans-serif; z-index: 10; 
                transition: opacity 0.5s; 
             } 
             .hidden { opacity: 0; pointer-events: none; } 
           </style>
         - <div id="game-container"></div>
         - <div id="ui-layer">
             <h1 style="font-size: 3rem; margin-bottom: 20px; text-shadow: 0 0 20px ${styleDNA.colorPalette.primary[0] || '#fff'};">${styleDNA.name || 'Game Prototype'}</h1>
             <p style="margin-bottom: 30px; font-size: 1.2rem;">Use WASD or Arrows to Move. Space to Interact.</p>
             <button id="start-btn" style="
               padding: 15px 40px; font-size: 20px; font-weight: bold; cursor: pointer; 
               background: ${styleDNA.colorPalette.accent[0] || '#f00'}; 
               color: white; border: none; border-radius: 8px; box-shadow: 0 0 15px ${styleDNA.colorPalette.accent[0] || '#f00'};
               transition: transform 0.1s;
             ">START GAME</button>
           </div>
           
      2. GAME LOGIC (SCRIPT):
         - Initialize the engine (${gameMode === '3D' ? 'Three.js scene, camera, renderer' : 'Canvas context'}) IMMEDIATELY upon load. Do NOT wait for start button to render the initial background.
         - GAME STATE: Create a variable 'isPlaying = false'.
         - START INTERACTION: 
             document.getElementById('start-btn').addEventListener('click', () => {
                document.getElementById('ui-layer').classList.add('hidden');
                isPlaying = true;
                // Init audio context if needed here
             });
             
         - GAME LOOP:
             function animate() {
                requestAnimationFrame(animate);
                
                // ALWAYS RENDER THE SCENE (background/idle animation)
                ${gameMode === '3D' ? 'renderer.render(scene, camera);' : 'ctx.clearRect(0,0,cw,ch); drawBackground();'}
                
                if (isPlaying) {
                   updatePhysics();
                   updatePlayer();
                   ${gameMode === '2D' ? 'drawGameEntities();' : ''}
                } else {
                   // Optional: Rotate camera or background idle animation
                }
             }
             animate();
           
      3. ${gameMode === '3D' ? 'THREE.JS SPECIFICS' : '2D CANVAS SPECIFICS'}:
         ${gameMode === '3D' ? `
         - Import Three.js: <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
         - Setup: Scene, PerspectiveCamera (pos z:10, y:5), WebGLRenderer (setSize window.innerWidth/Height).
         - Lights: AmbientLight (0.5) AND DirectionalLight (1.0) so models are visible.
         - Environment: Create a large PlaneGeometry for the ground (color: ${styleDNA.colorPalette.primary[0] || '#333'}).
         - Player: BoxGeometry or Sprite. Map 'AssetReference' texture if available.
         ` : `
         - Canvas: Get context '2d'. Set canvas width/height to window.innerWidth/Height.
         - Background: FillRect with ${styleDNA.colorPalette.primary[0] || '#111'}.
         - Player: DrawRect or drawImage.
         `}
         
      4. ASSET HANDLING:
         - I will provide placeholders like "__GAMEFORGE_ASSET_X__".
         - Use these strings directly in the code (e.g. img.src = "__GAMEFORGE_ASSET_X__").
         - CRITICAL: Handle async loading. If an image is loading or fails, draw a fallback colored box so the game is still playable.
         
      5. MECHANICS:
         - Implement WASD / Arrow Key movement.
         - Keep player within screen/map bounds.
         - Add at least one interactive element from the blueprint (e.g., a pickup or obstacle).
         
      OUTPUT RAW HTML ONLY. NO MARKDOWN. DO NOT WRAP IN \`\`\`.
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