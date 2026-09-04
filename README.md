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

## 🚢 部署（Jenkins：构建 dist + rsync 到 mall nginx）

前端**复用 `mall` 后端已部署的 nginx**（容器名 `nginx`，宿主监听 `8088`，前端静态根 `/data/mall/web`，`/api` 由该 nginx 反代到网关）。Jenkins 只负责：**在 node 容器内构建 `dist` → 用 rsync over ssh 同步到 `/data/mall/web`**，不再构建/启动第二个 nginx。

> CI 文件：`Jenkinsfile`（流水线）、`.npmrc`（npm 国内镜像源）。`Dockerfile` / `nginx/default.conf` 为可选的“自包含镜像”用法，当前流水线已不再使用。

### Jenkins 构建参数

| 参数 | 默认值 | 说明 |
| ---- | ---- | ---- |
| `BUILD_MODE` | `pro` | 对应 `pnpm build:pro` / `pnpm build:test` |
| `STATIC_ROOT` | `/data/mall/web` | mall nginx 的宿主静态根目录（部署目标） |
| `DEPLOY_HOST` | 空 | 部署机 IP；留空=只构建不部署 |
| `DEPLOY_USER` | `root` | 部署机 SSH 登录用户 |
| `DEPLOY_SSH_PORT` | `22` | SSH 端口 |
| `DEPLOY_SSH_CREDENTIALS_ID` | `deploy-ssh-key` | Jenkins 里的 SSH 私钥凭据 ID |

### 🔑 SSH 公钥/私钥配置（部署必需）

rsync over ssh 需要一对密钥：**公钥**放到部署机，**私钥**粘到 Jenkins 凭据，二者必须配对。

**1. 生成密钥对**（任意机器上执行）
```bash
ssh-keygen -t ed25519 -C "mall-web-deploy" -f ~/.ssh/mall_web_deploy
# passphrase 直接回车两次，留空（Jenkins 非交互 SSH 才能通过）
```
生成两个文件：
- 私钥 `~/.ssh/mall_web_deploy` → **粘到 Jenkins 凭据**
- 公钥 `~/.ssh/mall_web_deploy.pub` → **放到部署机**

**2. 公钥加到部署机**
```bash
mkdir -p ~/.ssh && chmod 700 ~/.ssh
cat ~/.ssh/mall_web_deploy.pub >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
```

**3. 私钥粘到 Jenkins 凭据**
`Manage Jenkins → Credentials → Global credentials → Add Credentials`：
- Kind：**SSH Username with private key**
- ID：`deploy-ssh-key`
- Username：部署机登录用户（如 `xiao` / `root`）
- Private Key：**私钥**内容（`-----BEGIN OPENSSH PRIVATE KEY-----` … `-----END OPENSSH PRIVATE KEY-----`）。⚠️ 不要贴公钥 `.pub`。

**4. 校验：三处必须一致**
| 位置 | 内容 |
| ---- | ---- |
| 部署机 `~/.ssh/authorized_keys` | 公钥 |
| Jenkins 凭据的 Private Key | 与上面的公钥**配对**的私钥 |
| 部署机 `/data/mall/web` | 对该 SSH 用户**可写** |

**常见报错**
- `Load key ... error in libcrypto`：私钥贴成了公钥，或私钥带口令 → `ssh-keygen -p -f <私钥>`（回车两次设空）后重贴。
- `Permission denied (publickey)`：公钥/私钥不配对，或 `authorized_keys` 里是占位文本。
- `Permission denied, please try again`：确认用户名、`authorized_keys` 权限（`.ssh=700`、`authorized_keys=600`）、公钥内容正确。

## License

CC0 1.0 Universal (Public Domain)
