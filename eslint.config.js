import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
    js.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsparser,
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                exports: "writable",
                module: "writable",
                require: "readonly",
                global: "readonly"
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
            "indent": ["error", 4, { "ignoredNodes": ["PropertyDefinition"] }],
            "quotes": ["error", "double"],
            "semi": ["error", "always"],
            "no-trailing-spaces": "error",
            "eol-last": "error"
        }
    }
];