<template>
  <header class="main-header">
    <div class="header-content">
      <div class="logo">LOGO</div>

      <div class="pc-nav">
        <nav>
          <ul class="nav-list">
            <li v-for="item in filteredNavItems" :key="item.name">
              <router-link
                :to="item.route"
                class="nav-link"
                active-class="active-link"
              >
                {{ item.label }}
              </router-link>
            </li>
            <!-- ログアウト -->
            <li>
              <a
                href="#"
                class="nav-link"
                @click.prevent="handleLogout"
              >
                ログアウト
              </a>
            </li>

            <!-- 言語 -->
            <li class="language-select">
              <a href="#" class="nav-link language-link">
                日本語 <span style="color:#FF9999;">▼</span>
              </a>
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
    :user-role="userRole"
    @logout="handleLogout"
    @close="toggleMenu"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import HamburgerMenu from './HamburgerMenu.vue';
import MobileMenu from './MobileMenu.vue';

const props = defineProps({
  userRole: {
    type: String,
    required: true,
  },
  currentPage: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['logout']);

const isMenuOpen = ref(false);
let mediaQuery = null;

const navItems = ref([
  { label: 'ホーム', route: '/home', name: 'Home' },
  { label: 'お知らせ', route: '/news', name: 'NewsList' },
  { label: 'カレンダー', route: '/calendar', name: 'CalendarView' },
  { label: '時間割リスト', route: '/timeschedules', name: 'TimeScheduleList' },
  { label: 'ファイル', route: '/files', name: 'FileList' },
  { label: '在校生ギャラリー', route: '/gallery', name: 'GalleryList' },
  { label: 'ユーザー管理', route: '/users', name: 'UserList', role: 'admin' },
]);

const filteredNavItems = computed(() => {
  return navItems.value.filter(item => {
    if (!item.role) return true;
    return item.role === props.userRole;
  });
});

const handleLogout = () => {
  emit('logout');
  isMenuOpen.value = false;
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleMediaChange = (e) => {
  if (!e.matches) {
    isMenuOpen.value = false;
  }
};

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 1124px)');
  mediaQuery.addEventListener('change', handleMediaChange);
});

onBeforeUnmount(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', handleMediaChange);
  }
});
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

.language-select {
    position: relative;
    /* 言語選択のドロップダウンの背景色（画像と同じ淡いピンク）を再現 */
    border: 1px solid #FF9999; /* やや淡い赤のボーダー */
    background-color: #ffffff08; /* ごく薄い赤の背景 */
    border-radius: 4px;
    top: -2px;
    padding: 0 5px; /* ドロップダウン全体の内側パディング */
}

.language-select:hover {
  border: 1px solid #F1494C;
  background-color: #FFF7F7;
}

.language-link {
    /* 言語選択リンクは他のナビリンクとスタイルを揃えつつ、
       ドロップダウンの背景を壊さないようにactive-linkのborderは無効化 */
    padding: 5px 7px; 
    margin-top: 2px;
    color: #333 !important;
    border-bottom: none !important;
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
      align-items: flex;
      justify-content: flex;
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

.language-select {
    position: relative;
    /* 言語選択のドロップダウンの背景色（画像と同じ淡いピンク）を再現 */
    border: 1px solid #FF9999; /* やや淡い赤のボーダー */
    background-color: #ffffff08; /* ごく薄い赤の背景 */
    border-radius: 4px;
    top: -2px;
    padding: 0 5px; /* ドロップダウン全体の内側パディング */
}

.language-select:hover {
  border: 1px solid #F1494C;
  background-color: #FFF7F7;
}

.language-link {
    /* 言語選択リンクは他のナビリンクとスタイルを揃えつつ、
       ドロップダウンの背景を壊さないようにactive-linkのborderは無効化 */
    padding: 5px 7px; 
    margin-top: 2px;
    color: #333 !important;
    border-bottom: none !important;
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
      align-items: flex;
      justify-content: flex;
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