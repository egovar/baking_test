<template>
  <div>{{ newBlockText }} {{ percentLeft }}</div>
</template>

<script setup>
import { BAKING_TIME, MILLI_DIVIDER, TIMER_PRECISION } from "@/constants";
import { ref, computed, defineExpose } from "vue";

defineExpose({ setTimer });

function setTimer(seconds) {
  milliSecondsLeft.value = seconds * MILLI_DIVIDER;
  interval.value = setInterval(() => {
    milliSecondsLeft.value -= delta;
  }, delta);
}
const milliSecondsLeft = ref(null);
const interval = ref(null);
const delta = (BAKING_TIME * MILLI_DIVIDER) / TIMER_PRECISION;

const secondsLeft = computed(() => {
  const abs = Math.ceil(milliSecondsLeft.value / MILLI_DIVIDER);
  if (milliSecondsLeft.value >= 0) return abs;
  return -abs;
});
const percentLeft = computed(() => {
  if (milliSecondsLeft.value > 0) return milliSecondsLeft.value / delta;
  return 0;
});
const newBlockText = computed(() => {
  if (secondsLeft.value >= 0) return "New block in";
  return "New block is late for";
});
</script>

<style scoped lang="scss"></style>
