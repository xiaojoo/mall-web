// =====================================================================
// mall-web 前端 Jenkins 流水线
//
// 流程:
//   Checkout(内置) → 取镜像Tag → 依赖安装 → 前端构建 → Docker 构建
//                  → (可选)推送镜像仓库 → 通过 SSH 部署容器到 Docker 主机
//
// 前置条件:
//   1. Jenkins 插件: Pipeline、Credentials Binding、SSH Agent、
//      Timestamper、AnsiColor、Blue Ocean(可选)、Workspace Cleanup
//   2. Jenkins Agent 节点需具备: git、node(>=22)、corepack、docker CLI
//   3. 在 Jenkins "凭据" 中创建:
//        - username/password 类型, 凭据 ID: registry-credentials
//          (镜像仓库账号; 仅当使用 PUSH_REGISTRY 时需要)
//        - SSH Username with private key 类型, 凭据 ID: deploy-ssh-key
//          (用于 SSH 到部署主机执行 docker 命令)
//   4. 在 Jenkins 任务里配置 "参数化构建过程"，或直接按下方 parameters 填值。
//      本项目未硬编码任何服务器地址/密码，均为运行时参数。
//
// 说明:
//   * 若 REGISTRY_URL 非空并启用 PUSH_REGISTRY，镜像会推送并部署主机 docker pull；
//   * 若 REGISTRY_URL 为空，则走本地 docker save | ssh 主机 docker load 传输，
//     无需额外镜像仓库。
// =====================================================================
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    parameters {
        choice(name: 'BUILD_MODE', choices: ['pro', 'test'], description: '构建模式，对应 pnpm build:pro / build:test')
        string(name: 'IMAGE_TAG', defaultValue: '', description: '镜像标签，留空则使用 Git 短 SHA')
        string(name: 'APP_NAME', defaultValue: 'mall-web', description: '容器名/镜像名前缀')
        string(name: 'HOST_PORT', defaultValue: '8080', description: '宿主端口映射(容器80)。若外层 nginx 通过 docker 网络按容器名访问，请留空')
        string(name: 'DOCKER_NETWORK', defaultValue: 'webnet', description: '容器接入的自定义 docker 网络（与已部署 nginx 同网即可被代理）')
        string(name: 'REGISTRY_URL', defaultValue: '', description: '镜像仓库地址，例如 registry.example.com/library；留空=不做仓库推送')
        booleanParam(name: 'PUSH_REGISTRY', defaultValue: false, description: '是否推送镜像到 REGISTRY_URL（需配置仓库凭据）')
        string(name: 'DEPLOY_HOST', defaultValue: '', description: '部署目标主机 IP/域名；留空则跳过部署')
        string(name: 'DEPLOY_USER', defaultValue: 'root')
        string(name: 'DEPLOY_SSH_PORT', defaultValue: '22')
    }

    environment {
        // 凭据 ID（在 Jenkins 凭据中配置，ID 本身非机密）
        REGISTRY_CREDENTIALS_ID = 'registry-credentials'
        DEPLOY_SSH_CREDENTIALS_ID = 'deploy-ssh-key'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('初始化') {
            steps {
                script {
                    def shortSha = env.GIT_COMMIT ? env.GIT_COMMIT.take(7) : 'build'
                    env.IMAGE_TAG = params.IMAGE_TAG ?: shortSha
                    env.IMAGE_NAME = params.REGISTRY_URL ? "${params.REGISTRY_URL}/${params.APP_NAME}" : params.APP_NAME
                    echo "=> 镜像: ${env.IMAGE_NAME}:${env.IMAGE_TAG}  模式: ${params.BUILD_MODE}  部署主机: ${params.DEPLOY_HOST ?: '(未配置,跳过部署)'}"
                }
            }
        }

        stage('依赖安装') {
            steps {
                sh 'corepack enable'
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('前端构建') {
            steps {
                // build 脚本为 build:test / build:pro
                sh "pnpm build:${params.BUILD_MODE}"
            }
        }

        stage('构建 Docker 镜像') {
            steps {
                sh "docker build -f Dockerfile -t ${env.IMAGE_NAME}:${env.IMAGE_TAG} --build-arg BUILD_MODE=${params.BUILD_MODE} ."
            }
        }

        stage('推送镜像仓库') {
            when {
                expression { params.PUSH_REGISTRY && params.REGISTRY_URL }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: env.REGISTRY_CREDENTIALS_ID,
                                                  usernameVariable: 'REG_USER',
                                                  passwordVariable: 'REG_PASS')]) {
                    sh """
                        set -e
                        echo "\${REG_PASS}" | docker login "${params.REGISTRY_URL}" -u "\${REG_USER}" --password-stdin
                        docker tag ${env.IMAGE_NAME}:${env.IMAGE_TAG} ${env.IMAGE_NAME}:latest
                        docker push ${env.IMAGE_NAME}:${env.IMAGE_TAG}
                        docker push ${env.IMAGE_NAME}:latest
                    """
                }
            }
        }

        stage('部署到 Docker 主机') {
            when {
                expression { params.DEPLOY_HOST }
            }
            steps {
                sshagent([env.DEPLOY_SSH_CREDENTIALS_ID]) {
                    script {
                        def remote = "${params.DEPLOY_USER}@${params.DEPLOY_HOST}"
                        def sshOpts = "-p ${params.DEPLOY_SSH_PORT} -o StrictHostKeyChecking=no"

                        // 无仓库时，把本地镜像直接传到部署主机
                        if (!params.REGISTRY_URL) {
                            sh "docker save ${env.IMAGE_NAME}:${env.IMAGE_TAG} | ssh ${sshOpts} ${remote} 'docker load'"
                        }

                        // 远程运行脚本：停止旧容器 → 确保网络 → 启动新容器
                        def runScript = """
                            set -e
                            APP="${params.APP_NAME}"
                            IMG="${env.IMAGE_NAME}:${env.IMAGE_TAG}"
                            NET="${params.DOCKER_NETWORK}"
                            PORT="${params.HOST_PORT}"
                            docker rm -f "\$APP" 2>/dev/null || true
                            docker network inspect "\$NET" >/dev/null 2>&1 || docker network create "\$NET"
                            PUBLISH=""
                            [ -n "\$PORT" ] && PUBLISH="-p \${PORT}:80"
                            docker run -d --name "\$APP" --restart unless-stopped \$PUBLISH --network "\$NET" "\$IMG"
                            echo "=> deployed: \$(docker ps --filter name=\$APP --format '{{.Names}} -> {{.Status}} | {{.Image}}')"
                        """
                        sh "ssh ${sshOpts} ${remote} 'bash -s' <<'REMOTE'\n${runScript}\nREMOTE"
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
