// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock fetch
global.fetch = jest.fn();

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid'
  }
}); 