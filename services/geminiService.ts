
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

export const generateDescription = async (
  nodeType: string,
  nodeName: string,
  context: string
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash";
    
    const prompt = `
      You are a creative director for a game studio.
      Write a concise, vivid visual description (max 50 words) for a ${nodeType} named "${nodeName}".
      Context/Influences: ${context}
      Focus on visual elements suitable for concept art generation.
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
  context: string = "",
  gameMode: GameMode = '3D'
): Promise<string | null> => {
  try {
    const ai = getAiClient();
    const model = "gemini-2.5-flash-image"; 

    // Adjust instructions based on Game Mode
    let perspectiveInstruction = "";
    if (gameMode === '2D') {
      perspectiveInstruction = "Perspective: 2D, flat, side-scrolling or top-down (as per context). Avoid 3D perspective distortion. Clean lines, sprite-sheet ready styling where applicable.";
    } else {
      perspectiveInstruction = "Perspective: 3D, cinematic, immersive depth. High fidelity rendering suitable for Unreal Engine 5 or Unity HDRP assets.";
    }

    const fullPrompt = `
      Create game concept art.
      Subject: ${prompt}.
      ${context ? `Context: ${context}` : ''}
      Mode: ${gameMode} Game Asset.
      ${perspectiveInstruction}
      
      Art Style: ${styleDNA.artStyle.rendering}, influenced by ${styleDNA.artStyle.influences.join(', ')}.
      Lighting: ${styleDNA.lighting.style}, intensity ${styleDNA.lighting.intensity}.
      Colors: ${styleDNA.colorPalette.mood} mood, palette: ${styleDNA.colorPalette.primary.join(', ')}.
      Camera: ${styleDNA.camera.angle}, FOV ${styleDNA.camera.fov}.
      
      High quality, production ready.
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
        - zone: 'zone', 'biome', 'tilemap' (2D), 'level' (2D), 'terrain' (3D), 'skybox' (3D)
        - scene: 'scene', 'key_art', 'storyboard'
        - character: 'protagonist', 'npc', 'creature', 'villain', 'sprite_sheet' (2D), 'mesh' (3D), 'rig' (3D)
        - prop: 'weapon', 'vehicle', 'prop', 'icon' (2D), 'pickup'
        - mechanic: 'system', 'loop', 'physics', 'platforming'
        - ui: 'hud', 'menu', 'inventory'

      Return a JSON object with 'gameTitle', 'nodes' (array), and 'edges' (array).
      Ensure IDs are unique strings (e.g., 'n1', 'n2').
      Descriptions should be vivid and visual (max 20 words).
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
