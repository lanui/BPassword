<template>
  <v-main>
    <transition name="fade-transform" mode="out-in">
      <keep-alive>
        <router-view />
      </keep-alive>
    </transition>
  </v-main>
</template>

<script>
import { mapGetters } from 'vuex';
import TopAppBar from '@/popup/widgets/TopAppBar';
export default {
  name: 'MainLayout',
  components: {
    TopAppBar,
  },
  computed: {
    ...mapGetters('ui', ['snackbar', 'snackbarShow']),
  },
  methods: {
    hiddenSnackbarHandle() {
      this.$store.dispatch('ui/hiddenSnackbar');
    },
  },
};
</script>
<style></style>
