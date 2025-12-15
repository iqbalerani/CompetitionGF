/**
 * OpenRouter API Client
 *
 * Provides a unified interface for calling OpenRouter's API
 * Currently configured to use Google Gemini models via OpenRouter
 */

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Get OpenRouter configuration from environment
 * NOTE: Using import.meta.env (Vite) instead of process.env
 */
const getOpenRouterConfig = () => {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const model = import.meta.env.VITE_MODEL || 'google/gemini-2.5-flash-lite';

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    console.warn('');
    console.warn('⚠️ ⚠️ ⚠️  MISSING OPENROUTER API KEY  ⚠️ ⚠️ ⚠️');
    console.warn('VITE_OPENROUTER_API_KEY not found or using placeholder.');
    console.warn('Text generation (blueprints, descriptions, game code) will fail.');
    console.warn('Get your key from: https://openrouter.ai/keys');
    console.warn('');
  }

  return { apiKey, model };
};

/**
 * Call OpenRouter API for text generation
 *
 * @param prompt - The prompt to send
 * @param options - Optional configuration
 * @returns The generated text
 */
export async function generateText(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<string> {
  const { apiKey, model } = getOpenRouterConfig();

  const messages: OpenRouterMessage[] = [];

  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const requestBody: OpenRouterRequest = {
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gameforge.app', // Optional: for OpenRouter analytics
        'X-Title': 'GameForge', // Optional: for OpenRouter analytics
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    const content = data.choices[0].message.content;

    // Log token usage for debugging
    if (data.usage) {
      console.log('🔢 OpenRouter tokens:', {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens
      });
    }

    return content;

  } catch (error) {
    console.error('❌ OpenRouter API error:', error);
    throw error;
  }
}

/**
 * Call OpenRouter API for JSON generation
 *
 * @param prompt - The prompt to send
 * @param options - Optional configuration
 * @returns The generated JSON as a string
 */
export async function generateJSON(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }
): Promise<string> {
  const { apiKey, model } = getOpenRouterConfig();

  const messages: OpenRouterMessage[] = [];

  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }

  messages.push({ role: 'user', content: prompt });

  const requestBody: OpenRouterRequest = {
    model,
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
    // Note: response_format json_object may not be supported by all models
    // Gemini models typically just need "Output JSON only" in the prompt
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://gameforge.app',
        'X-Title': 'GameForge',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from OpenRouter API');
    }

    const content = data.choices[0].message.content;

    // Log token usage
    if (data.usage) {
      console.log('🔢 OpenRouter JSON tokens:', {
        prompt: data.usage.prompt_tokens,
        completion: data.usage.completion_tokens,
        total: data.usage.total_tokens
      });
    }

    // Clean up markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    return cleanedContent;

  } catch (error) {
    console.error('❌ OpenRouter JSON API error:', error);
    throw error;
  }
}

/**
 * Test OpenRouter connection
 * Useful for debugging API key issues
 */
export async function testConnection(): Promise<boolean> {
  try {
    const result = await generateText('Respond with "OK" if you can read this message.');
    return result.toLowerCase().includes('ok');
  } catch (error) {
    console.error('OpenRouter connection test failed:', error);
    return false;
  }
}
