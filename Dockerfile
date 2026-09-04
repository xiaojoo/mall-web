# ---------------------------------------------------------------
# mall-web 前端 Docker 镜像（多阶段构建）
#   阶段1:  node 拉取依赖并构建 Vue 静态产物(-> /app/dist)
#   阶段2:  nginx 承载静态产物 + SPA 路由回退
# 用法:
#   docker build -t mall-web --build-arg BUILD_MODE=pro .
# ---------------------------------------------------------------
# syntax=docker/dockerfile:1

# ---------- 构建阶段 ----------
FROM node:22-alpine AS build
WORKDIR /app

# 部分原生依赖(native modules)需要 libc6-compat
RUN apk add --no-cache libc6-compat

# 固定 pnpm 9（与 pnpm-lock.yaml 的 lockfileVersion 9.0 匹配）。
# 若 corepack 不可用，可改为: RUN npm install -g pnpm@9
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# 先复制清单，利用 Docker 层级缓存加速重复构建
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# 复制源码并构建（.dockerignore 已剔除 node_modules / dist 等）
# BUILD_MODE: pro（生产）或 test（测试），对应 pnpm build:pro / build:test
COPY . .
ARG BUILD_MODE=pro
RUN pnpm build:${BUILD_MODE}

# ---------- 运行阶段 ----------
FROM nginx:1.27-alpine AS runner

# 构建产物放入 nginx 静态目录
COPY --from=build /app/dist /usr/share/nginx/html
# SPA 路由 + 资源缓存配置
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 简单的存活探测（nginx:alpine 自带 busybox wget）
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
