import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeName, FontSize } from './themes';

const KEYS = {
  SETTINGS: '@pg_essays_settings',
  SCROLL_POSITIONS: '@pg_essays_scroll_positions',
  READ_ESSAYS: '@pg_essays_read',
  BOOKMARKS: '@pg_essays_bookmarks',
  FAVORITES: '@pg_essays_favorites',
  READ_HISTORY: '@pg_essays_read_history',
};

export interface Settings {
  themeName: ThemeName;
  fontSize: FontSize;
}

export interface ScrollPositions {
  [essayId: string]: number; // 0 to 1 (percentage)
}

// Settings
export async function loadSettings(): Promise<Settings | null> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.warn('Failed to load settings:', error);
    return null;
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
}

// Scroll Positions
export async function loadScrollPositions(): Promise<ScrollPositions> {
  try {
    const json = await AsyncStorage.getItem(KEYS.SCROLL_POSITIONS);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.warn('Failed to load scroll positions:', error);
    return {};
  }
}

export async function saveScrollPosition(essayId: string, position: number): Promise<boolean> {
  try {
    const positions = await loadScrollPositions();
    positions[essayId] = position;
    await AsyncStorage.setItem(KEYS.SCROLL_POSITIONS, JSON.stringify(positions));
    return true;
  } catch (error) {
    console.warn('Failed to save scroll position:', error);
    return false;
  }
}

export async function getScrollPosition(essayId: string): Promise<number> {
  try {
    const positions = await loadScrollPositions();
    return positions[essayId] || 0;
  } catch (error) {
    console.warn('Failed to get scroll position:', error);
    return 0;
  }
}

// Read Essays
export async function loadReadEssays(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.READ_ESSAYS);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.warn('Failed to load read essays:', error);
    return [];
  }
}

export async function markEssayAsRead(essayId: string): Promise<void> {
  try {
    const readEssays = await loadReadEssays();
    if (!readEssays.includes(essayId)) {
      readEssays.push(essayId);
      await AsyncStorage.setItem(KEYS.READ_ESSAYS, JSON.stringify(readEssays));
    }
  } catch (error) {
    console.warn('Failed to mark essay as read:', error);
  }
}

export async function isEssayRead(essayId: string): Promise<boolean> {
  const readEssays = await loadReadEssays();
  return readEssays.includes(essayId);
}

// Bookmarks
export interface Bookmark {
  id: string;
  position: number; // 0 to 1 (scroll percentage)
  note?: string;
  createdAt: number;
}

export interface EssayBookmarks {
  [essayId: string]: Bookmark[];
}

export async function loadBookmarks(): Promise<EssayBookmarks> {
  try {
    const json = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return json ? JSON.parse(json) : {};
  } catch (error) {
    console.warn('Failed to load bookmarks:', error);
    return {};
  }
}

export async function getEssayBookmarks(essayId: string): Promise<Bookmark[]> {
  const bookmarks = await loadBookmarks();
  return bookmarks[essayId] || [];
}

export async function addBookmark(essayId: string, position: number, note?: string): Promise<Bookmark> {
  try {
    const bookmarks = await loadBookmarks();
    if (!bookmarks[essayId]) {
      bookmarks[essayId] = [];
    }
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      position,
      note,
      createdAt: Date.now(),
    };
    bookmarks[essayId].push(newBookmark);
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    return newBookmark;
  } catch (error) {
    console.warn('Failed to add bookmark:', error);
    throw error;
  }
}

export async function removeBookmark(essayId: string, bookmarkId: string): Promise<void> {
  try {
    const bookmarks = await loadBookmarks();
    if (bookmarks[essayId]) {
      bookmarks[essayId] = bookmarks[essayId].filter((b) => b.id !== bookmarkId);
      await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    }
  } catch (error) {
    console.warn('Failed to remove bookmark:', error);
  }
}

// Favorites
export async function loadFavorites(): Promise<string[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.FAVORITES);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.warn('Failed to load favorites:', error);
    return [];
  }
}

export async function saveFavorite(essayId: string): Promise<boolean> {
  try {
    const favorites = await loadFavorites();
    if (!favorites.includes(essayId)) {
      favorites.push(essayId);
      await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
    }
    return true;
  } catch (error) {
    console.warn('Failed to save favorite:', error);
    return false;
  }
}

export async function removeFavorite(essayId: string): Promise<boolean> {
  try {
    const favorites = await loadFavorites();
    const updated = favorites.filter((id) => id !== essayId);
    await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.warn('Failed to remove favorite:', error);
    return false;
  }
}

// Reading History
export interface ReadHistoryEntry {
  essayId: string;
  readAt: number;
}

export async function loadReadHistory(): Promise<ReadHistoryEntry[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.READ_HISTORY);
    const entries: ReadHistoryEntry[] = json ? JSON.parse(json) : [];
    return entries.sort((a, b) => b.readAt - a.readAt);
  } catch (error) {
    console.warn('Failed to load read history:', error);
    return [];
  }
}

export async function saveReadHistory(essayId: string): Promise<boolean> {
  try {
    const history = await loadReadHistory();
    const filtered = history.filter((entry) => entry.essayId !== essayId);
    filtered.unshift({ essayId, readAt: Date.now() });
    await AsyncStorage.setItem(KEYS.READ_HISTORY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.warn('Failed to save read history:', error);
    return false;
  }
}
