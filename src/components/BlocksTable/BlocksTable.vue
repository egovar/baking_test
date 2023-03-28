<template>
  <v-data-table
    :headers="COLUMNS"
    :items="blocks"
    :loading="loading"
    hide-default-footer
    fixed-header
  />
</template>

<script setup>
import { getBlocks } from "./api";
import { COLUMNS } from "./constants";
import { ref } from "vue";

const loading = ref(true);
const blocks = ref([]);
getBlocks()
  .then((data) => (blocks.value = data))
  .finally(() => (loading.value = false));
</script>

<style scoped lang="scss"></style>
