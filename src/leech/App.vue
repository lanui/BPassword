<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex';
import logger from '@lib/logger';
export default {
  name: 'LeechApp',
  computed: {},
  methods: {},
};
</script>
<style>
html,
body {
  overflow-y: hidden;
}
</style>
