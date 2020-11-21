<template>
  <v-container>
    <subnav-bar :gobackCall="gobackHandle" :title="$t('p.passbook.addItemTitle')" />
    <v-row justify="center">
      <v-col cols="11">
        <v-form ref="dataForm">
          <div v-if="false" class="title-show text-center my-0">
            <span class="mr-2"> {{ $t('l.title') }}: </span>
            {{ item.title }}
          </div>

          <v-text-field
            v-model="item.hostname"
            :placeholder="$t('l.domainPlaceholder')"
            outlined
            rounded
            :loading="ctrl.loading"
            :rules="rules.hostname"
            :error-messages="error"
            dense
            clearable
            color="bpgray"
          >
            <v-icon @click.stop="hostnameTransHandle" slot="append"> mdi-find-replace </v-icon>
          </v-text-field>
          <v-text-field
            v-model="item.suffix"
            :placeholder="$t('l.siteTipsPlaceholder')"
            outlined
            rounded
            :loading="ctrl.loading"
            :rules="rules.suffix"
            :error-messages="error"
            dense
            color="bpgray"
          />
          <v-text-field
            v-model="item.username"
            :placeholder="$t('l.usernamePlaceholder')"
            outlined
            rounded
            :loading="ctrl.loading"
            :rules="rules.required"
            dense
            color="bpgray"
          />
          <v-text-field
            v-model="item.password"
            :placeholder="$t('l.passwordPlaceholder')"
            outlined
            rounded
            :loading="ctrl.loading"
            :rules="rules.required"
            :counter="true"
            dense
            color="bpgray"
            :append-icon="ctrl.pwdShow ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="ctrl.pwdShow = !ctrl.pwdShow"
            :type="ctrl.pwdShow ? 'text' : 'password'"
          />

          <v-btn
            @click="saveRequestHandle"
            block
            rounded
            :loading="ctrl.loading"
            color="primary"
            dark
          >
            {{ $t('btn.save') }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="11">
        <tips-rounded-box :text="$t('p.passbook.addItemTips')" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import SubnavBar from '@/popup/widgets/SubnavBar.vue';
import TipsRoundedBox from '@/ui/widgets/TipsRoundedBox.vue';

import { hostnameRules, titleSuffixRules } from '@/ui/validators/forms.js';

import { trimItemPorps } from '@/libs/utils/item-transfer';

import WhispererController from '@/libs/messages/whisperer-controller';
import { API_RT_ADD_WEB_ITEM } from '@/libs/msgapi/api-types';

export default {
  name: 'AddWebsiteItem',
  components: {
    SubnavBar,
    TipsRoundedBox,
  },
  computed: {},
  data() {
    return {
      item: {
        hostname: '',
        title: '',
        username: '',
        password: '',
        suffix: '',
      },
      error: '',
      ctrl: {
        loading: false,
        pwdShow: false,
      },
      rules: {
        hostname: [...hostnameRules],
        suffix: [...titleSuffixRules],
        required: [(v) => (!!v && v.trim().length > 0) || 'required'],
      },
    };
  },
  methods: {
    resetForm() {
      this.$refs.dataForm.reset();
      this.ctrl.loading = false;
      this.error = '';
    },
    gobackHandle() {
      this.resetForm();
      this.$router.go(-1);
    },
    hostnameTransHandle(val) {
      if (this.item.hostname) {
        try {
          const url = new URL(this.item.hostname);
          this.item.hostname = url.hostname;
        } catch (er) {}
      }
    },
    saveRequestHandle() {
      if (this.$refs.dataForm.validate()) {
        const data = trimItemPorps(this.item);
        const whisperer = new WhispererController();

        this.ctrl.loading = true;
        whisperer
          .sendSimpleMessage(API_RT_ADD_WEB_ITEM, data)
          .then(async (websiteState) => {
            await this.$store.dispatch('passbook/subInitState4Site', websiteState);
            this.gobackHandle();
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
  },
  mounted() {},
  watch: {
    'item.hostname': function (val, oldVal) {
      const parts = [];
      if (val && val.trim().length > 0) {
        parts.push(val.trim());
      }

      const suffix = this.item.suffix;
      if (suffix && suffix.trim().length > 0) {
        parts.push(suffix.trim());
      }
      parts.length && (this.item.title = parts.join(';'));
    },
    'item.suffix': function (val) {
      const parts = [];

      const hostname = this.item.hostname;
      if (hostname && hostname.trim().length > 0) {
        parts.push(hostname.trim());
      }

      if (val && val.trim().length > 0) {
        parts.push(val.trim());
      }

      parts.length && (this.item.title = parts.join(';'));
    },
  },
};
</script>
<style></style>
