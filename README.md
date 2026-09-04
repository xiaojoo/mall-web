# Mall Vue

Mall 微服务商城的后台管理前端界面，基于 Vue 3 + TypeScript + Element Plus。

## 🛠 技术栈

| 类别        | 技术                                   |
| ----------- | -------------------------------------- |
| 框架        | Vue 3.5                                |
| 构建工具    | Vite 8                                 |
| 语言        | TypeScript 5.9                         |
| UI 组件库   | Element Plus 2.13                      |
| 状态管理    | Pinia 3                                |
| 路由        | Vue Router 5                           |
| HTTP 客户端 | Axios                                  |
| 表单验证    | Vee-Validate + Yup                     |
| 样式        | SCSS + Stylelint                       |
| 代码规范    | ESLint + Prettier + Husky + Commitlint |
| Mock        | vite-plugin-mock                       |

## 📋 环境要求

- **Node.js** 20+
- **pnpm** 9+

## 🚀 本地开发

### 1. 克隆 & 安装

```bash
git clone https://github.com/xiaojoo/mall-web.git
cd mall-vue
pnpm install
```

### 2. 配置后端地址

编辑 `.env.development`，将 `VITE_SERVE` 指向后端网关地址：

```env
VITE_SERVE = 'http://localhost:88'
```

### 3. 启动开发服务器

```bash
pnpm dev
```

浏览器自动打开 `http://localhost:5173`，API 请求通过 Vite 代理转发至后端网关。

## 🏗 构建

```bash
# 开发构建
pnpm build

# 测试环境
pnpm build:test

# 生产环境
pnpm build:pro
```

构建产物输出到 `dist/` 目录，可部署至 Nginx 等 Web 服务器。

## 📁 目录结构

```
mall-vue/
├── src/
│   ├── api/            # API 接口定义
│   ├── assets/         # 静态资源（样式、图片、SVG 图标）
│   ├── components/     # 通用组件
│   ├── hook/           # 组合式函数
│   ├── icons/          # 图标组件
│   ├── layout/         # 布局组件
│   ├── router/         # 路由配置
│   ├── store/          # Pinia 状态管理
│   ├── utils/          # 工具函数
│   ├── views/          # 页面视图
│   ├── App.vue         # 根组件
│   ├── main.ts         # 入口文件
│   ├── permisstion.ts  # 路由权限控制
│   └── setting.ts      # 全局配置
├── mock/               # Mock 数据
├── public/             # 公共静态资源
├── scripts/            # 构建脚本
├── .env.development    # 开发环境变量
├── .env.production     # 生产环境变量
├── .env.test           # 测试环境变量
├── vite.config.ts      # Vite 配置
└── package.json
```

## License

CC0 1.0 Universal (Public Domain)
