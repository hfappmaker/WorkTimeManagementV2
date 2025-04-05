import { createDefaultEsmPreset, JestConfigWithTsJest } from "ts-jest";

const presetConfig = createDefaultEsmPreset({
  // 必要に応じたオプションを設定できます（例: extensionsToTreatAsEsm 等）
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      { useESM: true, tsconfig: "tsconfig.spec.json" },
    ],
  },
  testMatch: ["**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

export default jestConfig;
