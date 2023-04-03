<template>
  <div>
    <v-container class="table__container py-0">
      <BasicBlocksTable
        :items="blocks"
        :loading="loading"
        :options="options"
        :disable-sort="loading"
        :server-items-length="1"
        :item-class="getBlockRowClass"
        height="calc(100vh - 4rem)"
        ref="table"
        class="table"
        @update:options="options = $event"
      />
    </v-container>
  </div>
</template>

<script setup>
import {
  computed,
  onMounted,
  ref,
  defineEmits,
  defineExpose,
  watch,
} from "vue";

import { socket, getBlocks } from "@/api";

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
  MILLI_DIVIDER,
  LEVEL,
  DEFAULT_SORT_OBJECT,
} from "@/constants";

import {
  getSortObject,
  isHigherInTable,
  getLightBlock,
  binarySearchNewBlockIndex,
} from "@/utils";

import BasicBlocksTable from "./components/BasicBlocksTable";

// getting initial table data, "created"
const loading = ref(true);
const blocks = ref([]);
const bottomLocalBlock = ref({});
const mainOffset = ref(0);
getBlocks()
  .then((data) => {
    if (!(data && Array.isArray(data))) return;
    blocks.value = data;
    topLocalBlockLevel.value = data[0][LEVEL];
    setSecondsToNextBlock(getSecondsToNextBlock(data[0].timestamp));
    bottomLocalBlock.value = data.slice(-1)[0];
    mainOffset.value += DEFAULT_LIMIT;
  })
  .finally(() => (loading.value = false));

// subscribing to socket, setting new blocks
const newBlocks = ref([]);
defineExpose({ newBlocks });
const additionalOffset = ref(0);
socket.init().then(() => {
  socket.send(SUBSCRIBE_TO_BLOCKS);
  socket.on(BLOCKS_EVENT, (msg) => {
    newBlockHandler(msg);
  });
});

function newBlockHandler({ type, state, data }, fromSocket = true) {
  if (type === 0) topRemoteBlockLevel.value = state;
  else if (type === 1 && data && Array.isArray(data)) {
    if (blocks.value.length < DEFAULT_LIMIT * 2.5) {
      newBlockInsertHandler(data);
    } else {
      newBlockDefaultHandler(data);
    }
    if (fromSocket) setSecondsToNextBlock(BAKING_TIME);
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
      if (
        isHigherInTable({
          newRow: newLightBlock,
          comparisonRow: bottomLocalBlock.value,
          sortBy: sortBy.value,
          sortDesc: sortDesc.value,
        })
      ) {
        additionalOffset.value++;
      }
      newBlocks.value.push({
        ...newLightBlock,
        new: true,
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
    }, NEW_BLOCK_HIGHLIGHT_TIME * MILLI_DIVIDER);
  }
}

// getting lost blocks (slow internet connection);
const topLocalBlockLevel = ref(null); // for correct fetching new blocks
const topRemoteBlockLevel = ref(null);
const lostFetched = ref(false);

watch(
  [topLocalBlockLevel, topRemoteBlockLevel],
  async ([newLocalVal, newRemoteVal]) => {
    if (lostFetched.value || !(newLocalVal && newRemoteVal)) return;
    if (newRemoteVal > newLocalVal) {
      lostFetched.value = true;
      const lostBlocks = await getBlocks({
        ...DEFAULT_SORT_OBJECT,
        level: {
          gt: newLocalVal,
          le: newRemoteVal,
        },
      });
      newBlockHandler({ type: 1, data: lostBlocks }, false);
    }
  }
);

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
    setSecondsToNextBlock(getSecondsToNextBlock(blocks.value[0].timestamp));
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
    bottomLocalBlock.value = clearBlocks.slice(-1)[0];
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
const emit = defineEmits(["update:timer"]);

function setSecondsToNextBlock(seconds) {
  emit("update:timer", seconds);
}

function getSecondsToNextBlock(timestamp) {
  return (
    BAKING_TIME -
    Math.round((Date.now() - new Date(timestamp).getTime()) / MILLI_DIVIDER)
  );
}
</script>

<style scoped lang="scss">
.table {
  &:deep(.table__row) {
    transition: all 0.5s ease;
  }
}
</style>
