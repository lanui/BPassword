<template>
  <v-container>
    <subnav-bar :gobackCall="gobackHandle" :title="$t('p.passbook.addItemTitle')" />
    <v-row justify="center">
      <v-col cols="11">
        <v-form ref="dataForm">
          <v-text-field
            v-model="item.title"
            :placeholder="$t('l.titlePlaceholder')"
            outlined
            rounded
            :loading="ctrl.loading"
            :rules="rules.required"
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
          />
          <div class="error-tips">
            <div class="tips__content" v-show="Boolean(this.error)">
              {{ this.error }}
            </div>
          </div>
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
import { trimItemPorps } from '@/libs/utils/item-transfer';

import WhispererController from '@/libs/messages/whisperer-controller';
import { API_RT_ADD_MOB_ITEM } from '@/libs/msgapi/api-types';

export default {
  name: 'AddMobileItem',
  components: {
    SubnavBar,
    TipsRoundedBox,
  },
  computed: {},
  data() {
    return {
      item: {
        title: '',
        username: '',
        password: '',
      },
      error: '',
      ctrl: {
        loading: false,
      },
      rules: {
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
    saveRequestHandle() {
      if (this.$refs.dataForm.validate()) {
        const data = trimItemPorps(this.item);

        const whisperer = new WhispererController();
        this.ctrl.loading = true;
        whisperer
          .sendSimpleMessage(API_RT_ADD_MOB_ITEM, data)
          .then(async (websiteState) => {
            await this.$store.dispatch('passbook/subInitState4Mob', websiteState);
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
  watch: {},
};
</script>
<style></style>
