<template>
  <v-container class="table__container">
    <BasicBlocksTable
      :items="blocks"
      :loading="loading"
      :options="options"
      :disable-sort="loading"
      :server-items-length="total"
      :item-class="getBlockRowClass"
      height="calc(100vh - 4rem)"
      ref="table"
      class="table"
      @update:options="options = $event"
    />
    <NewBlocksDrawer :new-blocks="newBlocks" class="table__new-blocks-table" />
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";

import { socket } from "@/api";
import { getBlocks } from "./api";
import {
  DEFAULT_SORT_DESC,
  SUBSCRIBE_TO_BLOCKS,
  BLOCKS_EVENT,
  DEFAULT_SORT,
  DEFAULT_LIMIT,
  SCROLL_THRESHOLD,
  DEFAULT_OFFSET,
  SEARCH_IN_OLD_BLOCKS_COUNT,
  BAKING_TIME,
  NEW_BLOCK_HIGHLIGHT_TIME,
} from "./constants";
import {
  getSortObject,
  isHigherInTable,
  getLightBlock,
  binarySearchNewBlockIndex,
} from "./utils";
import BasicBlocksTable from "@/components/BlocksTable/components/BasicBlocksTable";
import NewBlocksDrawer from "@/components/BlocksTable/components/NewBlocksDrawer";

// getting initial table data, "created"
const loading = ref(true);
const blocks = ref([]);
const total = 1; // readonly: with -1 sorts offline, with 0 shows no data
const topLocalBlock = ref({}); // for correct fetching new blocks
const bottomLocalBlock = ref({});
const topRemoteBlockLevel = ref(-1);
const mainOffset = ref(0);
getBlocks()
  .then((data) => {
    if (!(data && Array.isArray(data))) return;
    blocks.value = data;
    topLocalBlock.value = data[0];
    setSecondsToNextBlock(data[0].timestamp);
    bottomLocalBlock.value = data.slice(-1)[0];
    mainOffset.value += DEFAULT_LIMIT;
  })
  .finally(() => (loading.value = false));

// subscribing to socket, setting new blocks
const newBlocks = ref([]);
const additionalOffset = ref(0);
socket.init().then(() => {
  socket.send(SUBSCRIBE_TO_BLOCKS);
  socket.on(BLOCKS_EVENT, (msg) => {
    newBlockHandler(msg);
  });
});

function newBlockHandler({ type, state, data }) {
  if (type === 0) topRemoteBlockLevel.value = state;
  else if (type === 1 && data && Array.isArray(data)) {
    if (blocks.value.length < DEFAULT_LIMIT * 2.5) {
      newBlockInsertHandler(data);
    } else {
      newBlockDefaultHandler(data);
    }
    secondsToNextBlock.value = BAKING_TIME;
  }

  function newBlockInsertHandler(data) {
    data.forEach((newBlock) => {
      const newLightBlock = getLightBlock(newBlock);
      const newBlockIndex = binarySearchNewBlockIndex({
        newRow: newLightBlock,
        allBlocks: blocks.value,
        sortBy: sortBy.value,
        sortDesc: sortDesc.value,
      });
      if (newBlockIndex === -1) return;
      additionalOffset.value++;
      newLightBlock.new = true;
      blocks.value = [
        ...blocks.value.slice(0, newBlockIndex),
        newLightBlock,
        ...blocks.value.slice(newBlockIndex),
      ];
    });
  }

  function newBlockDefaultHandler(data) {
    data.forEach((newBlock) => {
      const newLightBlock = getLightBlock(newBlock);
      let isHigherInMainTable = false;
      if (
        isHigherInTable({
          newRow: newLightBlock,
          comparisonRow: bottomLocalBlock.value,
          sortBy: sortBy.value,
          sortDesc: sortDesc.value,
        })
      ) {
        additionalOffset.value++;
        isHigherInMainTable = true;
      }
      newBlocks.value.push({
        ...newLightBlock,
        new: true,
        isHigherInMainTable,
      });
    });
  }
}

// setting new blocks style

function getBlockRowClass(row) {
  if (row.new) {
    setNewBlockRowTimer(row);
    return "green lighten-4 table__row";
  }
  return "table__row";

  function setNewBlockRowTimer(row) {
    setTimeout(() => {
      row.new = false;
    }, NEW_BLOCK_HIGHLIGHT_TIME * 1000);
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
    loading.value = true;
    blocks.value = await getBlocks(
      getSortObject({ sortBy: sortBy.value, sortDesc: sortDesc.value })
    );
    setSecondsToNextBlock(blocks.value[0].timestamp);
    mainOffset.value = DEFAULT_OFFSET;
    additionalOffset.value = 0;
    scrollableTable.value.scrollTop = 0;
    loading.value = false;
  },
});

// scroll behaviour
const table = ref(null);
const scrollableTable = ref(null);
onMounted(() => {
  scrollableTable.value = table.value.$el.querySelector(
    ".v-data-table__wrapper"
  );
  scrollableTable.value.addEventListener("scroll", () => {
    if (
      scrollableTable.value.scrollHeight -
        scrollableTable.value.clientHeight -
        scrollableTable.value.scrollTop <=
      SCROLL_THRESHOLD
    ) {
      getMoreBlocks();
    }
  });

  async function getMoreBlocks() {
    if (loading.value) return;
    loading.value = true;
    const newBlocks = await getBlocks({
      ...getSortObject({ sortBy: sortBy.value, sortDesc: sortDesc.value }),
      offset: mainOffset.value + additionalOffset.value,
    });
    const clearBlocks = clearRepeatableBlocks(newBlocks);
    mainOffset.value += DEFAULT_LIMIT;
    blocks.value = [...blocks.value, ...clearBlocks];
    loading.value = false;
  }

  function clearRepeatableBlocks(newBlocks) {
    const blocksForSearch = blocks.value.slice(SEARCH_IN_OLD_BLOCKS_COUNT);
    const clearBlocks = newBlocks.filter((newBlock) => {
      return !blocksForSearch.some(({ level }) => level === newBlock.level);
    });
    return clearBlocks;
  }
});

// timer
const secondsToNextBlock = ref(null);
// const progressToNextBlock = ref(100); // 100 - 0
// const timeoutToNextBlock = ref(null);

function setSecondsToNextBlock(lastBlockISOString) {
  secondsToNextBlock.value =
    BAKING_TIME -
    Math.round((Date.now() - new Date(lastBlockISOString).getTime()) / 1000);
}

// function setTimeoutToNextBlock(seconds) {
//   progressToNextBlock.value = (100 * secondsToNextBlock.value) / BAKING_TIME;
//   timeoutToNextBlock.value = setTimeout(() => {});
// }
</script>

<style scoped lang="scss">
.table {
  &:deep(.table__row) {
    transition: all 0.5s ease;
  }

  &__container {
    position: relative;
  }

  &__new-blocks-table {
    position: absolute;
    right: -2rem;
    bottom: 5rem;
  }
}
</style>
