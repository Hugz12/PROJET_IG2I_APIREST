module.exports = {
    env: {
        node: true,
        es2022: true,
        jest: true
    },
    extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
    },
    plugins: [
        '@typescript-eslint'
    ],
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '_' }],
        'no-console': ['error', {
            'allow': ['log', 'error']
        }],
        'indent': ['error', 'tab'],
        'quotes': ['error', 'double'],
        'semi': ['error', 'always'],
        'no-trailing-spaces': 'error',
        'eol-last': 'error'
    },
    ignorePatterns: [
        'node_modules/',
        'dist/',
        'build/',
        'coverage/',
        'db_data/',
        'db-filler.js',
        'build.mjs'
    ]
};