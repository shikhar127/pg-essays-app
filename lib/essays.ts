import { essayContentMap } from './essayContentMap';

export interface EssayMetadata {
  id: string;
  title: string;
  wordCount: number;
  readingTimeMinutes: number;
  year: number;
  month: number;
  url: string;
  filename: string;
}

// Cache for essay index to avoid reloading
let essayIndexCache: EssayMetadata[] | null = null;

/**
 * Load the essay index containing metadata for all essays
 * @returns Array of essay metadata
 * @throws Error if index.json cannot be loaded
 */
export function loadEssayIndex(): EssayMetadata[] {
  try {
    // Check cache first
    if (essayIndexCache) {
      return essayIndexCache;
    }

    // In React Native, require() for JSON files works synchronously
    const data = require('../assets/essays/index.json');
    essayIndexCache = data as EssayMetadata[];
    return essayIndexCache;
  } catch (error) {
    throw new Error(`Failed to load essay index: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Load the content of a specific essay by ID
 * @param id - The essay ID (e.g., "the-shape-of-the-essay-field")
 * @returns Promise that resolves to the essay content as a string (markdown format)
 * @throws Error if essay content cannot be loaded or essay not found
 */
export async function loadEssayContent(id: string): Promise<string> {
  try {
    // Check if the essay exists in our content map
    const loader = essayContentMap[id];

    if (!loader) {
      throw new Error(`Essay not found: ${id}. Please check that the essay file exists.`);
    }

    // Load the essay content using the generated loader
    const content = await loader();

    if (!content || typeof content !== 'string') {
      throw new Error(`Invalid essay content format for: ${id}`);
    }

    return content;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Essay not found')) {
      throw error; // Re-throw our custom error messages
    }
    throw new Error(`Failed to load essay content for "${id}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
