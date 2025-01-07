/** @type {import("eslint").Linter.Config} */
const config = {
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": true
  },
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-empty-function":'off',
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-member-access":"off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/consistent-type-definitions": "off",

    // 添加以下规则来禁用更多检查
    "@typescript-eslint/no-floating-promises": "off",        // 禁用未处理的 Promise 检查
    "@typescript-eslint/no-unsafe-return": "off",           // 禁用不安全返回值检查
    "@typescript-eslint/no-unsafe-call": "off",             // 禁用不安全函数调用检查
    "@typescript-eslint/no-non-null-assertion": "off",      // 允许使用非空断言
    "@typescript-eslint/no-inferrable-types": "off",        // 允许为简单类型添加类型注解
    "@typescript-eslint/prefer-nullish-coalescing": "off",  // 关闭建议使用 ?? 而不是 || 的检查
    "@typescript-eslint/prefer-optional-chain": "off",      // 关闭建议使用可选链的检查
    "@typescript-eslint/non-nullable-type-assertion-style": "off", // 关闭类型断言样式检查
    "@typescript-eslint/prefer-promise-reject-errors": "off", // 关闭 Promise reject 必须使用 Error 对象的检查
    "@typescript-eslint/ban-ts-comment": "off",             // 允许使用 @ts-ignore 等注释
    "@typescript-eslint/no-misused-promises": "off",        // 已有，但确保它被禁用
    "@typescript-eslint/require-await": "off",   

    "@typescript-eslint/consistent-type-imports": [
      "warn",
      {
        "prefer": "type-imports",
        "fixStyle": "inline-type-imports"
      }
    ],
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        "argsIgnorePattern": "^_"
      }
    ],
  }
}
module.exports = config;