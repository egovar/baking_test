<template>
  <v-navigation-drawer
    :value="value"
    app
    temporary
    right
    width="900"
    @input="emit('toggle:new-blocks-table', $event)"
  >
    <BasicBlocksTable :items="newBlocks" :options="options" height="100%" />
  </v-navigation-drawer>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import BasicBlocksTable from "./BasicBlocksTable";
import { DEFAULT_SORT, DEFAULT_SORT_DESC } from "@/constants";

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  value: {
    type: Boolean,
    default: false,
  },
  newBlocks: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["toggle:new-blocks-table"]);

const options = {
  sortBy: [DEFAULT_SORT],
  sortDesc: [DEFAULT_SORT_DESC],
  itemsPerPage: -1,
};
</script>

<style scoped lang="scss"></style>
