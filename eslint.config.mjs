import pluginVue from 'eslint-plugin-vue'
import pluginAstro from 'eslint-plugin-astro'
import tseslint from 'typescript-eslint'

export default [
  // Global ignores
  {
    ignores: ['dist/', '.astro/', 'node_modules/'],
  },

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Vue flat/recommended
  ...pluginVue.configs['flat/recommended'],

  // Astro recommended
  ...pluginAstro.configs.recommended,

  // Vue files: use TS parser inside <script> blocks
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },

  // TypeScript / JS files
  {
    files: ['**/*.ts', '**/*.mjs'],
  },
]
