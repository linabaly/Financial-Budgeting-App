// eslint.config.mjs

import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import globals from "globals";

export default [
  // Base ESLint configuration
  js.configs.recommended,

  // TypeScript configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      globals: {
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: "latest", // Allows for the parsing of modern ECMAScript features
        sourceType: "module", // Allows for the use of imports
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // Prettier configuration
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      ...prettier.rules,
      "prettier/prettier": "error",
    },
  },
];
