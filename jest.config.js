/** @format */

module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  moduleNameMapper: {
    "^@configs/(.*)$": "<rootDir>/src/configs/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@v1_helpers/(.*)$": "<rootDir>/src/api/v1/helpers/$1",
    "^@v1_services/(.*)$": "<rootDir>/src/api/v1/services/$1",
    "^@v1_validations/(.*)$": "<rootDir>/src/api/v1/validations/$1",
    "^@v1_controllers/(.*)$": "<rootDir>/src/api/v1/controllers/$1",
    "^@v1_middlewares/(.*)$": "<rootDir>/src/api/v1/middlewares/$1",
  },
  testTimeout: 30000,
};
