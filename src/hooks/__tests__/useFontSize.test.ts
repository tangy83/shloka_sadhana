/**
 * useFontSize Hook Tests
 * Shloka Sadhana - Font Size Settings
 *
 * Tests for font size preference hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFontSize } from '../useFontSize';
import * as storage from '@/utils/storage';

// Mock storage
jest.mock('@/utils/storage');

const mockGetItem = storage.getItem as jest.MockedFunction<typeof storage.getItem>;
const mockSetItem = storage.setItem as jest.MockedFunction<typeof storage.setItem>;

describe('useFontSize', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    mockSetItem.mockResolvedValue(true);
  });

  it('should provide default font size (1.0)', async () => {
    const { result } = renderHook(() => useFontSize());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fontSize).toBe(1.0);
  });

  it('should load font size from storage', async () => {
    mockGetItem.mockResolvedValue(1.2);

    const { result } = renderHook(() => useFontSize());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.fontSize).toBe(1.2);
  });

  it('should update font size', async () => {
    const { result } = renderHook(() => useFontSize());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setFontSize(1.5);
    });

    expect(result.current.fontSize).toBe(1.5);
    expect(mockSetItem).toHaveBeenCalledWith('@shloka_sadhana:font_size', 1.5);
  });

  it('should clamp font size between 0.8 and 1.5', async () => {
    const { result } = renderHook(() => useFontSize());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Test minimum
    act(() => {
      result.current.setFontSize(0.5);
    });
    expect(result.current.fontSize).toBe(0.8);

    // Test maximum
    act(() => {
      result.current.setFontSize(2.0);
    });
    expect(result.current.fontSize).toBe(1.5);
  });

  it('should persist font size to storage', async () => {
    const { result } = renderHook(() => useFontSize());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setFontSize(1.3);
    });

    expect(mockSetItem).toHaveBeenCalledWith('@shloka_sadhana:font_size', 1.3);
  });
});
