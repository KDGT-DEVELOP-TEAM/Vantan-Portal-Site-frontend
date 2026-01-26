<template>
  <header class="main-header">
    <div class="header-content">
      <div class="logo">
        <img
          src="@/assets/image/logo/バンタン②.jpg"
          alt="サイトlogo"
          draggable="false"
          class="sight_logo"
          @contextmenu.prevent
        />
        <img
          v-if="schoolIcon && schoolIcon !== 'null'"
          :src="schoolIcon"
          alt="学校アイコン"
          class="sight_logo"
          draggable="false"
          @contextmenu.prevent
        />
      </div>

      <div class="pc-nav">
        <nav>
          <ul class="nav-list">
            <li v-for="item in filteredNavItems" :key="item.name">
              <router-link
                :to="{ name: item.name }"
                class="nav-link"
                active-class="active-link"
              >
                {{ $t(item.labelKey) }}
              </router-link>
            </li>
            <!-- ログアウト -->
            <li>
              <div
                class="nav-link"
                @click="$emit('logout')">
                {{ $t('common.logout') }}
              </div>
            </li>

            <!-- 言語 -->
            <li class="language-select">
              <select 
                v-model="$i18n.locale" 
                class="nav-link language-dropdown"
              >
                <option value="ja">日本語</option>
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ko">한국어</option>
              </select>
            </li>
          </ul>
        </nav>
      </div>

      <HamburgerMenu
        :is-open="isMenuOpen"
        @toggle="toggleMenu"
        class="mobile-menu-icon"
      />
    </div>
  </header>

  <MobileMenu
    :is-open="isMenuOpen"
    @logout="handleLogout"
    @close="isMenuOpen = false"
    @change-language="changeLocale" 
  />
</template>

<script>
  import HamburgerMenu from './HamburgerMenu.vue';
  import MobileMenu from './MobileMenu.vue';
  import { menuItems } from '@/assets/menuItems';

  // もし setLocale を用意しているならここで使う（無ければコメントアウトでOK）
  // import { setLocale } from '@/i18n';

  export default {
    name: 'Header',
    components: {
      HamburgerMenu,
      MobileMenu,
    },
    emits: ['logout'],
    data() {
      return {
        isMenuOpen: false,
        mediaQuery: null,
        navItems: menuItems,
        schoolIcon: null,
        
        // 言語UI（不要なら削除OK）
        isLanguageMenuOpen: false,
        supportedLocales: ['ja', 'en', 'zh', 'ko'],
      };
    },
    computed: {
      filteredNavItems() {
        // NOTE: 本来は authState 等の state 参照が理想
        // 最低限、JSON.parse 失敗しても落ちないようにケア
        let permissions = [];
        try {
          permissions = JSON.parse(localStorage.getItem('userPermissions') || '[]');
          if (!Array.isArray(permissions)) permissions = [];
        } catch {
          permissions = [];
        }

        return this.navItems.filter((item) => {
          if (!item.permission) return true;
          return permissions.includes(item.permission);
        });
      },

      // 表示用ラベル（i18nに寄せるならここも $t でOK）
      currentLanguageLabel() {
        const loc = this.$i18n?.global?.locale?.value || 'ja';
        return this.localeLabel(loc);
      },

    },
    methods: {
      handleLogout() {
        this.$emit('logout');
        this.isMenuOpen = false;
        this.isLanguageMenuOpen = false;
      },

      toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        // モバイルメニュー開閉時に言語メニューは閉じる
        if (this.isMenuOpen) this.isLanguageMenuOpen = false;
      },

      handleMediaChange(e) {
        // PC幅に戻ったらモバイルメニューを閉じる
        if (!e.matches) {
          this.isMenuOpen = false;
        }
      },

      toggleLanguageMenu() {
        this.isLanguageMenuOpen = !this.isLanguageMenuOpen;
      },

      // 言語ラベル（最小：必要なら i18n のキーへ寄せてOK）
      localeLabel(locale) {
        switch (locale) {
          case 'ja':
            return '日本語';
          case 'en':
            return 'English';
          case 'zh':
            return '中文';
          case 'ko':
            return '한국어';
          default:
            return locale;
        }
      },

      changeLocale(locale) {
        if (!this.supportedLocales.includes(locale)) return;

        if (this.$i18n?.global?.locale) {
          this.$i18n.global.locale.value = locale;
        }

        this.isLanguageMenuOpen = false;
      }

    },
    mounted() {
      this.mediaQuery = window.matchMedia('(max-width: 1124px)');
      this.mediaQuery.addEventListener('change', this.handleMediaChange);
      this.schoolIcon = localStorage.getItem('schoolIcon')

      // outside click（言語ドロップダウン閉じ）
      this._onDocClick = (e) => {
        const header = this.$el?.querySelector?.('.main-header');
        if (header && header.contains(e.target)) return;
        this.isLanguageMenuOpen = false;
      };
      document.addEventListener('click', this._onDocClick);
    },
    beforeUnmount() {
      if (this.mediaQuery) {
        this.mediaQuery.removeEventListener('change', this.handleMediaChange);
      }
      if (this._onDocClick) {
        document.removeEventListener('click', this._onDocClick);
        this._onDocClick = null;
      }
    },
  };
</script>
  
  
<style scoped>
.main-header {
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 画像から判断して、パディングは画像に近づけるため上下はやや小さめに、左右は維持 */
  padding: 8px 0px; 
  border-bottom: 1px solid #e0e0e0;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  /* モバイルメニューより手前に表示 */
  z-index: 1000; 
}

.header-content {
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 1200px; /* 必要に応じて最大幅を設定 */
    margin: 0 auto; /* 中央寄せ */
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #333;
}

.sight_logo {
  height: 48px;
  pointer-events: none;
  -webkit-user-drag: none;
  user-select: none;
}

/* PC用ナビゲーションを `pc-nav` クラスでラップしました */
.pc-nav {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 0;
  margin-top: 30px;
  width: 100%;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-list li {
  /* 画像のメニュー間隔に近づけます */
  margin-left: 15px; 
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

.nav-link:hover {
  color: #f15b5b; /* ホバー時に赤色 */
}

/* 現在地を示すアクティブリンクのスタイル */
.active-link {
  color: #f15b5b; /* 現在地の色を赤に */
  font-weight: bold; /* 現在地を強調 */
  border-bottom: 3px solid #f15b5b; /* アンダーバーの追加 */
  
}

/* .user-management-link {
    font-weight: bold;
} */

.language-link {
    /* 言語選択リンクは他のナビリンクとスタイルを揃えつつ、
       ドロップダウンの背景を壊さないようにactive-linkのborderは無効化 */
    padding: 5px 7px; 
    margin-top: 2px;
    color: #333 !important;
    border-bottom: none !important;
}
/* 余計な装飾を消してスッキリさせる */
.language-dropdown {
  background: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  font-size: 0.9rem;
  color: #333;
  padding: 5px 10px;
}

.language-select {
  border: 1px solid #FF9999;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.language-select:hover {
  border-color: #F1494C;
  background-color: #FFF7F7;
}

/* ナビゲーションの配置を調整 */
.header-content > div:last-child {
    /* ナビゲーション全体を右に寄せるために調整 */
    margin-left: auto;
}
/* 新しく追加するレスポンシブ用のスタイル */
.mobile-menu-icon {
      display: none; /* デフォルトでは非表示 */
      /* ハンバーガーアイコンを右端に配置 */
      margin-left: 20px; 
      flex-direction: column;
      align-items: center;
      justify-content: center;
  }
  
  /* 992px以下の画面幅でスタイルを切り替え */
  @media (max-width: 1124px) {
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 80%;
      max-width: 1200px; /* 必要に応じて最大幅を設定 */
      margin: 0 auto; /* 中央寄せ */
    }
    /* PC用ナビゲーションを非表示 */
    .pc-nav {
      display: none;
    }
    
    /* ハンバーガーアイコンを表示 */
    .mobile-menu-icon {
      display: block;
      margin-left: auto; /* ロゴを左、アイコンを右に寄せる */
      margin-right: -56px;
    }
    
    /* ハンバーガーアイコンを、ヘッダーの白い背景で見えるように赤色にします */
    .mobile-menu-icon :deep(.hamburger span) {
        background: #f15b5b;
        position: absolute;
    }
    
    /* ヘッダーのパディング調整 (スマホ向け) */
    .main-header {
        padding: 0 0 0 0;
    }
    .logo {
      font-size: 18px;
      margin-left: -30px;
    }
  }
  </style>