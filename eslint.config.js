// eslint.config.js
// @ts-check
import js from "@eslint/js";

import jest from "eslint-plugin-jest"; // <-- 1. Importe o plugin do Jest


/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  // arquivos/paths a ignorar
  {
    ignores: ["node_modules/**", "coverage/**", "dist/**"]
  },

  // regras recomendadas do ESLint
  js.configs.recommended,

  // opções gerais do projeto
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // Node
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",

        // Remova o 'jest: "true"' daqui, pois o plugin vai cuidar disso

        // Testes
        jest: "true"

      }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "error"
    }
  },

  // ajustes específicos para testes
  {

    // 2. Aplique a configuração recomendada do Jest aqui
    ...jest.configs['flat/recommended'],
    files: ["tests/**/*.test.js"],
    rules: {
      // 3. Mantenha suas regras personalizadas e as do Jest
      ...jest.configs['flat/recommended'].rules,
      "no-console": "off"
    }
  }
];

