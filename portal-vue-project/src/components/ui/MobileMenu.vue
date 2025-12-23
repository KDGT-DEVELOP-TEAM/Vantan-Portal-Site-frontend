<template>
  <transition name="slide-down">
    <div v-if="isOpen" class="menu-overlay" @click.self="$emit('close')">
      <div class="mobile-menu-container">
        <ul class="menu-list">
          <!-- 言語選択（そのまま） -->
          <li>
            <div class="language-select-area menu-link">
              <div class="language-select">
                <a href="#" class="nav-link language-link">
                  日本語 <span style="color: #FF9999;">▼</span>
                </a>
              </div>
            </div>
          </li>

          <!-- メニュー -->
          <li
            v-for="item in menuItems"
            :key="item.label"
          >
            <router-link
              v-if="!item.roles || item.roles.includes(userRole)"
              :to="item.to"
              class="menu-link"
              :class="{ 'active-link': $route.path === item.to }"
              @click="$emit('close')"
            >
              {{ item.label }}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </router-link>
          </li>

          <!-- ログアウト -->
          <li class="logout-link">
            <div class="menu-link" @click="handleLogoutAndClose">
              ログアウト
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </transition>
</template>

  
<script>
  export default {
    name: 'MobileMenu',
    props: {
      isOpen: {
        type: Boolean,
        required: true
      },
      userRole: {
        type: String,
        required: true
      }
    },
    emits: ['close', 'logout'],
    data() {
      return {
        menuItems: [
          { label: 'ホーム', to: '/home' },
          { label: 'お知らせ', to: '/notices' },
          { label: 'カレンダー', to: '/calendar' },
          { label: '時間割リスト', to: '/timeschedules' },
          { label: 'ファイル', to: '/files' },
          { label: '在校生ギャラリー', to: '/gallery' },
          { label: 'ユーザー管理', to: '/admin', roles: ['admin'] }
        ]
      }
    },
    watch: {
      isOpen(val) {
        document.body.style.overflow = val ? 'hidden' : ''
      }
    },
    methods: {
      handleLogoutAndClose() {
        this.$emit('logout')
        this.$emit('close')
      }
    }
  }
  </script>
  
  
  <style scoped>
  /* =======================================================
     Vue Transition (スライドイン・スライドアウト) の設定
     ======================================================= */
  
  /* アニメーション中に適用されるクラス */
  .slide-down-enter-active,
  .slide-down-leave-active {
    /* 0.4秒かけてtransformを滑らかに変化させる */
    transition: transform 0.4s ease-out;
  }
  
  /* 描画前の初期状態（画面外の上）と非表示になった後の最終状態 */
  .slide-down-enter-from,
  .slide-down-leave-to {
    /* 垂直方向に100%（メニュー自身の高さ分）上に移動させる */
    transform: translateY(-100%);
  }
  
  /* 描画後の最終状態（画面内の定位置）と非表示になる前の状態 */
  .slide-down-enter-to,
  .slide-down-leave-from {
    /* 定位置（0）に移動 */
    transform: translateY(0);
  }
  
  
  /* =======================================================
     メニューのレイアウト・デザイン
     ======================================================= */
  
  /* オーバーレイ */
  .menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 998; 
  }
  
  /* モバイルメニューコンテナ全体のスタイル */
  .mobile-menu-container {
    background-color: #1b1b1b94; 
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh; 
    z-index: 999;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    
    display: flex;
    flex-direction: column;
  }
  
  /* 1. メニュー上部の固定ヘッダー (LOGOと閉じるボタン) */
  .menu-header-fixed {
    margin-top: 100px;
    justify-content: space-between;
    align-items: center;
    background-color: white; 
    padding: 12px 20px;
    width: 100%;
    height: 10px; 
    min-height: 10px;
  }
  
  .menu-header-fixed .logo {
    font-weight: bold;
    font-size: 1.5rem;
    color: white; 
  }
  
  /* 閉じるボタン (Xマーク) */
  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    color: white; 
  }
  
  .close-button svg {
    width: 24px;
    height: 24px;
  }
  
  /* 2. 言語選択エリア */
  .language-select-area {
    margin-top: 60px;
    background-color: #F1494C !important; /* 画像の淡いピンクの背景 */
    padding: 10px 20px;
  }
  
  .language-select {
    position: relative;
    /* 言語選択のドロップダウンの背景色（画像と同じ淡いピンク）を再現 */
    border: 1px solid #FF9999; /* やや淡い赤のボーダー */
    background-color: white; /* ごく薄い赤の背景 */
    border-radius: 4px;
    top: -2px;
    padding: 0 5px; /* ドロップダウン全体の内側パディング */
  }

  .language-select:hover {
    border: 1px solid #F1494C;
    background-color: #fff9f9;
  }
  .nav-link {
    text-decoration: none;
    color: #333;
    padding: 5px 10px;
    transition: color 0.2s;
    /* アンダーバーと重ならないように、padding-bottomを調整 */
    padding-bottom: 8px; 
    display: block; /* active-linkでborder-bottomを使うために必要 */
  }
  .language-link {
    padding: 5px 7px; 
    margin-top: 2px;
    color: #333 !important;
    border-bottom: none !important;
}
  
  .language-text {
    color: #F1494C;
    font-weight: bold;
    font-size: 0.9rem;
    display: block;
  }
  
  /* 3. メニューリスト */
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
  
  /* リンクとログアウト */
  .menu-link {
    display: flex;
    justify-content: space-between; 
    align-items: center;
    text-decoration: none;
    color: white;
    background-color: #F1494C;
    padding: 23px 20px; 
    font-size: 1.1rem;
    font-weight: 500;
    transition: background-color 0.2s;
  }
  
  .menu-link:hover {
    background-color: #A32A2A; 
  }
  
  /* 現在地のリンク */
  .active-link {
    background-color: #d13a3a; 
    font-weight: bold;
  }
  
  /* リンク右側の矢印 (>) */
  .menu-link svg {
    width: 18px;
    height: 18px;
    color: white;
  }
  
  /* ログアウト項目 */
  .logout-link {
      margin-top: auto; 
  }
  </style>