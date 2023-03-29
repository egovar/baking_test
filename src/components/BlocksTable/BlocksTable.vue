<template>
  <v-data-table
    :headers="COLUMNS"
    :items="blocks"
    :loading="loading"
    :options.sync="options"
    :disable-sort="loading"
    :server-items-length="total"
    hide-default-footer
    fixed-header
    height="calc(100vh - 4rem)"
    item-key="level"
    ref="table"
  />
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import { socket } from "@/api";
import { getBlocks } from "./api";
import {
  COLUMNS,
  DEFAULT_SORT_DESC,
  SUBSCRIBE_TO_BLOCKS,
  BLOCKS_EVENT,
  DEFAULT_SORT,
} from "./constants";
import { getSortObject, isHigherInTable } from "./utils";

// getting initial table data, "created"
const loading = ref(true);
const blocks = ref([]);
const total = 1; // readonly: with -1 sorts offline, with 0 shows no data
const topLocalBlock = ref({}); // for correct fetching new blocks
const bottomLocalBlock = ref({});
const topRemoteBlockLevel = ref(-1);
getBlocks()
  .then((data) => {
    if (!(data && Array.isArray(data))) return;
    blocks.value = data;
    topLocalBlock.value = data[0];
    bottomLocalBlock.value = data.slice(-1)[0];
  })
  .finally(() => (loading.value = false));

// subscribing to socket, setting blocks refresh
const newBlocks = ref([]);
const additionalOffset = ref(0);
socket.init().then(() => {
  socket.send(SUBSCRIBE_TO_BLOCKS);
  socket.on(BLOCKS_EVENT, (msg) => {
    newBlockHandler(msg);
  });
});

function newBlockHandler({ type, state, data }) {
  function newBlockDefaultHandler(data) {
    newBlocks.value = [];
    data.forEach(({ level, timestamp, hash, proposer, reward, fees }) => {
      newBlocks.value.push({
        level,
        timestamp,
        hash,
        proposer,
        reward,
        fees,
        new: true,
      });
      additionalOffset.value++;
    });
    // newBlocks.value.reverse(); // depends on order, got only one in time
    blocks.value = [...newBlocks.value, ...blocks.value];
  }

  function newBlockSortedHandler(data) {
    data.forEach(({ level, timestamp, hash, proposer, reward, fees }) => {
      let isHigherInMainTable = false;
      if (
        isHigherInTable({
          newRow: { level, timestamp, hash, proposer, reward, fees },
          bottomRow: bottomLocalBlock.value,
          sortBy: sortBy.value,
          sortDesc: sortDesc.value,
        })
      ) {
        additionalOffset.value++;
        isHigherInMainTable = true;
      }
      newBlocks.value.push({
        level,
        timestamp,
        hash,
        proposer,
        reward,
        fees,
        new: true,
        isHigherInMainTable,
      });
    });
  }

  if (type === 0) topRemoteBlockLevel.value = state;
  else if (type === 1 && data && Array.isArray(data)) {
    if (sortBy.value === DEFAULT_SORT && sortDesc.value === DEFAULT_SORT_DESC) {
      newBlockDefaultHandler(data);
    } else {
      newBlockSortedHandler(data);
    }
  }
}

// setting sorting logic
const sortBy = ref(DEFAULT_SORT);
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
    if (newSortBy === sortBy.value && newSortDesc === sortDesc.value) return;
    if (newSortBy !== sortBy.value) {
      sortBy.value = newSortBy;
      sortDesc.value = DEFAULT_SORT_DESC;
    } else {
      sortDesc.value = newSortDesc;
    }
    newBlocks.value = [];
    additionalOffset.value = 0;
    loading.value = true;
    blocks.value = await getBlocks(
      getSortObject({ sortBy: sortBy.value, sortDesc: sortDesc.value })
    );
    loading.value = false;
  },
});

// scroll behaviour
const table = ref(null);
onMounted(() => {
  const scrollableTable = table.value.$el.querySelector(
    ".v-data-table__wrapper"
  );
  scrollableTable.addEventListener("scroll", () => {
    console.log(
      scrollableTable.scrollTop,
      scrollableTable.clientHeight,
      scrollableTable.scrollHeight
    );
  });
});
</script>

<style scoped lang="scss"></style>
