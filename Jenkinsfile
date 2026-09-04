// ============================================================================
// mall-web 前端 Jenkins 流水线（构建 dist + rsync over ssh 部署到 mall nginx）
//
// 流程：Checkout(内置) -> 构建 dist(node 容器) -> (可选) rsync 部署
//
// 说明：
//   - 复用 mall 仓库已部署的 nginx（容器名 nginx，宿主 8088，前端静态根 /data/mall/web）。
//     本流水线只把前端 dist 同步到该 nginx 的宿主静态目录，不再构建/启动第二个 nginx。
//   - dist 在 node:22-alpine 容器内构建（agent 无需装 node/corepack，仅需 docker CLI 且能取到该镜像）。
//   - 部署用 rsync over ssh（目标机也需 rsync；agent 无 rsync 时回退 tar|ssh）。
//
// 前置条件：
//   1. Jenkins 插件：Pipeline、Timestamper、SSH Agent、Git
//   2. Jenkins Agent：git、docker CLI、ssh、rsync(可选)
//   3. Jenkins 凭据：SSH Username + private key，ID=deploy-ssh-key（供 rsync/ssh 到目标机）
//   4. 目标机：/data/mall/web 可写（即 mall nginx 的静态根）
// ============================================================================
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '15'))
    }

    parameters {
        choice(name: 'BUILD_MODE', choices: ['pro', 'test'], description: '构建模式，对应 pnpm build:pro / build:test')
        string(name: 'STATIC_ROOT', defaultValue: '/data/mall/web', description: 'mall nginx 的宿主静态根目录（部署目标）')
        string(name: 'DEPLOY_HOST', defaultValue: '', description: '目标主机 IP/域名；留空则只构建不部署')
        string(name: 'DEPLOY_USER', defaultValue: 'root', description: 'SSH 部署用户')
        string(name: 'DEPLOY_SSH_PORT', defaultValue: '22', description: 'SSH 端口')
        string(name: 'DEPLOY_SSH_CREDENTIALS_ID', defaultValue: 'deploy-ssh-key', description: 'SSH 私钥凭据 ID（需在 Jenkins 凭据中创建，或改用它已有凭据的 ID）')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('构建 dist (node 容器)') {
            steps {
                sh 'mkdir -p /var/lib/jenkins/.cache/mall-web-pnpm'
                sh """
                  docker run --rm --network host \\
                    -v "\$PWD":/app -w /app \\
                    -v /var/lib/jenkins/.cache/mall-web-pnpm:/cache \\
                    -u "\$(id -u):\$(id -g)" -e HOME=/tmp \\
                    -e NPM_CONFIG_REGISTRY=https://registry.npmmirror.com \\
                    -e HTTP_PROXY=http://192.168.31.251:7890 \\
                    -e HTTPS_PROXY=http://192.168.31.251:7890 \\
                    -e http_proxy=http://192.168.31.251:7890 \\
                    -e https_proxy=http://192.168.31.251:7890 \\
                    -e NO_PROXY=localhost,127.0.0.1 \\
                    -e no_proxy=localhost,127.0.0.1 \\
                    -e npm_config_proxy=http://192.168.31.251:7890 \\
                    -e npm_config_https_proxy=http://192.168.31.251:7890 \\
                    -e npm_config_cache=/cache/npm \\
                    node:22-alpine sh -c 'npm install -g --prefix /tmp/pnpm-global pnpm@9.15.0 >/dev/null 2>&1 && export PATH=/tmp/pnpm-global/bin:\$PATH && pnpm install --frozen-lockfile --store-dir /cache/store && pnpm build:${params.BUILD_MODE}'
                """
                sh 'test -d dist && echo "[OK] dist 目录存在"'
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('部署到 mall nginx') {
            when {
                expression { params.DEPLOY_HOST?.trim()?.length() > 0 }
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: params.DEPLOY_SSH_CREDENTIALS_ID, keyFileVariable: 'SSH_KEY')]) {
                    script {
                        def remote = "${params.DEPLOY_USER}@${params.DEPLOY_HOST}"
                        
                        def root = params.STATIC_ROOT.trim()
                        sh """
                            set -e
                            echo '==> 部署到 ${remote}:${root}/'
                            if command -v rsync >/dev/null 2>&1; then
                                rsync -az --delete -e "ssh -i \$SSH_KEY -p ${params.DEPLOY_SSH_PORT} -o StrictHostKeyChecking=no" dist/ ${remote}:${root}/
                                echo '[OK] rsync 部署完成'
                            else
                                echo '==> rsync 不可用，改用 tar|ssh'
                                tar -C dist -cf - . | ssh -i \$SSH_KEY -p ${params.DEPLOY_SSH_PORT} -o StrictHostKeyChecking=no ${remote} 'tar -C ${root} -xf -'
                                echo '[OK] tar|ssh 部署完成（不会自动删除多余旧文件）'
                            fi
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            deleteDir()
        }
    }
}