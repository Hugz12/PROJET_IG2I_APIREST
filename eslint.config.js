import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import globals from "globals";

export default [
    {
        ignores: ["node_modules/", "dist/", "build/", "coverage/", ".eslintrc.js", ".eslintignore", "db_data/", "db-filler.js", "build.mjs"],
    },
    js.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.es2022
            }
        },
        plugins: {
            "@typescript-eslint": tseslint
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "_" }],
            "no-console": ["error", {
                "allow": ["log", "error"]
            }],
            "indent": ["error", "tab", {
                "ignoredNodes": ["Decorator"]
            }],
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "no-trailing-spaces": "error",
            "eol-last": "error"
        }
    },
    {
        files: ["**/*.test.ts", "**/tests/**/*.ts"],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.es2022,
                ...globals.jest
            }
        },
        plugins: {
            "@typescript-eslint": tseslint
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "_" }],
            "no-console": ["error", {
                "allow": ["log", "error"]
            }],
            "indent": ["error", "tab", {
                "ignoredNodes": ["Decorator"]
            }],
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "no-trailing-spaces": "error",
            "eol-last": "error"
        }
    }
];