<template>
  <div class="v-application--wrap p3-guess--layout">
    <v-main>
      <transition name="fade-transform" mode="out-in">
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
    </v-main>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
export default {
  name: 'GuessLayout',
  computed: {
    ...mapGetters('ui', ['p3Drawer']),
    ...mapState(['ui']),
  },
  data() {
    return {
      show: true,
    };
  },
};
</script>
<style></style>
