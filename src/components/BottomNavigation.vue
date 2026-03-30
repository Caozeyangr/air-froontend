<template>
  <div class="bottom-navigation">
    <div class="navigation-container">
      <div v-for="item in navigationItems" :key="item.id" class="nav-item">
        <div class="icon-container">
          <img :src="item.icon" :alt="item.label" class="nav-icon" />
        </div>
        <div class="nav-label">{{ item.label }}</div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import icon1 from "../assets/content/模型算法开发.png";
import icon2 from "../assets/content/模型训练运行.png";
import icon3 from "../assets/content/模型库.png";
import icon4 from "../assets/content/工作流构建.png";
import icon5 from "../assets/content/样本制作管理.png";
import icon6 from "../assets/content/研究管理协同.png";

const navigationItems = ref([
  {
    id: 1,
    label: "模型算法开发",
    icon: icon1,
  },
  {
    id: 2,
    label: "模型训练运行",
    icon: icon2,
  },
  {
    id: 3,
    label: "模型库",
    icon: icon3,
  },
  {
    id: 4,
    label: "工作流构建",
    icon: icon4,
  },
  {
    id: 5,
    label: "样本制作管理",
    icon: icon5,
  },
  {
    id: 6,
    label: "研究管理协同",
    icon: icon6,
  },
]);
</script>
<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 20px 0;
}

.navigation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 60px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:hover {
  transform: translateY(-2px);
}

.icon-container {
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(22, 93, 255, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(22, 93, 255, 0.3);
}

.nav-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.nav-label {
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .navigation-container {
    gap: 40px;
  }

  .icon-container {
    width: 50px;
    height: 50px;
  }

  .nav-icon {
    width: 35px;
    height: 35px;
  }

  .nav-label {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .navigation-container {
    gap: 20px;
    padding: 0 10px;
  }

  .icon-container {
    width: 40px;
    height: 40px;
  }

  .nav-icon {
    width: 30px;
    height: 30px;
  }

  .nav-label {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .navigation-container {
    gap: 15px;
    flex-wrap: wrap;
  }

  .nav-item {
    flex: 1 1 calc(50% - 15px);
    max-width: calc(50% - 15px);
  }

  .icon-container {
    width: 35px;
    height: 35px;
  }

  .nav-icon {
    width: 25px;
    height: 25px;
  }

  .nav-label {
    font-size: 10px;
  }
}
</style>
