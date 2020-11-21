<template>
  <v-container>
    <subnav-bar :gobackCall="gobackHandle" :title="$t('p.importor.title')" />
    <v-row justify="center">
      <v-col cols="10">
        <v-sheet color="white" elevation="0" width="100%">
          <div class="my-1">
            <label class="bp-label">
              {{ $t('l.jsonKeystore') }}
            </label>
          </div>
        </v-sheet>

        <v-form ref="dataForm">
          <v-textarea
            dense
            outlined
            :placeholder="$t('l.jsonKeystorePlaceholder')"
            name="v3json"
            rows="7"
            color="primary"
            v-model="v3json"
            :value="v3json"
            :error-messages="jsonError"
            type="text"
            filled
            :rules="rules.json"
          ></v-textarea>
          <v-text-field
            dense
            outlined
            rounded
            counter
            filled
            :placeholder="$t('l.passwordPlaceholder')"
            :append-icon="ctrl.pwdShow ? 'mdi-eye' : 'mdi-eye-off'"
            :type="ctrl.pwdShow ? 'text' : 'password'"
            @click:append="ctrl.pwdShow = !ctrl.pwdShow"
            v-model="password"
            :value="password"
            :disabled="ctrl.loading"
            :rules="rules.password"
            :error-messages="pwdError"
            name="password"
          ></v-text-field>
          <v-btn @click="importHandle" rounded larage dark block color="primary" class="mx-0">
            <v-progress-circular
              v-if="ctrl.loading"
              indeterminate
              :size="22"
              :width="2"
              color="white"
            ></v-progress-circular>
            {{ $t('btn.import') }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import SubnavBar from '@/popup/widgets/SubnavBar.vue';
import { passwordRules, keystoreRules } from '@/ui/validators/forms.js';

import WhispererController from '@/libs/messages/whisperer-controller';
import { API_RT_IMPORT_WALLET } from '@/libs/msgapi/api-types';

export default {
  name: 'ImportNewWallet',
  components: {
    SubnavBar,
  },
  computed: {},
  data() {
    return {
      v3json: '',
      password: '',
      jsonError: '',
      pwdError: '',
      ctrl: {
        pwdShow: false,
        loading: false,
      },
      rules: {
        password: [...passwordRules],
        json: [...keystoreRules],
      },
    };
  },
  methods: {
    resetForm() {
      this.$refs.dataForm.reset();
      this.ctrl.loading = false;
      this.jsonError = '';
      this.pwdError = '';
    },
    gobackHandle() {
      this.resetForm();
      this.$router.go(-1);
    },
    gotoIndex() {
      this.$router.push({ path: '/index' });
    },
    async importHandle() {
      if (this.$refs.dataForm.validate()) {
        const reqData = {
          env3: JSON.parse(this.v3json),
          password: this.password,
        };
        const whisperer = new WhispererController({ portName: 'P3-import' });

        this.ctrl.loading = true;
        whisperer
          .sendSimpleMessage(API_RT_IMPORT_WALLET, reqData)
          .then(async (initState) => {
            console.log('initState>>>>>>>>>>', initState);
            await this.$store.dispatch('initState', initState);
            this.gotoIndex();
          })
          .catch((err) => {
            console.log('Error>>>>>>>>>>', err);
            this.ctrl.loading = false;
            this.pwdError = err.message;
            setTimeout(() => {
              this.pwdError = '';
            }, 6000);
          });
      }
    },
  },
};
</script>
<style></style>
