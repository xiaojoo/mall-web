<template>
  <div class="nf-page">
    <!-- ===== 背景装饰层 ===== -->
    <div class="nf-bg">
      <!-- 网格线 -->
      <div class="nf-grid"></div>
      <!-- 旋转光晕（慢速） -->
      <div class="nf-glow"></div>
      <!-- 电路风格装饰线条 -->
      <svg
        class="nf-lines"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g stroke="rgba(64,158,255,0.28)" fill="none" stroke-width="1.2">
          <path d="M-20 120 H 300 V 240 H 480" />
          <path d="M-20 140 H 280 V 260 H 460" opacity="0.5" />
          <path d="M1460 180 H 1150 V 320 H 940" />
          <path d="M1460 205 H 1170 V 345 H 960" opacity="0.5" />
          <path d="M-20 820 H 260 V 700 H 420" opacity="0.7" />
          <path d="M1460 860 H 1200 V 740 H 1000" opacity="0.7" />
          <path d="M720 -20 V 140 H 620" opacity="0.6" />
          <path d="M760 -20 V 180 H 860 V 300" opacity="0.4" />
        </g>
        <g fill="rgba(64,158,255,0.45)">
          <circle cx="480" cy="240" r="3.5" />
          <circle cx="940" cy="320" r="3.5" />
          <circle cx="420" cy="700" r="3.5" />
          <circle cx="1000" cy="740" r="3.5" />
          <circle cx="620" cy="140" r="3" />
          <circle cx="860" cy="300" r="3" />
        </g>
      </svg>
      <!-- 漂浮光点 -->
      <span class="nf-dot nd-1"></span>
      <span class="nf-dot nd-2"></span>
      <span class="nf-dot nd-3"></span>
      <span class="nf-dot nd-4"></span>
    </div>

    <!-- ===== 内容卡片 ===== -->
    <div class="nf-card">
      <div class="nf-code">
        <span class="nf-digit">4</span>
        <span class="nf-zero">
          <el-icon :size="92"><QuestionFilled /></el-icon>
        </span>
        <span class="nf-digit">4</span>
      </div>
      <h1 class="nf-title">页面不存在</h1>
      <p class="nf-desc">你访问的页面可能已被移除、更名，或暂时不可用</p>
      <div class="nf-actions">
        <el-button type="primary" size="large" @click="goHome">
          <el-icon style="margin-right: 6px"><HomeFilled /></el-icon>
          返回首页
        </el-button>
        <el-button size="large" @click="goBack">
          <el-icon style="margin-right: 6px"><Back /></el-icon>
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Back, HomeFilled, QuestionFilled } from '@element-plus/icons-vue'

const router = useRouter()

const goHome = () => {
  router.push('/home')
}

const goBack = () => {
  // 无历史记录时退回首页，避免原地踏步
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/home')
  }
}
</script>

<style scoped lang="scss">
.nf-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: hidden;
  background: radial-gradient(
      1100px 560px at 15% -10%,
      rgba(64, 158, 255, 0.22),
      transparent 60%
    ),
    radial-gradient(
      900px 480px at 100% 115%,
      rgba(122, 64, 255, 0.16),
      transparent 55%
    ),
    radial-gradient(
      700px 420px at 85% 0%,
      rgba(0, 200, 255, 0.1),
      transparent 60%
    ),
    linear-gradient(160deg, #071530 0%, #0c2556 55%, #10357c 100%);
}

/* ===== 背景装饰 ===== */
.nf-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 网格线 */
.nf-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0.05) 1px,
      transparent 1px
    ),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 52px 52px;
  mask-image: radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%);
  -webkit-mask-image: radial-gradient(
    ellipse at 50% 40%,
    #000 30%,
    transparent 75%
  );
}

/* 旋转光晕（纯 transform 旋转，合成器友好） */
.nf-glow {
  position: absolute;
  inset: -50%;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(64, 158, 255, 0.07) 50deg,
    transparent 110deg,
    transparent 200deg,
    rgba(122, 64, 255, 0.06) 260deg,
    transparent 360deg
  );
  animation: nf-spin 48s linear infinite;
}
@keyframes nf-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 电路线条 */
.nf-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* 漂浮光点 */
.nf-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(64, 158, 255, 0.5);
  box-shadow: 0 0 18px rgba(64, 158, 255, 0.6);
  animation: nf-float 7s ease-in-out infinite alternate;
}
.nd-1 {
  width: 7px;
  height: 7px;
  left: 14%;
  top: 22%;
}
.nd-2 {
  width: 5px;
  height: 5px;
  left: 82%;
  top: 18%;
  animation-delay: 1.2s;
  background: rgba(122, 64, 255, 0.55);
  box-shadow: 0 0 14px rgba(122, 64, 255, 0.6);
}
.nd-3 {
  width: 9px;
  height: 9px;
  left: 24%;
  bottom: 18%;
  animation-delay: 2.4s;
  background: rgba(0, 200, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.55);
}
.nd-4 {
  width: 5px;
  height: 5px;
  right: 16%;
  bottom: 26%;
  animation-delay: 3.1s;
}
@keyframes nf-float {
  from {
    transform: translateY(-10px);
  }
  to {
    transform: translateY(12px);
  }
}

/* ===== 内容卡片 ===== */
.nf-card {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 560px;
  width: 100%;
  padding: 48px 32px 40px;
  border-radius: 16px;
  background: rgba(10, 25, 60, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.nf-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  line-height: 1;
}

.nf-digit {
  font-size: 120px;
  font-weight: 800;
  color: #fff;
  text-shadow: 0 0 32px rgba(64, 158, 255, 0.55);
  letter-spacing: -4px;
}

.nf-zero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 108px;
  border-radius: 50%;
  color: #409eff;
  background: rgba(64, 158, 255, 0.12);
  border: 2px solid rgba(64, 158, 255, 0.45);
  box-shadow:
    0 0 34px rgba(64, 158, 255, 0.35) inset,
    0 0 26px rgba(64, 158, 255, 0.25);
}

.nf-title {
  margin: 28px 0 10px;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 4px;
}

.nf-desc {
  margin: 0 0 30px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 1px;
}

.nf-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
}
</style>
