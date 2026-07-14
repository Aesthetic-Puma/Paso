import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'paso_cache:';

export interface CacheResult<T> {
  data: T;
  fetchedAt: number; // ms timestamp
  stale: boolean;    // true when network failed and we returned a stale entry
}

export async function cachedFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>,
): Promise<CacheResult<T> | null> {
  let stored: string | null = null;
  try {
    stored = await AsyncStorage.getItem(PREFIX + key);
  } catch { /* storage unavailable */ }

  if (stored) {
    try {
      const entry = JSON.parse(stored) as { data: T; fetchedAt: number };
      const age = Date.now() - entry.fetchedAt;

      if (age < ttlMs) {
        return { data: entry.data, fetchedAt: entry.fetchedAt, stale: false };
      }

      // Cache is stale — try refresh, fall back to stale entry on failure
      try {
        const fresh = await fetcher();
        await persist(key, fresh);
        return { data: fresh, fetchedAt: Date.now(), stale: false };
      } catch {
        return { data: entry.data, fetchedAt: entry.fetchedAt, stale: true };
      }
    } catch { /* corrupted JSON — fall through to fresh fetch */ }
  }

  // No cache entry
  try {
    const fresh = await fetcher();
    await persist(key, fresh);
    return { data: fresh, fetchedAt: Date.now(), stale: false };
  } catch {
    return null;
  }
}

async function persist<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify({ data, fetchedAt: Date.now() }));
  } catch { /* ignore write failures */ }
}

export async function bustCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(PREFIX + key);
  } catch { /* ignore */ }
}
