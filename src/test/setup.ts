import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver for virtualization / responsive tests
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock scrollTo
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

