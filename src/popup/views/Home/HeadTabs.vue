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
        <v-btn rounded small block color="primary" @click.stop="syncFetchSignedDataHandle">
          <div class="btn-title">
            {{ $t('btn.syncItems') }}
          </div>
          <v-avatar size="18" class="btn-chip" v-if="Boolean(diff)">
            {{ diff }}
          </v-avatar>
        </v-btn>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-dialog persistent v-model="dialogshow" content-class="sync-dialog">
        <div class="row-flex sync-header--wrap">
          <div class="sync-title">{{ dialog.title }}</div>
          <div class="sync-colser">
            <v-icon dense small @click.stop="syncDialogCloseHandler">mdi-close</v-icon>
          </div>
        </div>
        <div class="row-flex sync-main--wrap">
          <div class="inner-text" v-if="!Boolean(dialog.items.length)">
            <div>
              <img :src="syncImage" width="60px" class="sync-image" />
            </div>
            <div>
              {{ dialog.mainText }}
            </div>
          </div>

          <v-virtual-scroll
            v-if="Boolean(dialog.items.length)"
            :items="dialog.items"
            :item-height="40"
            :height="diffHeight"
            class="inner-list"
          >
            <template v-slot="{ index, item }">
              <v-divider :key="'itl_' + index" v-if="index != 0"></v-divider>
              <v-list-item dense :key="'itd_' + index" color="rgba(255,255,255,.95)">
                <v-list-item-icon :size="18">
                  <v-img
                    v-if="item.CType == 1"
                    :src="addIcon"
                    aspect-ratio="1"
                    width="16px"
                  ></v-img>
                  <v-img
                    v-else-if="item.CType == 2"
                    :src="delIcon"
                    aspect-ratio="1"
                    width="16"
                  ></v-img>
                  <v-img
                    v-else="item.CType == 3"
                    :src="editIcon"
                    aspect-ratio="1"
                    width="16"
                  ></v-img>
                </v-list-item-icon>
                <v-list-item-content class="item-title">
                  {{ item.title }}
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-virtual-scroll>
          <gas-controller-panel :iconsize="16" ref="gasCtx" v-if="Boolean(dialog.items.length)" />
        </div>
        <div class="row-flex sync-footer--wrap">
          <v-btn
            @click.stop="signedSyncRawDataHandler"
            :disabled="trading"
            v-if="Boolean(dialog.items.length)"
            dense
            block
            small
            color="primary"
          >
            {{ dialog.btnText }}
          </v-btn>
        </div>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import WebsiteItemList from './components/WebsiteItemList';
import MobileItemList from './components/MobileItemList';

import addCtypeIcon from '@/ui/assets/icons/ctype_add.png';
import delCtypeIcon from '@/ui/assets/icons/ctype_del.png';
import editCtypeIcon from '@/ui/assets/icons/ctype_edit.png';
import syncBlocker from '@/ui/assets/icons/sync_blocker.png';
import logger from '@lib/logger';
import WhispererController from '@lib/messages/whisperer-controller';
import { getWeb3Inst } from '@lib/web3/web3-helpers';

import GasControllerPanel from '@/popup/widgets/GasControllerPanel.vue';

import {
  API_RT_SYNC_WEBSITE_DATA,
  API_RT_FETCH_WEBSITE_COMMIT_RAWDATA,
  API_RT_SYNC_MOBILE_DATA,
  API_RT_FETCH_MOBILE_COMMIT_RAWDATA,
} from '@lib/msgapi/api-types';
export default {
  name: 'HomeHeadTabs',
  components: {
    WebsiteItemList,
    MobileItemList,
    GasControllerPanel,
  },
  computed: {
    ...mapGetters('ui', ['icons']),
    ...mapGetters('passbook', ['webdiff', 'mobdiff', 'websiteCommitItems']),
    diff() {
      // return '+5';
      const activeTab = this.tab;
      return this.tab === 'tabWebsite' ? this.webdiff : this.mobdiff;
    },
    diffHeight() {
      const max = 280;
      let len = this.dialog.items.length;
      return len > 7 ? max : len * 40 + 2;
    },
  },
  data() {
    return {
      tab: 'tabWebsite', //tabMobile,tabWebsite
      dialogshow: false,
      addIcon: addCtypeIcon,
      delIcon: delCtypeIcon,
      editIcon: editCtypeIcon,
      syncImage: syncBlocker,
      trading: false,
      dialog: {
        title: '待同步数据',
        mainType: 0,
        items: [],
        mainText: '当前已经是最新数据,没有需要提交的数据...',
        btnText: '同步到区块链',
      },
    };
  },
  methods: {
    resetDialog(hiddenDialog) {
      this.dialog = {
        title: '待同步数据',
        mainType: 0,
        items: [],
        mainText: '当前已经是最新数据,没有需要提交的数据...',
        btnText: '同步到区块链',
      };
      if (hiddenDialog) {
        this.dialogshow = false;
      }
    },
    addItemHandle() {
      const activeTab = this.tab;
      if (activeTab === 'tabWebsite') {
        this.$router.push({ path: '/passbook/add_website_item' });
      } else if (activeTab === 'tabMobile') {
        this.$router.push({ path: '/passbook/add_mobile_item' });
      }
    },
    async openWebsiteDialog(mainText) {
      this.dialogshow = true;
      this.dialog.items = this.$store.getters['passbook/websiteCommitItems'];
      if (mainText) {
        this.dialog.mainText = mainText;
      }
    },
    syncFetchSignedDataHandle() {
      const activeTab = this.tab;
      if (activeTab) {
        this.fetchWebsiteSignedRawData();
      } else {
      }
    },
    async fetchWebsiteSignedRawData() {
      try {
        const whisperer = new WhispererController({ portName: `BT_SYNC_WEBSITE` });
        const respState = await whisperer.sendSimpleMessage(API_RT_SYNC_WEBSITE_DATA, {
          reqId: this.$uid(),
        });
        await this.$store.dispatch('passbook/subInitState4Site', respState);
        await this.openWebsiteDialog();
      } catch (err) {
        logger.err('fetchWebsiteSignedRawData:', err);
        this.$toast(err.message, 'fail', 6000);
      }
    },
    async fetchMobileSignedRawData() {
      this.dialogshow = true;
      this.dialog.items = this.websiteCommitItems;
    },
    syncDialogCloseHandler() {
      this.resetDialog(true);
    },
    async signedSyncRawDataHandler() {
      const reqId = this.$uid();
      const gasPriceSwei = this.$refs.gasCtx.gasPrice;
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', gasPriceSwei);
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

.sync-dialog {
  max-height: 450px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 6px 8px;
  color: rgba(25, 25, 29, 1);
  font-size: 16px;
}

.sync-dialog > div.row-flex {
  display: flex;
  flex: 1 0 100%;
}

.row-flex div.sync-title {
  flex: 1 0 70%;
  justify-content: flex-start;
  font-size: 1.15rem;
}

div.sync-colser {
  height: 22px;
  flex: 0 0 30;
  justify-content: flex-end;
  align-items: center;
}

.sync-main--wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 10px 0px;
}

.sync-main--wrap > div {
  flex: 1 0 auto;
}

.sync-main--wrap > div.inner-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1 1 85%;
  text-align: center;
  word-wrap: break-all;
  font-size: 12px;
  color: rgba(103, 103, 106, 1);
}

.sync-main--wrap > div.inner-text > div {
  flex: 1 0 100%;
}

.sync-main--wrap > div.inner-list {
  scrollbar-width: thin;
}

.sync-image {
  width: 100px;
}

div.item-title {
  font-size: 0.9rem;
}
</style>
