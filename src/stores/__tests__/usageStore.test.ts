import { act, renderHook } from '@testing-library/react';
import { useUsageStore } from '../usageStore';

// Mock fetch
global.fetch = jest.fn();

describe('useUsageStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useUsageStore());

    expect(result.current.dailyLimitMinutes).toBe(null);
    expect(result.current.todayUsageMinutes).toBe(0);
    expect(result.current.requiresReauth).toBe(false);
    expect(result.current.limitReached).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should fetch usage data successfully', async () => {
    const mockResponse = {
      dailyLimitMinutes: 120,
      todayUsageMinutes: 30,
      requiresReauth: false,
      lastLimitUpdateAt: '2025-10-25T10:00:00Z',
      limitReached: false,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUsageStore());

    await act(async () => {
      await result.current.fetchUsageData();
    });

    expect(result.current.dailyLimitMinutes).toBe(120);
    expect(result.current.todayUsageMinutes).toBe(30);
    expect(result.current.requiresReauth).toBe(false);
    expect(result.current.limitReached).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to fetch' }),
    });

    const { result } = renderHook(() => useUsageStore());

    await act(async () => {
      await result.current.fetchUsageData();
    });

    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.isLoading).toBe(false);
  });

  it('should set limit successfully', async () => {
    const mockResponse = {
      dailyLimitMinutes: 90,
      todayUsageMinutes: 15,
      requiresReauth: true,
      lastLimitUpdateAt: '2025-10-25T10:00:00Z',
      limitReached: false,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUsageStore());

    let success = false;
    await act(async () => {
      success = await result.current.setLimit(90);
    });

    expect(success).toBe(true);
    expect(result.current.dailyLimitMinutes).toBe(90);
    expect(result.current.requiresReauth).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle set limit error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid limit value' }),
    });

    const { result } = renderHook(() => useUsageStore());

    let success = false;
    await act(async () => {
      success = await result.current.setLimit(90);
    });

    expect(success).toBe(false);
    expect(result.current.error).toBe('Invalid limit value');
    expect(result.current.isLoading).toBe(false);
  });

  it('should update usage correctly', () => {
    const { result } = renderHook(() => useUsageStore());

    // Set initial state
    act(() => {
      result.current.setLimit(120);
    });

    act(() => {
      result.current.updateUsage(60);
    });

    expect(result.current.todayUsageMinutes).toBe(60);
    expect(result.current.limitReached).toBe(false);

    // Update to exceed limit
    act(() => {
      result.current.updateUsage(120);
    });

    expect(result.current.todayUsageMinutes).toBe(120);
    expect(result.current.limitReached).toBe(true);
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useUsageStore());

    // Set an error
    act(() => {
      result.current.setLimit(90);
    });

    // Clear error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });

  it('should reset reauth requirement', () => {
    const { result } = renderHook(() => useUsageStore());

    // Set requiresReauth to true
    act(() => {
      result.current.setLimit(90);
    });

    // Reset reauth
    act(() => {
      result.current.resetReauth();
    });

    expect(result.current.requiresReauth).toBe(false);
  });

  it('should handle network error during fetch', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUsageStore());

    await act(async () => {
      await result.current.fetchUsageData();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle network error during set limit', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUsageStore());

    await act(async () => {
      await result.current.setLimit(90);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle null limit correctly', async () => {
    const mockResponse = {
      dailyLimitMinutes: null,
      todayUsageMinutes: 30,
      requiresReauth: false,
      lastLimitUpdateAt: null,
      limitReached: false,
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useUsageStore());

    let success = false;
    await act(async () => {
      success = await result.current.setLimit(null);
    });

    expect(success).toBe(true);
    expect(result.current.dailyLimitMinutes).toBe(null);
    expect(result.current.limitReached).toBe(false);
  });
});
