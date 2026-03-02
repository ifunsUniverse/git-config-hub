import { toast } from "sonner";

export interface OllamaChatResponse {
  response: string;
  model: string;
  createdAt: string;
  done: boolean;
  totalDuration?: number;
  loadDuration?: number;
  promptEvalCount?: number;
  evalCount?: number;
  evalDuration?: number;
}

export interface OllamaEmbeddingResponse {
  embedding: number[];
}

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: { 
    format: string; 
    family: string; 
    families: string[] | null; 
    parameter_size: string; 
    quantization_level: string; 
  };
}

export interface OllamaListResponse {
  models: OllamaModel[];
}

const OLLAMA_HOST = "http://localhost:11434"; // Default Ollama host

/**
 * Checks if the Ollama server is running.
 * @returns True if Ollama is reachable, false otherwise.
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    return response.ok;
  } catch (error) {
    console.error("Ollama server not reachable:", error);
    return false;
  }
}

/**
 * Lists available Ollama models.
 * @returns An array of OllamaModel objects.
 */
export async function listOllamaModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: OllamaListResponse = await response.json();
    return data.models;
  } catch (error) {
    console.error("Failed to list Ollama models:", error);
    toast.error("Ollama Error", {
      description: "Failed to list models. Is Ollama running?",
    });
    return [];
  }
}

/**
 * Pulls an Ollama model.
 * @param modelName The name of the model to pull (e.g., "qwen:32b").
 * @param onProgress Callback for progress updates.
 * @returns True if the model was pulled successfully, false otherwise.
 */
export async function pullOllamaModel(
  modelName: string,
  onProgress?: (progress: { status: string; completed: number; total: number }) => void
): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: modelName, stream: true }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        try {
          const json = JSON.parse(line);
          if (json.status && onProgress) {
            const completed = json.completed || 0;
            const total = json.total || 0;
            onProgress({ status: json.status, completed, total });
          }
          if (json.error) {
            throw new Error(json.error);
          }
        } catch (e) {
          console.warn("Failed to parse Ollama pull stream line:", line, e);
        }
      }
    }
    toast.success("Ollama Model Pulled", {
      description: `${modelName} has been successfully downloaded.`,
    });
    return true;
  } catch (error) {
    console.error(`Failed to pull Ollama model ${modelName}:`, error);
    toast.error("Ollama Error", {
      description: `Failed to pull model ${modelName}. Is Ollama running and model name correct?`,
    });
    return false;
  }
}

/**
 * Generates embeddings for a given text using Ollama.
 * @param model The embedding model to use (e.g., "nomic-embed-text").
 * @param prompt The text to embed.
 * @returns An array of numbers representing the embedding.
 */
export async function generateOllamaEmbedding(
  model: string,
  prompt: string
): Promise<number[] | null> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: OllamaEmbeddingResponse = await response.json();
    return data.embedding;
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    toast.error("Ollama Error", {
      description: "Failed to generate embedding. Is Ollama running and embedding model available?",
    });
    return null;
  }
}

/**
 * Sends a chat message to an Ollama model.
 * @param model The chat model to use (e.g., "qwen:32b").
 * @param messages The conversation history.
 * @param onUpdate Callback for streaming updates.
 * @returns The final response from the model.
 */
export async function chatWithOllama(
  model: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  onUpdate: (chunk: string, final: boolean) => void
): Promise<string | null> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;
        try {
          const json: OllamaChatResponse = JSON.parse(line);
          if (json.response) {
            fullResponse += json.response;
            onUpdate(json.response, json.done);
          }
          if (json.done) {
            return fullResponse;
          }
        } catch (e) {
          console.warn("Failed to parse Ollama chat stream line:", line, e);
        }
      }
    }
    return fullResponse;
  } catch (error) {
    console.error("Failed to chat with Ollama:", error);
    toast.error("Ollama Error", {
      description: "Failed to communicate with Ollama. Is the server running and model available?",
    });
    return null;
  }
}
