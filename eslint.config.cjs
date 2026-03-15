const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    {
        ignores: ['node_modules/**', 'build/**', 'temp/**']
    },
    js.configs.recommended,
    {
        files: ['assets/**/*.js'],
        languageOptions: {
            ecmaVersion: 5,
            sourceType: 'script',
            globals: globals.browser
        },
        rules: {
            indent: ['error', 4],
            'linebreak-style': ['error', 'windows'],
            quotes: ['error', 'single'],
            semi: ['error', 'always']
        }
    },
    {
        files: ['gulpfile.js'],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: 'script',
            globals: globals.node
        }
    }
];
