<template>
  <v-container>
    <subnav-bar :gobackCall="gobackHandle" :title="$t('p.profile.title')" />
    <v-list dense class="py-0">
      <v-list-item class="options-list-item">
        <v-list-item-title>
          <div class="options-list-title">自动锁定</div>
          <v-spacer></v-spacer>
          <div class="options-list-tail">
            {{ autoLockedText }}
          </div>
        </v-list-item-title>
        <v-list-item-icon>
          <v-btn icon small @click="goPageHandle">
            <v-icon>
              {{ icons.ARROW_RIGHT_MDI }}
            </v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
      <v-list-item class="options-list-item">
        <v-list-item-title>
          <div class="options-list-title">
            {{ $t('l.help') }}
          </div>
          <v-spacer></v-spacer>
        </v-list-item-title>
        <v-list-item-icon>
          <v-btn icon small @click="goPageHandle('helpDuide')">
            <v-icon>
              {{ icons.ARROW_RIGHT_MDI }}
            </v-icon>
          </v-btn>
        </v-list-item-icon>
      </v-list-item>
    </v-list>

    <v-sheet color="#F3F4F7" elevation="0" height="12" width="100%"></v-sheet>
    <v-list>
      <v-list-item>
        <v-list-item-title>
          {{ $t('l.version') }}
        </v-list-item-title>
        <v-spacer></v-spacer>
        <v-list-item-action class="pe-4">
          <v-btn rounded color="#F3F3F3" small>
            {{ currentVersion }}
          </v-btn>
        </v-list-item-action>
      </v-list-item>
      <v-divider></v-divider>
    </v-list>
    <v-row class="px-3 py-3">
      <div class="option-down-wrap">
        <div class="bottom-rect-title">
          {{ $t('p.profile.finnacialTitle') }}
        </div>
        <div class="bottom-rect-address">
          {{ finnacialHash }}
        </div>
        <div class="bottom-rect--chip">
          <v-chip
            @click="openBlockexplorerTab"
            color="rgba(69, 138, 249, .1)"
            text-color="#458AF9"
            filter
            class="chip-btn"
          >
            {{ $t('p.profile.showOnBlockChain') }}
          </v-chip>
        </div>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import SubnavBar from '@/popup/widgets/SubnavBar.vue';

import { mapGetters } from 'vuex';

import { blockexplorerUrl, EXTERNAL_PAGES } from '@/ui/utils';
import extension from '@lib/extensionizer';

export default {
  name: 'ProfileIndex',
  components: {
    SubnavBar,
  },
  computed: {
    ...mapGetters('ui', ['icons']),
    ...mapGetters('opt', [
      'currentVersion',
      'autoLockedTimeout',
      'autoLockedText',
      'finnacialHash',
    ]),
  },
  data() {
    return {};
  },
  methods: {
    gobackHandle() {
      this.$router.go(-1);
    },
    openBlockexplorerTab() {
      const hash = this.finnacialHash;
      browser.tabs.create({
        url: blockexplorerUrl(hash),
        active: true,
      });
    },
    goPageHandle(externalKey) {
      const url = EXTERNAL_PAGES[externalKey];
      if (url) {
        extension.tabs.query({ currentWindow: true }, function (tabs) {
          const idx = tabs.findIndex((tab) => tab.url == url);
          console.log(tabs, idx);
          if (idx < 0) {
            extension.tabs.create({ url, active: true });
          } else {
            extension.tabs.update(idx, { active: true, highlighted: true });
          }
        });
      }
    },
  },
};
</script>
<style>
.options-list-item > div.v-list-item__title {
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
}

div.options-list-title {
  justify-self: start;
  text-align: left;
  flex: 1 1 auto;
}

div.options-list-tail {
  justify-self: end;
  text-align: right;
  flex: 0 1 auto;
}

.option-down-wrap {
  font-family: SFProText-Medium, SFProText;
  display: flex;
  flex-direction: column;
  flex: 1 0 auto;
  flex-wrap: nowrap;
  justify-content: start;
  padding: 12px;
}

.option-down-wrap > div {
  flex: 1 1 auto;
  margin: 0px auto 8px 0px;
}

.bottom-rect-title {
  font-weight: 500;
  color: #000000;
  line-height: 16px;
}

.bottom-rect-address {
  font-size: 12px;
  font-weight: 400;
  color: #19191d;
  line-height: 14px;
  word-break: break-all;
}

.chip-btn.v-size--default {
  border-radius: 12px;
  background: rgba(69, 138, 249, 0.1);
  color: rgba(69, 138, 249, 1);
}
</style>
