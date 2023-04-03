<template>
  <v-data-table
    :headers="COLUMNS"
    :items="$attrs.items"
    :loading="$attrs.loading"
    :options.sync="$attrs.options"
    :disable-sort="$attrs['disable-sort']"
    :server-items-length="$attrs['server-items-length']"
    :item-class="$attrs['item-class']"
    hide-default-footer
    fixed-header
    :height="$attrs.height"
    :item-key="LEVEL"
    @update:options="emit('update:options', $event)"
  >
    <template #[`item.${LEVEL}`]="{ item }">
      <a :href="`${ROOT_LINK}${item[LEVEL]}`">{{ item[LEVEL] }}</a>
    </template>
    <template #[`item.${HASH}`]="{ item }">
      <a :href="`${ROOT_LINK}${item[HASH]}`">{{ formatHash(item[HASH]) }}</a>
    </template>
    <template #[`item.${PROPOSER}`]="{ item }">
      <template v-if="item[PROPOSER]">
        <v-avatar class="mr-3">
          <v-img :src="`${AVATAR_ROOT_LINK}${item[PROPOSER].address}`" />
        </v-avatar>
        <a :href="`${ROOT_LINK}${item[PROPOSER].address}`">
          {{ formatProposer(item[PROPOSER].address) }}
        </a>
      </template>
    </template>
    <template #[`item.${REWARD}`]="{ item }">
      {{ item[REWARD] / MICRO_DIVIDER }} ꜩ
    </template>
    <template #[`item.${FEES}`]="{ item }">
      {{ item[FEES] / MICRO_DIVIDER }} ꜩ
    </template>
  </v-data-table>
</template>

<script setup>
import {
  COLUMNS,
  LEVEL,
  HASH,
  REWARD,
  FEES,
  ROOT_LINK,
  MICRO_DIVIDER,
  PROPOSER,
  AVATAR_ROOT_LINK,
} from "@/constants";
import { formatHash, formatProposer } from "@/utils";
import { defineEmits } from "vue";
const emit = defineEmits(["update:options"]);
</script>

<style scoped lang="scss"></style>
