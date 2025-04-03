import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import tailwind from "eslint-plugin-tailwindcss";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {{ configs: Record<string, unknown> }} */
const tailwindPlugin = tailwind;
const flatRecommended = tailwindPlugin.configs["flat/recommended"];

export default tseslint.config(
  {
    // キャッシュの設定
    cache: true,
    cacheLocation: ".eslintcache",
    // 並列実行の設定
    cwd: __dirname,
    // 必要なファイルのみを対象に
    files: ["*.ts", "*.tsx"],
    ignores: [
      "**/.next/**/*",
      "**/node_modules/**/*",
      "**/dist/**/*",
      "**/build/**/*",
      "**/.eslintcache/**/*",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  ...compat.extends("next/core-web-vitals"),
  ...flatRecommended,
  {
    // @typescript-eslintに関する設定
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
        // パフォーマンス最適化のための設定
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
    },
  },
  {
    // tailwindcssに関する設定
    settings: {
      tailwindcss: {
        whitelist: ["hidden-scrollbar", "-webkit-scrollbar"],
      },
    },
  },
  {
    // eslint-plugin-importに関する設定
    plugins: {
      import: importPlugin,
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          pathGroups: [
            {
              pattern: "src/components/**",
              group: "internal",
              position: "before",
            },
            { pattern: "src/lib/**", group: "internal", position: "before" },
          ],
        },
      ],
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
    },
  },
  {
    // eslint-plugin-unused-importsに関する設定
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "unused-imports/no-unused-imports": "error",
    },
  },
  {
    // その他設定
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    languageOptions: {
      globals: {
        React: "readonly",
      },
    },
    rules: {
      "react/jsx-boolean-value": "error",
      "react/jsx-curly-brace-presence": "error",
    },
  },
  eslintConfigPrettier,
);
