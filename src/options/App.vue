<template>
  <v-app>
    <v-navigation-drawer :mini-variant.sync="mini" permanent app width="200px">
      <v-list dense nav class="my-auto px-0" height="300px">
        <v-list-item
          v-for="item in items"
          :key="item.title"
          @click.stop="menuClickHandle(item.path)"
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-fab-transition>
        <v-btn
          fab
          bottom
          left
          x-small
          @click="toggleDrawer"
          class="toggler-drawer-btn"
          v-if="false"
        >
          <v-icon size="16px">
            {{ mini ? 'mdi-chevron-triple-right' : 'mdi-chevron-triple-left' }}
          </v-icon>
        </v-btn>
      </v-fab-transition>
    </v-navigation-drawer>

    <v-main>
      <transition name="fade-transform" mode="out-in">
        <keep-alive>
          <router-view />
        </keep-alive>
      </transition>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      mini: true,
      items: [
        { title: 'Auto locked', icon: 'mdi-lock-clock', path: '/home' },
        { title: 'Basic Options', icon: 'mdi-focus-field', path: '/base' },
      ],
    };
  },
  methods: {
    toggleDrawer() {
      this.mini = !this.mini;
    },
    menuClickHandle(path) {
      this.$router.push({ path: path });
    },
  },
};
</script>

<style scoped>
.toggler-drawer-btn {
  left: 4px;
}
</style>
