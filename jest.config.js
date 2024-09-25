module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts"
  ],
  coverageReporters: [
    "json",
    "lcov",
    "text",
    "clover"
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
