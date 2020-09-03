module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: [
    './node_modules/',
    './__tests__/__mocks__/',
    './__tests__/__helpers__/',
    './__tests__/__types__/',
    './__tests__/__utils__/',
  ],
}
