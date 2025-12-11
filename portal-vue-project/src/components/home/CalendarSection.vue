<template>
  <section class="calendar-section">
    <div class="calendar-box">
      <div class="calendar-content">
        <div class="calendar-iframe-container">
          <iframe
            :src="calendarUrl"
            style="border: 0"
            width="100%"
            :height="iframeHeight"
            frameborder="0"
            scrolling="no"
          ></iframe>
        </div>
        <a href="/calendar?from=widget" class="view-more-link">View More</a>
      </div>
    </div>
  </section>
</template>
  
<script>
export default {
  name: 'CalendarSection',
  props: {
    // HomePageAPIViewから渡されるカレンダー埋め込みURL
    calendarUrl: {
      type: String,
      required: true,
      default: 'Calendar URL Not Set'
    }
  },
  data() {
    return {
      isMobile: false
    }
  },
  computed: {
    iframeHeight() {
      // モバイルなら高さ150px、それ以外は250px
      return this.isMobile ? 150 : 250;
    }
  },
  mounted() {
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
  },
  methods: {
    checkMobile() {
      this.isMobile = window.innerWidth <= 767;
    }
  }
}
</script>
  
<style scoped>
.calendar-box {
  width: 100%;
  margin-bottom: 10px;
  margin-top: 100px;
  position: relative; /* 子要素の絶対配置の基準に */
}

/* カレンダーのアスペクト比を制御するcontainer */
/* デフォルトは横長(スマホ以外/PC)でpadding-top: 65% (16:10に近い横長) */
.calendar-iframe-container {
  width: 100%;
  position: relative;
  padding-top: 50%;
  background-color: #e0e0e0;
  margin-top: -3%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #aaa;
  font-style: italic;
  margin-bottom: 10px;
  overflow: hidden;
}

.calendar-iframe-container iframe {
  /* カレンダーiframeをcontainer内でフィット */
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
}

/* スマホでは縦横比を正方形(1:1)に変更 */
@media (max-width: 767px) {
  .calendar-box {
    margin-top: 40px;
    margin-left: -20px;
    margin-right: auto;
  }
  .calendar-iframe-container {
    padding-top: 85%;
    margin-top: 1%;
  }
}

.calendar-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: relative; /* .view-more-link の絶対配置のため */
}

.calendar-title {
  font-size: 2rem;
  font-weight: bold;
  color: #333;
}
.calendar-subtitle {
  color: #666;
  margin-bottom: 20px;
}

.view-more-link {
  position: absolute;
  bottom: -13px;
  right: 0;
  border-radius: 5px;
  text-decoration: none;
  background-color: white;
  color: #ff5722; /* View More のリンク色 */
  padding: 10px 15px 10px 15px;
  border: 2px solid #FF9999;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  transition: background-color 0.3s, color 0.3s, border 0.3s;
  font-size: 1rem;
}
@media (max-width: 767px) {
  .view-more-link {
    padding: 7px 12px 7px 12px;
    font-size: 0.95rem;
    bottom: -7px;
  }
}

.view-more-link:hover {
  background-color: #FF9999;
  border: 2px solid #E94040;
  color: white;
}
</style>