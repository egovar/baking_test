<template>
  <v-container class="py-0">
    <v-row dense>
      <v-spacer />
      <v-card class="col-2" @click="onClickTimer">
        <v-card-text class="d-flex pa-1 justify-space-between align-center">
          <div class="timer__text">
            <p class="ma-0">{{ newBlockText }} {{ secondsLeft }}s</p>
            <p
              class="ma-0 text-decoration-underline font-weight-light caption"
              v-if="newBlocksCount > 0"
            >
              Open new blocks ({{ newBlocksCount }})
            </p>
          </div>
          <v-progress-circular
            :value="percentLeft"
            color="primary"
            class="timer__progress-circle"
          />
        </v-card-text>
      </v-card>
    </v-row>
  </v-container>
</template>

<script setup>
import { BAKING_TIME, MILLI_DIVIDER, TIMER_PRECISION } from "@/constants";
import { ref, computed, defineExpose, defineProps, defineEmits } from "vue";

const props = defineProps({
  newBlocksCount: {
    type: Number,
    default: 0,
  },
});

function onClickTimer() {
  if (props.newBlocksCount > 0) emit("open:new-blocks-table");
}

const emit = defineEmits(["open:new-blocks-table"]);

defineExpose({ setTimer });

function setTimer(seconds) {
  clearInterval(interval.value);
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
  if (milliSecondsLeft.value >= -1 * MILLI_DIVIDER) return "New block in";
  return "New block is late for";
});
</script>

<style scoped lang="scss">
.timer {
  &__progress-circle {
    &:deep(.v-progress-circular__overlay) {
      transition: all 0.1s linear;
    }
  }

  &__text {
    width: 200px;
  }
}
</style>
