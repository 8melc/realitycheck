import { renderHook, act } from '@testing-library/react';
import { useSessionTimer } from '../useSessionTimer';

// Mock the useSessionHeartbeat hook
jest.mock('../../stores/usageStore', () => ({
  useSessionHeartbeat: () => ({
    sendHeartbeat: jest.fn().mockResolvedValue({
      consumedMinutes: 0,
      limitReached: false,
      shouldLogout: false,
    }),
  }),
}));

// Mock BroadcastChannel
global.BroadcastChannel = jest.fn().mockImplementation(() => ({
  postMessage: jest.fn(),
  close: jest.fn(),
  onmessage: null,
}));

// Mock document.hidden
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
});

describe('useSessionTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default values', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 120,
        ...mockCallbacks,
      })
    );

    expect(result.current.elapsedMinutes).toBe(0);
    expect(result.current.remainingMinutes).toBe(120);
    expect(result.current.limitReached).toBe(false);
    expect(result.current.isActive).toBe(false);
    expect(result.current.sessionId).toBe('');
  });

  it('should start timer and update elapsed time', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 120,
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.isActive).toBe(true);
    expect(result.current.sessionId).toBeTruthy();

    // Fast-forward time by 1 minute
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(result.current.elapsedMinutes).toBe(1);
    expect(result.current.remainingMinutes).toBe(119);
  });

  it('should trigger warning at 80% usage', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 100, // 100 minutes for easier calculation
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    // Fast-forward to 80 minutes (80% of 100)
    act(() => {
      jest.advanceTimersByTime(80 * 60000);
    });

    expect(mockCallbacks.onWarning80).toHaveBeenCalled();
  });

  it('should trigger warning at 95% usage', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 100,
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    // Fast-forward to 95 minutes (95% of 100)
    act(() => {
      jest.advanceTimersByTime(95 * 60000);
    });

    expect(mockCallbacks.onWarning95).toHaveBeenCalled();
  });

  it('should trigger limit reached at 100% usage', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 100,
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    // Fast-forward to 100 minutes (100% of 100)
    act(() => {
      jest.advanceTimersByTime(100 * 60000);
    });

    expect(mockCallbacks.onLimitReached).toHaveBeenCalled();
    expect(result.current.limitReached).toBe(true);
    expect(result.current.isActive).toBe(false);
  });

  it('should pause when page becomes hidden', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 120,
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.isActive).toBe(true);

    // Simulate page becoming hidden
    act(() => {
      Object.defineProperty(document, 'hidden', { value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.isActive).toBe(false);
  });

  it('should resume when page becomes visible', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 120,
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    // Simulate page becoming hidden then visible
    act(() => {
      Object.defineProperty(document, 'hidden', { value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.isActive).toBe(false);

    act(() => {
      Object.defineProperty(document, 'hidden', { value: false });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.isActive).toBe(true);
  });

  it('should stop timer when stopTimer is called', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 120,
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.stopTimer();
    });

    expect(result.current.isActive).toBe(false);
  });

  it('should reset timer when resetTimer is called', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 120,
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(60000);
    });

    expect(result.current.elapsedMinutes).toBe(1);

    act(() => {
      result.current.resetTimer();
    });

    expect(result.current.elapsedMinutes).toBe(0);
    expect(result.current.remainingMinutes).toBe(120);
    expect(result.current.sessionId).toBe('');
    expect(result.current.limitReached).toBe(false);
  });

  it('should format time correctly', () => {
    const mockCallbacks = {
      onWarning80: jest.fn(),
      onWarning95: jest.fn(),
      onLimitReached: jest.fn(),
    };

    const { result } = renderHook(() =>
      useSessionTimer({
        limitMinutes: 120,
        ...mockCallbacks,
      })
    );

    act(() => {
      result.current.startTimer();
    });

    // Fast-forward to 1 hour 30 minutes
    act(() => {
      jest.advanceTimersByTime(90 * 60000);
    });

    expect(result.current.elapsedTimeFormatted).toBe('1:30');
    expect(result.current.remainingTimeFormatted).toBe('30');
  });
});
