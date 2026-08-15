const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
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
        Error: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'eqeqeq': 'error',
      'no-console': 'off',
      'no-alert': 'off',
      'no-undef': 'off',
      'no-redeclare': 'off'
    }
  }
];
