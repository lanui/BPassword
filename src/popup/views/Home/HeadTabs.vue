<template>
  <v-container class="px-0 py-0">
    <v-tabs dense centered v-model="tab" icons-and-text ripple fixed-tabs>
      <v-tabs-slider></v-tabs-slider>
      <v-tab href="#tabWebsite" class="primary--text">
        {{ $t('l.website') }}
        <v-icon>{{ icons.DESKTOP_MAC_MDI }}</v-icon>
      </v-tab>
      <v-tab href="#tabMobile" class="primary--text">
        {{ $t('l.mobileapp') }}
        <v-icon>{{ icons.CELLPHONE_KEY_MDI }}</v-icon>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item id="tabWebsite">
        <website-item-list></website-item-list>
      </v-tab-item>
      <v-tab-item id="tabMobile">
        <mobile-item-list></mobile-item-list>
      </v-tab-item>
    </v-tabs-items>
    <v-row justify="center" class="fill-height px-0 py-1 my-auto">
      <v-col cols="5" class="px-0 py-0 mr-1">
        <v-btn @click="addItemHandle" outlined rounded small block color="primary">
          {{ $t('btn.addItem') }}
        </v-btn>
      </v-col>
      <v-col cols="5" class="px-0 py-0 ml-1">
        <v-btn rounded small block color="primary">
          <div class="btn-title">
            {{ $t('btn.syncItems') }}
          </div>
          <v-avatar size="18" class="btn-chip" v-if="Boolean(diff)">
            {{ diff }}
          </v-avatar>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';

import WebsiteItemList from './components/WebsiteItemList';
import MobileItemList from './components/MobileItemList';

export default {
  name: 'HomeHeadTabs',
  components: {
    WebsiteItemList,
    MobileItemList,
  },
  computed: {
    ...mapGetters('ui', ['icons']),
    ...mapGetters('passbook', ['webdiff', 'mobdiff']),
    diff() {
      // return '+5';
      const activeTab = this.tab;
      return this.tab === 'tabWebsite' ? this.webdiff : this.mobdiff;
    },
  },
  data() {
    return {
      tab: 'tabWebsite', //tabMobile,tabWebsite
    };
  },
  methods: {
    addItemHandle() {
      const activeTab = this.tab;
      if (activeTab === 'tabWebsite') {
        this.$router.push({ path: '/passbook/add_website_item' });
      } else if (activeTab === 'tabMobile') {
        this.$router.push({ path: '/passbook/add_mobile_item' });
      }
    },
  },
};
</script>
<style>
.v-btn__content div.btn-title {
  display: flex;
  justify-self: center;
  justify-content: center;
  flex: 1 1 auto;
}
.v-btn__content div.btn-chip {
  display: flex;
  background-color: rgba(58, 123, 248, 1);
  justify-self: center;
  flex: 1 1 26px;
  border-radius: 11px;
}
</style>
