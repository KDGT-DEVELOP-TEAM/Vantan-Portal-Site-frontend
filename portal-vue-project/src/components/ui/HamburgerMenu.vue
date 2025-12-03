<template>
  <button
    class="hamburger"
    @click="$emit('toggle')"
    :class="{ open: isOpen }"
    aria-label="メニュー"
    :aria-expanded="isOpen"
  >
    <span class="bar bar-top"></span>
    <span class="bar bar-middle"></span>
    <span class="bar bar-bottom"></span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  isOpen: {
    type: Boolean,
    required: true
  }
});
</script>

<style scoped>
.hamburger {
  position: relative;
  width: 60px;
  height: 60px;
  border: none;
  background: #F15B5B;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.25s cubic-bezier(.66,0,.41,1.33),
    border 0.26s cubic-bezier(.66,0,.41,1.33);
  border-radius: 0;
  outline: none;
  box-shadow: none;
  user-select: none;
}

.bar {
  position: absolute;
  left: 12.5px;
  right: 12.5px;
  height: 5px;
  background: #fff;
  border-radius: 3px;
  width: auto;
  box-shadow: none;
  transition:
    background 0.22s cubic-bezier(.9,0,.19,1.13),
    opacity 0.38s cubic-bezier(.86,0,.07,1),
    transform 0.52s cubic-bezier(0.7,-0.47,0.32,1.67),
    top 0.41s cubic-bezier(.88,-0.18,.17,1.23),
    height 0.14s cubic-bezier(.67,0,.38,1.21);
  will-change: transform, opacity, top, height;
}

.bar-top {
  top: 15.2px;
}
.bar-middle {
  top: 27.5px;
}
.bar-bottom {
  top: 39.8px;
}

.hamburger.open .bar-top {
  top: 27.5px;
  transform: rotate(45deg) scaleX(1.08) scaleY(0.96) translateY(-0.5px);
  transition:
    background 0.16s,
    opacity 0.33s,
    transform 0.5s cubic-bezier(.65,.03,.31,1.68),
    top 0.34s cubic-bezier(.97,-0.14,.37,1.29);
  z-index: 3;
}
.hamburger.open .bar-middle {
  opacity: 0;
  transform: translateX(18px) scaleX(.95);
  transition:
    opacity 0.28s 0.08s,
    transform 0.36s cubic-bezier(.94, 0.04,.36,1.13);
  z-index: 2;
}
.hamburger.open .bar-bottom {
  top: 27.5px;
  transform: rotate(-45deg) scaleX(1.07) scaleY(0.95) translateY(0.5px);
  transition:
    background 0.19s,
    opacity 0.37s,
    transform 0.48s cubic-bezier(.65,.03,.31,1.68),
    top 0.32s cubic-bezier(.96,-0.11,.34,1.22);
  z-index: 2;
}

.hamburger:not(.open) .bar-top,
.hamburger:not(.open) .bar-bottom {
  transition:
    background 0.24s,
    opacity 0.29s 0.09s,
    transform 0.4s cubic-bezier(.52,-0.23,.44,1.54),
    top 0.33s cubic-bezier(.86,0,.25,1.08);
}

.hamburger:focus:not(:hover) {
  box-shadow: none;
}

.hamburger:hover,
.hamburger:focus-visible {
  background: #fff;
  border: 2px solid #F15B5B;
  box-shadow: none;
}

.hamburger:hover .bar,
.hamburger:focus-visible .bar {
  background: #F15B5B;
  box-shadow: none;
  margin-top: -2px;
  height: 6px;
}

.hamburger.open:hover .bar,
.hamburger.open:focus-visible .bar {
  background: #F15B5B;
  box-shadow: none;
  height: 6px;
}

/* open状態のときhoverで色固定 */
.hamburger.open:hover .bar-middle,
.hamburger.open:focus-visible .bar-middle {
  background: #F15B5B;
}

.hamburger:active .bar,
.hamburger.open:active .bar {
  height: 4px;
  box-shadow: none;
}
</style>
