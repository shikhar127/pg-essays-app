import essayIndex from '../assets/essays/index.json';

export interface EssayMeta {
  id: string;
  title: string;
  wordCount: number;
  readingTimeMinutes: number;
  year: number;
  month: number;
  url: string;
}

const essays: EssayMeta[] = essayIndex;

export function loadEssayIndex(): EssayMeta[] {
  return essays;
}

export function getEssayById(id: string): EssayMeta | null {
  return essays.find((e) => e.id === id) || null;
}
