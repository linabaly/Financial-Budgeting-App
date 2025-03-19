export default {
  env: {
    node: true,
  },
  // Specify the parser for TypeScript
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  // existing ESLint configuration
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended", // Adds the Prettier plugin
  ],
  plugins: ["@typescript-eslint", "prettier"],
  rules: {
    "prettier/prettier": "error", // Displays Prettier errors as ESLint errors
    prefer_const: "warn", // prefers using "const" for variables that are not reassigned
    no_var: "error", // disallows the use of "var", must use "let" or "const" only

    // TS rules
    "@typescript-eslint/no-explicit-any": "warn", // Warns when using "any" type
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }], // warns against any used variables except those prefixed with "_"
  },
};
