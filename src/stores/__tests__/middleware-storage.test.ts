/**
 * Zustand Persistence Middleware Tests
 * Tests for AsyncStorage adapter used by all stores
 */

import { asyncStoragePersist } from '@/stores/middleware/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('asyncStoragePersist — getItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return stored value as string', async () => {
    mockAsyncStorage.getItem.mockResolvedValue('{"key":"value"}');

    const result = await asyncStoragePersist.getItem('test-key');

    expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('test-key');
    expect(result).toBe('{"key":"value"}');
  });

  it('should return null when key does not exist', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);

    const result = await asyncStoragePersist.getItem('missing-key');

    expect(result).toBeNull();
  });

  it('should return null on error (not throw)', async () => {
    mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage read error'));

    const result = await asyncStoragePersist.getItem('error-key');

    expect(result).toBeNull();
  });
});

describe('asyncStoragePersist — setItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should write value to AsyncStorage', async () => {
    mockAsyncStorage.setItem.mockResolvedValue();

    await asyncStoragePersist.setItem('my-key', '{"state":"data"}');

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('my-key', '{"state":"data"}');
  });

  it('should not throw on write error', async () => {
    mockAsyncStorage.setItem.mockRejectedValue(new Error('Write error'));

    await expect(asyncStoragePersist.setItem('key', 'value')).resolves.not.toThrow();
  });
});

describe('asyncStoragePersist — removeItem', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should remove item from AsyncStorage', async () => {
    mockAsyncStorage.removeItem.mockResolvedValue();

    await asyncStoragePersist.removeItem('delete-key');

    expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('delete-key');
  });

  it('should not throw on remove error', async () => {
    mockAsyncStorage.removeItem.mockRejectedValue(new Error('Remove error'));

    await expect(asyncStoragePersist.removeItem('key')).resolves.not.toThrow();
  });
});

describe('asyncStoragePersist — round-trip serialization', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should correctly round-trip JSON state', async () => {
    const state = { currentStreak: 7, longestStreak: 15, preferences: { experienceLevel: 'intermediate' } };
    const serialized = JSON.stringify({ state, version: 0 });

    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.getItem.mockResolvedValue(serialized);

    await asyncStoragePersist.setItem('store-key', serialized);
    const retrieved = await asyncStoragePersist.getItem('store-key');

    expect(retrieved).toBe(serialized);

    const parsed = JSON.parse(retrieved!);
    expect(parsed.state.currentStreak).toBe(7);
    expect(parsed.state.preferences.experienceLevel).toBe('intermediate');
  });
});
