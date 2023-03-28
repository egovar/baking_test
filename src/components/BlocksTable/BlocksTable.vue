<template>
  <v-data-table
    :headers="COLUMNS"
    :items="blocks"
    :loading="loading"
    :options.sync="options"
    :server-items-length="total"
    hide-default-footer
    fixed-header
    item-key="level"
  />
</template>

<script setup>
import { computed, ref } from "vue";

import { getBlocks } from "./api";
import { COLUMNS, DEFAULT_SORT_DESC, LEVEL } from "./constants";
import { getSortObject } from "./utils";

// getting initial table data, "created"
const loading = ref(true);
const blocks = ref([]);
const total = 1; // readonly: with -1 sorts offline, with 0 shows no data
getBlocks()
  .then((data) => (blocks.value = data))
  .finally(() => (loading.value = false));

// setting sorting logic
const sortBy = ref(LEVEL);
const sortDesc = ref(DEFAULT_SORT_DESC);
const options = computed({
  get: () => {
    return {
      sortBy: [sortBy.value],
      sortDesc: [sortDesc.value],
      itemsPerPage: -1,
      mustSort: true,
    };
  },
  set: async ({ sortBy: _newSortBy, sortDesc: _newSortDesc }) => {
    const newSortBy = _newSortBy[0];
    const newSortDesc = _newSortDesc[0];
    if (newSortBy !== sortBy.value) {
      sortBy.value = newSortBy;
      sortDesc.value = DEFAULT_SORT_DESC;
    } else {
      sortDesc.value = newSortDesc;
      loading.value = true;
      blocks.value = await getBlocks(
        getSortObject({ sortBy: sortBy.value, sortDesc: sortDesc.value })
      );
      loading.value = false;
    }
  },
});
</script>

<style scoped lang="scss"></style>
