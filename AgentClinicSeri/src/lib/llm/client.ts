import 'dotenv/config';
import { Ollama } from 'ollama';

/**
 * Provider-agnostic LLM interface.
 */
export interface LLMProvider {
  /**
   * Generates a structured response based on a prompt.
   * @param systemPrompt - The context and rules for the LLM.
   * @param userPrompt - The specific input to process.
   * @returns A promise that resolves to the parsed JSON response.
   */
  generateStructuredResponse<T>(systemPrompt: string, userPrompt: string): Promise<T>;
}

/**
 * Ollama implementation of the LLMProvider.
 */
export class OllamaProvider implements LLMProvider {
  private client: Ollama;
  private model: string;

  constructor(host: string = 'http://localhost:11434', model: string = 'llama3') {
    this.client = new Ollama({ host });
    this.model = model;
  }

  async generateStructuredResponse<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    try {
      const response = await this.client.chat({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        format: 'json',
        stream: false,
      });

      // Parse the JSON content from the LLM response
      return JSON.parse(response.message.content) as T;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw new Error(`Failed to generate structured response from Ollama: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Default LLM client configured for local Ollama.
 */
const DEFAULT_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3';

export const llm = new OllamaProvider(DEFAULT_HOST, DEFAULT_MODEL);
