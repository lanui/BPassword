<template>
  <v-app-bar app fixed :clipped-right="true" :dense="p3Dense" class="p3nav-bar">
    <div>
      <v-img :src="logo" width="32" height="32"></v-img>
    </div>
    <network-selector />
    <v-btn icon small class="ms-2" @click="togglerDrawer">
      <v-icon color="light-blue accent-4">mdi-menu</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex';

import Logo128 from '@ui/assets/icons/logo_128.png';
import NetworkSelector from '@/popup/widgets/NetworkSelector';

export default {
  name: 'TopAppBar',
  components: {
    NetworkSelector,
  },
  computed: {
    ...mapGetters('ui', ['p3Dense', 'p3Drawer']),
    drawerStyle() {
      const top = this.$vuetify.application.top;
      return `height: 100%;top:${top}px;`;
    },
  },
  data() {
    return {
      logo: Logo128,
      show: true,
    };
  },
  methods: {
    togglerDrawer() {
      this.$store.dispatch('ui/togglePopupDrawer', null);
    },
    setDrawerValue($event) {},
  },
  mounted() {},
};
</script>
<style>
/* .p3nav-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: rgba(243, 244, 246, 1);
} */

/* .p3nav-bar>* {
  display: flex;
  flex-direction: row;
  flex: 0 1 auto;
} */

/* .p3nav-bar div.v-toolbar__content {
  flex: 1 1 auto;
}  */
</style>
