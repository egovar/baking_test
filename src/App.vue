<template>
  <v-app class="app">
    <v-app-bar app color="primary" dark></v-app-bar>
    <v-main class="main">
      <BlocksTable />
    </v-main>
  </v-app>
</template>

<script setup>
import BlocksTable from "@/components/BlocksTable/BlocksTable";
</script>

<style scoped lang="scss">
.main {
  height: calc(100vh - 4rem);
}
</style>
