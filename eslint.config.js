const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['www/js/**/*.js', 'tests/**/*.{js,mjs}', 'scripts/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        STORE_KEY: 'readonly',
        BACKUP_PREFIX: 'readonly',
        DB_SCHEMA_VERSION: 'readonly',
        MAX_IMPORT_BYTES: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        setTimeout: 'readonly',
        encodeURIComponent: 'readonly',
        decodeURIComponent: 'readonly',
        parseFloat: 'readonly',
        parseInt: 'readonly',
        isNaN: 'readonly',
        Date: 'readonly',
        Math: 'readonly',
        JSON: 'readonly',
        Array: 'readonly',
        Object: 'readonly',
        Set: 'readonly',
        Map: 'readonly',
        String: 'readonly',
        Boolean: 'readonly',
        Error: 'readonly',
        URL: 'readonly',
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        Blob: 'readonly',
        FileReader: 'readonly',
        URLSearchParams: 'readonly',
        prompt: 'readonly',
        confirm: 'readonly',
        alert: 'readonly',
        structuredClone: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        Capacitor: 'readonly',
        require: 'readonly',
        process: 'readonly',
        __dirname: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'eqeqeq': 'error',
      'no-console': 'off',
      'no-alert': 'off',
      'no-undef': 'error',
      'no-redeclare': 'off'
    }
  }
];
