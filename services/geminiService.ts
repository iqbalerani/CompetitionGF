
import { GoogleGenAI, Type } from "@google/genai";
import { StyleDNA, BlueprintParams } from "../types";

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
  context?: string
): Promise<string | null> => {
  try {
    const ai = getAiClient();
    // Using flash-image for generation as per guidelines
    const model = "gemini-2.5-flash-image"; 

    // Construct a rich prompt merging the specific request with the Style DNA
    const fullPrompt = `
      Concept art for a game. ${prompt}.
      ${context ? `Context: ${context}` : ''}
      Art Style: ${styleDNA.artStyle.rendering}, influenced by ${styleDNA.artStyle.influences.join(', ')}.
      Lighting: ${styleDNA.lighting.style}, intensity ${styleDNA.lighting.intensity}.
      Colors: ${styleDNA.colorPalette.mood} mood, palette: ${styleDNA.colorPalette.primary.join(', ')}.
      Camera: ${styleDNA.camera.angle}, FOV ${styleDNA.camera.fov}.
      High quality, production ready, 4k.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: fullPrompt }],
      },
    });

    // Check for inline data (image)
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
    // Return a placeholder if generation fails (e.g., due to safety or limits)
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
      
      CORE CONCEPT: ${params.prompt}
      PLATFORM: ${params.platform}
      PERSPECTIVE: ${params.perspective}
      GENRE: ${params.genre || 'Not specified'}
      ART STYLE: ${params.artStyle || 'Not specified'}
      KEY MECHANICS: ${params.mechanics || 'Not specified'}
      TARGET AUDIENCE: ${params.audience || 'General'}

      The output must include a main World, 2-3 Zones, 1-2 Factions, key Scenes, a Protagonist, a Villain, and some unique Props/Weapons that fit this specific design.
      Ensure strict logical connection: World -> Zones -> Scenes -> Characters/Props.
      
      Valid Types: 'world', 'zone', 'scene', 'character', 'prop'.
      Valid Subtypes: 
        - world: 'world', 'faction'
        - zone: 'zone', 'biome'
        - scene: 'scene', 'key_art'
        - character: 'protagonist', 'npc', 'creature', 'villain'
        - prop: 'weapon', 'vehicle', 'prop'

      Return a JSON object with 'gameTitle', 'nodes' (array), and 'edges' (array).
      Ensure IDs are unique strings (e.g., 'n1', 'n2').
      Descriptions should be vivid and visual (max 20 words) and specifically tailored to the requested Genre and Mechanics.
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
