<template>
  <v-container class="px-0 py-0">
    <v-row justify="center">
      <v-col cols="10" class="px-0 py-0">
        <v-form ref="dataForm" class="addor-item-form">
          <div class="addor-field-wrap py-1">
            <v-text-field
              dense
              outlined
              rounded
              :readonly="Boolean(item.hostname)"
              v-model="item.hostname"
              :value="item.hostname"
              :placeholder="$t('l.domainPlaceholder')"
              hide-details="auto"
              :rules="rules.hostname"
            ></v-text-field>
          </div>
          <div class="addor-field-wrap py-1">
            <v-text-field
              dense
              outlined
              rounded
              v-model="item.suffix"
              :value="item.suffix"
              :placeholder="$t('l.siteTipsPlaceholder')"
              hide-details="auto"
              :rules="rules.suffix"
              :error-messages="error"
            ></v-text-field>
          </div>
          <div class="addor-field-wrap py-1">
            <v-text-field
              dense
              outlined
              rounded
              v-model="item.username"
              :value="item.username"
              :placeholder="$t('l.usernamePlaceholder')"
              hide-details="auto"
              :rules="rules.required"
            ></v-text-field>
          </div>
          <div class="addor-field-wrap py-1">
            <v-text-field
              dense
              outlined
              rounded
              v-model="item.password"
              :value="item.password"
              :placeholder="$t('l.passwordPlaceholder')"
              hide-details="auto"
              :rules="rules.required"
              :type="ctrl.show ? 'text' : 'password'"
              :append-icon="ctrl.show ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="ctrl.show = !ctrl.show"
            ></v-text-field>
          </div>
        </v-form>
      </v-col>
      <v-col cols="10" class="px-0 py-1">
        <v-btn
          @click="saveHandle"
          dense
          block
          rounded
          dark
          color="rgba(69, 138, 249, 1)"
          style="border: solid 1px rgba(0, 0, 0, 0.06)"
        >
          {{ $t('btn.add') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import { hostnameRules, titleSuffixRules } from '@/ui/validators/forms.js';
import { trimItemPorps } from '@/libs/utils/item-transfer';
import logger from '@/libs/logger';
import {
  API_TAB_FETCH_FIELDS_VOL,
  API_WIN_SELECTOR_ERASER_FORCE,
  API_RT_ADD_WEB_ITEM,
} from '@/libs/msgapi/api-types';
import WhispererController from '@/libs/messages/whisperer-controller';

export default {
  name: 'AddPassbook',
  computed: {
    ...mapGetters(['hostname']),
  },
  data() {
    return {
      item: {
        title: '',
        hostname: '',
        username: '',
        password: '',
        suffix: '',
      },
      error: '',
      ctrl: {
        loading: false,
        show: false,
      },
      rules: {
        hostname: [...hostnameRules],
        suffix: [...titleSuffixRules],
        required: [(v) => (!!v && v.trim().length > 0) || 'required'],
      },
    };
  },
  methods: {
    stopPopEvent() {},
    saveHandle() {
      if (this.$refs.dataForm.validate()) {
        const whisperer = new WhispererController();

        const data = trimItemPorps(this.item);
        if (this.item.suffix) {
          data.title = this.hostname + ';' + this.item.suffix;
        } else {
          data.title = this.hostname;
        }
        this.ctrl.loading = true;
        whisperer
          .sendSimpleMessage(API_RT_ADD_WEB_ITEM, data)
          .then(async (websiteState) => {
            this.removeSelector();
          })
          .catch((err) => {
            this.ctrl.loading = false;
            this.error = err.message;
            setTimeout(() => {
              this.error = '';
            }, 6000);
          });
      }
    },

    removeSelector() {
      let message = {
        apiType: API_WIN_SELECTOR_ERASER_FORCE,
        isInner: window.top !== window.self,
      };

      window.top.postMessage(message, '*');
    },

    fetchFieldsVol(hostname) {
      const that = this;
      this.item.hostname = hostname;
      browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tabId = tabs[0].id;

        const reqData = {
          tabId,
          hostname: hostname,
          favIconUrl: tabs[0].favIconUrl,
        };

        browser.tabs.sendMessage(tabId, reqData, {}, function (data) {
          logger.debug('Received fetch input data>>>>', data);
          if (typeof data === 'object') {
            if (!data.hostname) reqData.hostname = hostname;
            that.item = Object.assign({}, data);
          }
        });
      });
    },
  },
  mounted() {
    const hostname = this.$store.state.hostname || '';
    this.fetchFieldsVol(hostname);
  },
};
</script>

<style lang="css" scope>
.addor-item-form .v-input__slot {
  min-height: 26px;
}

.addor-field-wrap .v-text-field--outlined fieldset {
  border: 0 solid transparent;
}
</style>
