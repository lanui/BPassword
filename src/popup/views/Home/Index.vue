<template>
  <v-container class="px-0 py-0">
    <tokens-rect />
    <head-tabs />
  </v-container>
</template>

<script>
import TokensRect from '@/popup/widgets/TokensRect';
import HeadTabs from './HeadTabs';
export default {
  name: 'HomeIndex',
  components: {
    TokensRect,
    HeadTabs,
  },
  computed: {},
  data() {
    return {};
  },
  methods: {},
};
</script>
<style></style>
