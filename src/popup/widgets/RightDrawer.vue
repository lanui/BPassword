<template>
  <v-navigation-drawer
    app
    ref="rightDrawer"
    v-model="ui.p3.drawer"
    absolute
    :right="true"
    :style="'top:' + $vuetify.application.top + 'px;height:550px;'"
  >
    <v-list :dense="p3Dense" class="py-0 mt-1">
      <v-list-item v-for="(nav, idx) in navMenus" @click.stop="navMenuClick(nav)" :key="idx">
        <v-list-item-avatar size="20">
          <v-icon v-if="!Boolean(nav.iconImg)">{{ nav.icon }}</v-icon>
          <v-img v-if="Boolean(nav.iconImg)" :src="nav.iconImg"></v-img>
        </v-list-item-avatar>
        <v-list-item-content
          ><span class="nav-drawer-item--title">{{ nav.text }}</span></v-list-item-content
        >
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item @click="lockedHandle">
        <v-list-item-avatar size="20">
          <v-img :src="iconLocking"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <span class="nav-drawer-item--title">
            {{ isUnlocked ? $t('nav.login.locking') : $t('nav.login.unlock') }}
          </span>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <right-drawer-footer />
  </v-navigation-drawer>
</template>

<script>
import { nanoid } from 'nanoid';
import { mapState, mapGetters } from 'vuex';
import navMenus from '@/popup/router/nav-items';

import iconLocking from '@/ui/assets/icons/icon-locking.png';
import RightDrawerFooter from './RightDrawerFooter';

import WhispererController from '@/libs/messages/whisperer-controller';
import { API_RT_LOGOUT_WALLET } from '@/libs/msgapi/api-types';

export default {
  name: 'RightDrawer',
  components: {
    RightDrawerFooter,
  },
  computed: {
    ...mapGetters(['isUnlocked']),
    ...mapGetters('ui', ['p3Dense']),
    ...mapState(['ui']),
  },
  data() {
    return {
      navMenus: navMenus,
      iconLocking,
      processing: false,
    };
  },
  methods: {
    navMenuClick(nav) {
      if (nav && nav.path) {
        this.$router.push({ path: nav.path });
      }
    },
    lockedHandle() {
      const whisperer = new WhispererController({ portName: 'P3-logout' });

      const data = { id: nanoid() };
      whisperer
        .sendSimpleMessage(API_RT_LOGOUT_WALLET, data)
        .then(async (initState) => {
          await this.$store.dispatch('initState', initState);
          this.$router.push({ path: '/signin' });
        })
        .catch((err) => {
          console.log(err);
          this.$router.push({ path: '/index' });
        });
    },
  },
};
</script>
<style></style>
