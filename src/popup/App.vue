<template>
  <v-app>
    <right-drawer />
    <top-app-bar />

    <router-view></router-view>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';
import TopAppBar from '@/popup/widgets/TopAppBar';
import RightDrawer from './widgets/RightDrawer';

export default {
  name: 'App',
  components: {
    TopAppBar,
    RightDrawer,
  },
  computed: {
    ...mapState(['ui']),
  },
  data() {
    return {
      show: true,
    };
  },
};
</script>
