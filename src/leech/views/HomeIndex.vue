<template>
  <v-col class="px-1 py-0 pt-2 pb-1">
    <v-row justify="center" v-if="isUnlocked && !hasItems" class="py-0">
      <v-col cols="10" class="py-0">
        <v-btn light rounded block color="primary" small @click="gotoAddItemHandle">
          {{ $t('btn.saveToBPassbook') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-virtual-scroll
      v-if="hasItems"
      :items="filterItems"
      :item-height="itemHeight"
      :height="listHeight"
    >
      <template v-slot="{ item }">
        <v-btn
          dark
          block
          text
          @click.native.stop="sendFillItemMessage(item)"
          color="primary"
          v-ripple="{ class: 'primary--text' }"
        >
          <div class="selector-item" v-if="item && !Boolean(item.ctype)">
            <div class="item-line item-title">
              <div class="title-username">
                {{ item.username }}
              </div>
              <div class="title-hostname">
                {{
                  item.hostname && item.hostname.split('.').length > 1
                    ? item.hostname.split('.').slice(-2).join('.')
                    : item.hostname
                }}
              </div>
            </div>
            <div class="item-line item-password">
              <input type="password" :value="item.password" class="item-password" readonly />
            </div>
          </div>
          <div class="selector-item" v-if="item && Boolean(item.ctype)">
            <div class="item-line item-title">
              <v-btn small text color="primary" class="px-0" @click="updateItemHandle(item)"
                >更新此密码</v-btn
              >
            </div>
          </div>
        </v-btn>
      </template>
    </v-virtual-scroll>
  </v-col>
</template>

<script>
import { mapGetters } from 'vuex';

import {
  API_RT_FILL_FEILDS,
  API_WIN_SELECTOR_UP_HEIGHT,
  API_RT_EDIT_WEB_ITEM,
} from '@/libs/msgapi/api-types';
import { IFR_CONF } from '@/libs/controllers/size-calculator';
import WhispererController from '@/libs/messages/whisperer-controller';

export default {
  name: 'LeechIndex',
  components: {},
  computed: {
    ...mapGetters(['items', 'isUnlocked', 'itemHeight', 'listHeight', 'filterItems']),
    hasItems() {
      return this.filterItems && this.filterItems.length > 0;
    },
  },
  data() {
    return {};
  },
  methods: {
    sendFillItemMessage(item) {
      const whisperer = new WhispererController();
      whisperer
        .sendSimpleMessage(API_RT_FILL_FEILDS, item)
        .then(async (response) => {
          console.log('Filled>>>>', response);
        })
        .catch((err) => {
          this.error = err;
          setTimeout(() => {
            this.error = '';
          }, 6000);
        });
    },
    gotoAddItemHandle() {
      const message = {
        apiType: API_WIN_SELECTOR_UP_HEIGHT,
        page: 'addPassPage',
        iHeight: IFR_CONF.addorHeight,
      };
      window.top.postMessage(message, '*');
      this.$store.dispatch('updateViewPath', 'addor');
      this.$router.push({ path: '/add_passbook' });
    },
    updateItemHandle(item) {
      const whisperer = new WhispererController();
      whisperer
        .sendSimpleMessage(API_RT_EDIT_WEB_ITEM, item)
        .then(async (websiteState) => {
          const { items } = websiteState;
          await this.$store.dispatch('updatePassItems', items);
        })
        .catch((err) => {});
    },
  },
  mounted() {
    console.log('Filled>>>>', JSON.stringify(this.filterItems));
  },
};
</script>
<style lang="css" scope>
div.selector-item {
  text-transform: none;
  text-align: left;
  display: inline-block;
  width: 100%;
  height: 38px;
  color: rgba(25, 25, 29, 1);
  padding: 4px 6px;
}

div.item-title {
  display: inline-flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  font-weight: 400;
}

.item-title .title-username {
  flex: 1 1 auto;
  font-size: 14px;
}

.item-title .title-hostname {
  flex: 0 1 auto;
  font-size: 10px;
  font-weight: 300;
  color: rgba(171, 173, 175, 1);
}

.item-password {
  outline: 0px;
  line-height: 8px;
}

.item-password:focus,
.item-password:hover {
  cursor: pointer;
}
.select-actived {
  background-color: rgba(69, 138, 249, 1);
}
</style>
