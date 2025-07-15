module.exports = {
  root: true,
  env: {
    node: true,
    jest: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  plugins: ['prettier'],
  rules: {
    'no-var': 2, // 對var禁止
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-param-reassign': ['error', { props: false }],
    'func-names': ['error', 'as-needed'],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/no-cycle': ['off'],
    'max-len': 'off',
    'arrow-parens': 'off',
    'import/prefer-default-export': 'off',
    camelcase: 'off',
    semi: ['error', 'always']
  }
};
