<template>
  <transition name="slide-down">
    <div v-if="isOpen" class="menu-overlay" @click="$emit('close')">
      <div class="mobile-menu-container" @click.stop>
        <ul class="menu-list">
          <!-- 言語 -->
          <li class="language-select-item">
            <div class="language-select-area menu-link">
            <div class="language-select">
              <select 
                v-model="$i18n.locale" 
                class="mobile-lang-select"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ko">한국어</option>
              </select>
            </div>
          </div>
          </li>

          <!-- メニュー -->
          <li v-for="item in filteredMenuItems" :key="item.name">
            <router-link
              :to="{ name: item.name }"
              class="menu-link"
              :class="{ 'active-link': $route.name === item.name }"
              @click="$emit('close')"
            >
              {{ item.labelKey ? $t(item.labelKey) : item.label }}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
                />
              </svg>
            </router-link>
          </li>

          <!-- ログアウト -->
          <li class="logout-link">
            <button
              type="button"
              class="menu-link"
              @click="logoutAndClose"
            >
              {{ $t('common.logout') }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>

<script>
import { menuItems } from '@/assets/menuItems';

export default {
  name: 'MobileMenu',
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close', 'logout', 'change-language'],
  data() {
    return {
      showLang: false,
    };
  },
  computed: {
    filteredMenuItems() {
      const permissions = JSON.parse(
        localStorage.getItem('userPermissions') || '[]'
      );

      return menuItems.filter((item) => {
        if (!item.permission) return true;
        return permissions.includes(item.permission);
      });
    },
  },
  methods: {
    logoutAndClose() {
      this.$emit('logout');
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
/* ===== Vue Transition ===== */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.4s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-100%);
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: translateY(0);
}

/* ===== Layout ===== */
.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 998;
  overflow: hidden;
}

.mobile-menu-container {
  background-color: #1b1b1b94;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 100vh;
}

/* 言語選択 */
.language-select-area {
  margin-top: 35px;
  background-color: #f1494c !important;
  padding: 4px 16px;
}

.language-select {
  position: relative;
  border: 1px solid #ff9999;
  background-color: white;
  border-radius: 4px;
  margin-top: 25px;
  top: -2px;
  padding: 0 5px;
}

.language-select:hover {
  border: 1px solid #f1494c;
  background-color: #fff9f9;
}

.nav-link {
  color: #333;
  padding: 5px 10px;
  padding-bottom: 8px;
  display: block;
}

.language-link {
  width: 100%;
  background: transparent;
  border: none;
  text-align: left;
  cursor: pointer;
  padding: 5px 7px;
  margin-top: 2px;
  color: #333 !important;
}

/* メニュー */
.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  overflow-y: auto;
}

.menu-list li {
  border-bottom: 1px solid rgb(255, 255, 255);
}

.language-select-item {
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  background-color: #f1494c; /* メニューの色に合わせる */
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.mobile-lang-select {
  width: 100%;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid white;
  background-color: white;
  color: #333;
  font-size: 1rem;
}

.menu-link {
  display: flex;
  justify-content: space-between;
  align-items: center;

  color: white;
  background-color: #f1494c;
  padding: 23px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: background-color 0.2s;
  text-decoration: none;
}

button.menu-link {
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: left;
}

.menu-link:hover {
  background-color: #a32a2a;
}

.active-link {
  background-color: #d13a3a;
  font-weight: bold;
}

.menu-link svg {
  width: 18px;
  height: 18px;
  color: white;
}

.logout-link {
  margin-top: auto;
}
</style>