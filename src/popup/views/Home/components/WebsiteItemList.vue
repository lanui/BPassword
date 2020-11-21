<template>
  <v-virtual-scroll
    :items="webItemsState"
    :item-height="itemListBox.itemHeight"
    :height="itemListBox.height"
  >
    <template v-slot="{ item }">
      <v-list-item dense @click="itemClickHandle(item)">
        <v-list-item-avatar color="#F3F3F3">
          <v-img aspect-ratio="1" :src="Boolean(item.isblocker) ? iconOnline : iconOffline" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>
            {{ item.username }}
          </v-list-item-title>
          <v-list-item-subtitle>
            <input :value="item.password" type="password" readonly class="password-text" />
          </v-list-item-subtitle>
          <div class="hostname-row">
            {{ item.hostname }}
          </div>
        </v-list-item-content>
        <v-list-item-action style="flex-direction: row">
          <v-btn @click="goEditItem(item)" small icon color="bpgray me-2">
            <v-icon>{{ icons.ARROW_RIGHT_MDI }}</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </template>
  </v-virtual-scroll>
</template>

<script>
import { mapGetters } from 'vuex';

import iconOnline from '@/ui/assets/icons/icon_eth_cloud.png';
import iconOffline from '@/ui/assets/icons/icon-locale-circle.png';

export default {
  name: 'WebsiteItemList',
  computed: {
    ...mapGetters('ui', ['icons', 'itemListBox']),
    ...mapGetters('passbook', ['webItemsState']),
  },
  data() {
    return {
      iconOnline,
      iconOffline,
    };
  },
  methods: {
    async itemClickHandle(item) {
      await this.$store.dispatch('passbook/pushTransferItem', item);
      await this.$router.push({ path: '/passbook/edit_website_item' });
    },
    async goEditItem(item) {
      await this.$store.dispatch('passbook/pushTransferItem', item);
      await this.$router.push({ path: '/passbook/edit_website_item' });
    },
  },
};
</script>
<style>
input.password-text {
  outline: 0;
  border: none;
}

.hostname-row {
  font-size: 12px;
  font-weight: 300;
  color: #8c9092;
}
</style>
