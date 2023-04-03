<template>
  <v-app class="app">
    <v-app-bar app color="primary" clipped-right dark>
      <NewBlockTimer
        ref="timer"
        :new-blocks-count="newBlocks.length"
        @open:new-blocks-table="toggleNewBlocksTable(true)"
      />
    </v-app-bar>
    <v-main class="main">
      <BlocksTable ref="mainTable" @update:timer="updateTimer" />
    </v-main>
    <NewBlocksDrawer
      :value="drawer"
      :new-blocks="newBlocks"
      @toggle:new-blocks-table="toggleNewBlocksTable"
      class="table__new-blocks-table"
    />
  </v-app>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import BlocksTable from "@/views/BlocksTable/BlocksTable";
import NewBlockTimer from "@/views/BlocksTable/components/NewBlockTimer";
import NewBlocksDrawer from "@/views/BlocksTable/components/NewBlocksDrawer";

const mounted = ref(false);
onMounted(() => {
  mounted.value = true;
});

const timer = ref(null);
function updateTimer(seconds) {
  if (mounted.value) timer.value.setTimer(seconds);
}

const drawer = ref(false);
function toggleNewBlocksTable(newVal = !drawer.value) {
  drawer.value = newVal;
}
const mainTable = ref(null);
const newBlocks = computed(() => {
  if (mounted.value) return mainTable.value.newBlocks;
  return [];
});
</script>

<style scoped lang="scss">
.main {
  height: calc(100vh - 4rem);
}
</style>
