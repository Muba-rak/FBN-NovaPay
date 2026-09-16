import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '@/mocks/server';
import { simulationConfig } from '@/mocks/config';

beforeAll(() => {
  // Disable artificial latency in tests for instant assertions
  simulationConfig.latencyMs = 0;
  simulationConfig.failureRate = 0;
  simulationConfig.offline = false;
  server.listen({ onUnhandledRequest: 'bypass' });
});

// Automatically cleanup and reset handlers after each test
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
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

