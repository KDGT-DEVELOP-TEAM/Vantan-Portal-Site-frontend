<template>
    <div class="grade-filter-container">
      <div class="filter-label">学年 :</div>
      
      <div v-if="!isMobile" class="radio-group">
        <label class="radio-label">
          <input 
            type="radio" 
            value="all" 
            v-model="selectedGradeModel"
          >
          全て
        </label>
        
        <label v-for="grade in grades" :key="grade" class="radio-label">
          <input 
            type="radio" 
            :value="grade.toString()" 
            v-model="selectedGradeModel"
          >
          {{ grade }}年生
        </label>
      </div>

      <select 
        v-else 
        v-model="selectedGradeModel" 
        class="school_year-select-area select-dropdown grade-hover-select"
      >
        <option class="school_year-link" value="all">全て</option>
        <option 
          v-for="grade in grades" 
          :key="grade" 
          :value="grade.toString()" 
          class="school_year-link"
        >
          {{ grade }}年生
        </option>
      </select>
    </div>
</template>
<script>
export default {
    name: 'TimeScheduleGradeFilter',
    props: {
      selectedGrade: {
      type: String,
      default: 'all'
      },
      grades: {
        type: Array,
        default: () => [1,2,3,4,5]
      }
    },
    emits: ['update:selectedGrade', 'filter'],
    data() {
      return {
        // ウィンドウ幅が768px以下の場合にtrueとなるフラグ
        isMobile: false 
      };
    },
    computed: {
      selectedGradeModel: {
        get() {
          return this.selectedGrade;
        },
        set(value) {
          this.$emit('update:selectedGrade', value);
          this.$emit('filter', value);
        }
      }
    },
    watch: {
      selectedGradeModel(newValue) {
        this.$emit('update:selectedGrade', newValue);
        // 値が変更されたら、親コンポーネントにフィルタリングを実行するよう通知
        this.$emit('filter', newValue);
      },
      selectedGrade(newVal) {
        this.selectedGradeModel = newVal;
      }
    },
    mounted() {
        // コンポーネントがマウントされたら初期チェックを実行
        this.checkMobile();
        // ウィンドウサイズ変更時にチェックを実行するためのリスナーを追加
        window.addEventListener('resize', this.checkMobile);
    },
    beforeUnmount() {
        // コンポーネントが破棄される前にリスナーを削除 (メモリリーク防止)
        window.removeEventListener('resize', this.checkMobile);
    },
    methods: {
        // ウィンドウ幅をチェックし、isMobileを更新するメソッド
        checkMobile() {
            // 768px をブレークポイントとする (CSSのメディアクエリと一致させる)
            this.isMobile = window.innerWidth <= 768; 
        }
    }
}
</script>
<style scoped>
/* --- 共通スタイル --- */
.grade-filter-container {
  display: flex;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.filter-label {
  font-weight: bold;
  color: #333;
  margin-right: 20px;
  font-size: 1rem;
  flex-shrink: 0; /* 縮まないようにする */
}

/* --- デスクトップ/タブレット (ラジオボタン) --- */
.radio-group {
  display: flex;
  flex-wrap: wrap; /* 画面幅が狭くなったら折り返す */
  gap: 15px; 
}

.radio-label {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.95rem;
  color: #555;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  /* 選択された時のデザイン (強く強調する) */
  position: relative;
}

.radio-label input[type="radio"] {
  margin-right: 5px;
}

/* --- モバイル (セレクトボックス) --- */
.select-dropdown {
  width: 20%;
  padding: 8px 10px;
  border: 1px solid #FF9999;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  appearance: none; /* デフォルトの矢印を非表示に */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.school_year-select {
  position: relative;
  /* 言語選択のドロップダウンの背景色（画像と同じ淡いピンク）を再現 */
  border: 1px solid #FF9999 !important; /* やや淡い赤のボーダー */
  background-color: #ffffff08 !important; /* ごく薄い赤の背景 */
  border-radius: 4px;
  top: -2px;
  padding: 0 5px; /* ドロップダウン全体の内側パディング */
}
.grade-hover-select:hover {
  background-color: #FFF7F7 !important;
  border: 1px solid #F1494C !important;
}
.grade-hover-select:hover, .grade-hover-select:focus {
  /* フォーカス時のアウトラインを消す*/
  outline: none;
}

/* --- レスポンシブ対応 (768px以下でモバイル表示) --- */
@media (max-width: 768px) {
    .grade-filter-container {
        /* モバイルでは上下の余白を少し減らす */
        padding: 10px 0;
    }
    
    .filter-label {
        /* モバイルではラベルを少し小さく */
        font-size: 0.9rem;
    }
}
</style>