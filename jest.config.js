export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 1,
      functions: 1,
      lines: 1,
      statements: 1
    }
  }
};