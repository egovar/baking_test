<template>
  <div class="new-blocks-drawer">
    <button @click="drawer = true">Open</button>
    <v-navigation-drawer v-model="drawer" app temporary right width="700">
      <BasicBlocksTable :items="newBlocks" />
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
import BasicBlocksTable from "./BasicBlocksTable";

const drawer = ref(true);
defineProps({
  newBlocks: {
    type: Array,
    default: () => [],
  },
});
</script>

<style scoped lang="scss"></style>
