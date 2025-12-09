<template>
  <header class="main-header">
    <div class="header-content">
      <div class="logo">LOGO</div>
        
        <div class="pc-nav">
        <nav>
          <ul class="nav-list">
            <li>
              <a 
                href="/home" 
                class="nav-link" 
                :class="{ 'active-link': currentPage === 'ホーム' }"
              >
                ホーム
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="nav-link" 
                :class="{ 'active-link': currentPage === 'お知らせ' }"
              >
                お知らせ
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="nav-link" 
                :class="{ 'active-link': currentPage === 'カレンダー' }"
              >
                カレンダー
              </a>
            </li>
            <li>
              <a 
                href="/timeschedules"
                class="nav-link" 
                :class="{ 'active-link': currentPage === '時間割リスト' }"
              >
                時間割リスト
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="nav-link" 
                :class="{ 'active-link': currentPage === 'ファイル' }"
              >
                ファイル
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="nav-link" 
                :class="{ 'active-link': currentPage === '在校生ギャラリー' }"
              >
                在校生ギャラリー
              </a>
            </li>
            <li>
              <a 
                href="#" 
                class="nav-link" 
                :class="{ 'active-link': currentPage === 'ログアウト' }"
                @click.prevent="handleLogout" 
              >
                ログアウト
              </a>
            </li>
            <li v-if="userRole === 'admin'">
              <a 
                href="#" 
                class="nav-link user-management-link"
                :class="{ 'active-link': currentPage === 'ユーザー管理' }"
              >
                ユーザー管理
              </a>
            </li>
            <li class="language-select">
              <a href="#" class="nav-link language-link">日本語 <span style="color: #FF9999;">▼</span></a>
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
      :current-page="currentPage"
      :user-role="userRole"
      @logout="handleLogout"
      @close="toggleMenu"
    />
</template>

<script>
  // 必要なコンポーネントをインポート
  import HamburgerMenu from './HamburgerMenu.vue';
  import MobileMenu from './MobileMenu.vue';
  
export default {
  name: 'Header',
    components: {
      HamburgerMenu,
      MobileMenu
    },
  props: {
    // App.vueからHomeViewを経由して渡されたロール
    userRole: {
      type: String,
      required: true,
      validator: (value) => ['admin', 'viewer'].includes(value)
    },
    // 現在表示しているページ名を受け取るプロパティ
    currentPage: {
      type: String,
      required: true
    }
  },
  emits: ['logout'],
    // メニューの開閉状態を管理するデータ
    data() {
      return {
        isMenuOpen: false
      };
    },
  methods: {
    handleLogout() {
      // ログアウトリンクがクリックされたら、親コンポーネントに通知（HomeViewへ）
      console.log('Header.vue: ログアウトイベント発火');
      this.$emit('logout');
        // ログアウトと同時にメニューを閉じる
        this.isMenuOpen = false;
      },
      toggleMenu() {
        // メニューの開閉を切り替える
        this.isMenuOpen = !this.isMenuOpen;
      }
    },
    // --- ここからスクロール禁止制御をライフサイクル＋ウォッチで追加 ---
    watch: {
      isMenuOpen(newValue) {
        if (newValue) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      }
    },
    mounted() {
      // 初回レンダリング時に（実際にはまずfalseだが）ガード
      if (this.isMenuOpen) {
        document.body.style.overflow = 'hidden';
      }
    },
    beforeUnmount() {
      // ヘッダーアンマウント時に解放
      document.body.style.overflow = '';
    }
    // --- ここまで ---
}
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