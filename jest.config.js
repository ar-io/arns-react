module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}', '!src/**/*.d.ts'],
  setupFilesAfterEnv: [
    '<rootDir>/jest-setup.ts',
    '<rootDir>/tests/setup.jest.ts',
  ],
  moduleNameMapper: {
    '\\.(css|gif|png)$': 'jest-transform-stub',
    '\\.svg': '<rootDir>/tests/common/mocks/svg.js',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@src/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!arbundles|arweave-wallet-connector).+\\.js$',
  ],
  moduleDirectories: ['node_modules', 'assets'],
  testPathIgnorePatterns: ['tests/common/'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  verbose: true,
};
