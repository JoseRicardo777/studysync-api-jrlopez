// jest.config.js
module.exports = {
    testEnvironment: 'node',
    verbose: true,
    forceExit: true,
    testTimeout: 60000,
    setupFiles: ['<rootDir>/jest.setup.js'],
    testMatch: ['**/tests/**/*.test.js'],
  };