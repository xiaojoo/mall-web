import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import pluginVue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'
import vueParser from 'vue-eslint-parser' // 引入 vue-eslint-parser 解析器

/** @type {import('eslint').Linter.Config} */
export default {
  files: ['**/*.{js,mjs,cjs,ts,vue}'],
  ignores: ['node_modules/**', 'dist/**'], // 忽略目录
  languageOptions: {
    globals: {
      ...globals.browser, // 浏览器全局变量
      ...globals.node, // Node.js 全局变量
      ...globals.es2021, // ES2021 全局变量
    },
    parser: vueParser, // 使用 vue-eslint-parser 解析器
    parserOptions: {
      ecmaVersion: 'latest', // 最新 ECMAScript 版本
      sourceType: 'module', // ES 模块支持
      parser: tsParser, // TypeScript 支持
      jsxPragma: 'React', // React JSX 支持
      ecmaFeatures: {
        jsx: true, // 支持 JSX
      },
    },
  },
  rules: {
    'no-var': 'error', // 禁止使用 var
    'no-multiple-empty-lines': ['warn', { max: 1 }], // 限制连续空行数量
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 生产环境禁止 console
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off', // 生产环境禁止 debugger
    'no-unexpected-multiline': 'error', // 禁止意外的多行表达式
    'no-useless-escape': 'off', // 允许无用的转义字符
  },
}

export const jsConfig = pluginJs.configs.recommended

export const tsConfig = {
  ...tseslint.configs.recommended,
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off', // 允许使用 @ts-comment
    '@typescript-eslint/no-unused-vars': 'error', // 禁止未使用的变量
    '@typescript-eslint/prefer-ts-expect-error': 'error', // 使用 @ts-expect-error 代替 @ts-ignore
    '@typescript-eslint/no-explicit-any': 'off', // 允许使用 any 类型
    '@typescript-eslint/no-non-null-assertion': 'off', // 允许非空断言
    '@typescript-eslint/no-namespace': 'off', // 允许使用命名空间
  },
}

export const vueConfig = {
  files: ['**/*.vue'],
  ...pluginVue.configs['flat/essential'], // 引入 Vue 插件的基础规则
  rules: {
    'vue/multi-word-component-names': 'off', // 关闭多单词组件名称限制
    'vue/script-setup-uses-vars': 'error', // 防止 <script setup> 的变量被标记为未使用
    'vue/no-mutating-props': 'off', // 允许变更 prop
    'vue/attribute-hyphenation': 'off', // 允许非连字符属性命名
  },
}

export const prettierConfig = {
  files: ['**/*.{js,mjs,cjs,ts,vue}'],
  rules: prettier.rules, // 引入 Prettier 规则
}
