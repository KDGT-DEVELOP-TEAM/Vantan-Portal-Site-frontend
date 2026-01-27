<template>
  <div class="grade-filter-container">
    <div class="filter-label">{{ $t('timeschedule.filter.gradeLabel') }}</div>

    <!-- PC: ラジオ -->
    <div v-if="!isMobile" class="radio-group">
      <label class="radio-label">
        <input type="radio" value="all" v-model="selectedGradeModel" />
        {{ $t('timeschedule.filter.all') }}
      </label>

      <label v-for="grade in grades" :key="grade" class="radio-label">
        <input
          type="radio"
          :value="String(grade)"
          v-model="selectedGradeModel"
        />
        {{ grade }}{{ $t('timeschedule.filter.gradeSuffix') }}
      </label>
    </div>

    <!-- Mobile: セレクト -->
    <select
      v-else
      v-model="selectedGradeModel"
      class="select-dropdown grade-hover-select"
    >
      <option value="all">
        {{ $t('timeschedule.filter.all') }}
      </option>

      <option
        v-for="grade in grades"
        :key="grade"
        :value="String(grade)"
      >
        {{ grade }}{{ $t('timeschedule.filter.gradeSuffix') }}
      </option>
    </select>
  </div>
</template>

<script>
  const MOBILE_BREAKPOINT = 768;

  export default {
    name: 'TimeScheduleGradeFilter',
    props: {
      selectedGrade: {
        type: String,
        default: 'all',
      },
      grades: {
        type: Array,
        default: () => [1, 2, 3, 4, 5],
      },
    },
    emits: ['update:selectedGrade', 'filter'],
    data() {
      return {
        isMobile: false,
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
        },
      },
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
        this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
      },
    },
  };
</script>

<style scoped>
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
    flex-shrink: 0;
  }

  .radio-group {
    display: flex;
    flex-wrap: wrap;
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
  }

  .radio-label input[type="radio"] {
    margin-right: 5px;
  }

  /* Mobile select */
  .select-dropdown {
    /* 20% は端末で狭すぎる可能性があるので、下限を持たせる */
    width: 20%;
    min-width: 140px;
    max-width: 220px;

    padding: 8px 10px;
    border: 1px solid #ff9999;
    border-radius: 4px;
    font-size: 1rem;
    background-color: white;
    appearance: none;

    background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
  }

  .grade-hover-select:hover {
    background-color: #fff7f7 !important;
    border: 1px solid #f1494c !important;
  }

  .grade-hover-select:hover,
  .grade-hover-select:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    .grade-filter-container {
      padding: 10px 0;
    }

    .filter-label {
      font-size: 0.9rem;
    }
  }
</style>