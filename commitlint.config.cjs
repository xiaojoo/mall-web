module.exports = {
    ignores: [(commit) => commit.includes('init')],
    extends: ['@commitlint/config-conventional'],
    rules: {
    'type-enum':[
        2,
        'always',
        [
            'feat', // 新特性，新功能
            'fix',// 修改bug
            'docs',// 文档修改
            'style',// 代码格式化修改，不是css
            'refactor',// 代码重构
            'perf',// 优化代码
            'test',// 测试用例修改
            'chore',// 其他修改，例如增加依赖库、工具
            'revert',// 回滚到上一个版本
            'build'// 编译相关的修改，例如版本发布、项目构建火葬依赖的改动
        ],
      ],
      'type-case': [0],
      'type-empty': [0],
      'scope-empty': [0],
      'scope-case': [0],
      'subject-full-stop': [0, 'never'],
      'subject-case': [0, 'never'],
      'body-leading-blank': [2, 'always'],
      'footer-leading-blank': [1, 'always'],
      'header-max-length': [0, 'always', 72]
    },
  }