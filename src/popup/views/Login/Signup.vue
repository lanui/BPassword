<template>
  <v-container>
    <subnav-bar :gobackCall="gobackHandle" class="px-0 mx-0" />
    <v-row justify="center" class="text-center">
      <v-col cols="12">
        <logo :size="40" />
      </v-col>
      <v-col cols="12">
        <div class="text-h5">
          {{ $t('p.signup.title') }}
        </div>
      </v-col>
    </v-row>
    <v-row justify="center" class="text-center">
      <v-col cols="10">
        <v-form ref="dataForm">
          <v-text-field
            name="password"
            rounded
            outlined
            :loading="loading"
            label=""
            :placeholder="$t('l.passwordPlaceholder')"
            :append-icon="pwdShow ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="pwdShow = !pwdShow"
            :rules="rules.password"
            :type="pwdShow ? 'text' : 'password'"
            v-model="password"
            color="bpgray"
            dense
          >
          </v-text-field>
          <v-text-field
            name="rePassword"
            rounded
            outlined
            :loading="loading"
            label=""
            :placeholder="$t('l.rePasswordPlaceholder')"
            :append-icon="pwdShow ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="pwdShow = !pwdShow"
            :rules="rules.password"
            :type="pwdShow ? 'text' : 'password'"
            v-model="rePassword"
            color="bpgray"
            dense
          >
          </v-text-field>
          <div class="error-tips" v-if="Boolean(errors)">
            <span>
              {{ errors }}
            </span>
          </div>
          <v-btn @click="creatWallet" rounded block larage color="light-blue darken-1" dark>
            <v-progress-circular
              v-if="loading"
              indeterminate
              :size="22"
              :width="2"
              color="white"
            ></v-progress-circular>
            {{ $t('btn.create') }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import logger from '@/libs/logger';
import SubnavBar from '@/popup/widgets/SubnavBar.vue';
import Logo from '@/ui/widgets/Logo';
import WhispererController from '@/libs/messages/whisperer-controller';

import { passwordRules } from '@/ui/validators/forms.js';

import { API_RT_CREATE_WALLET } from '@/libs/msgapi/api-types';
import BizError from '@/libs/biz-error';

export default {
  name: 'SignUp',
  components: {
    SubnavBar,
    Logo,
  },
  computed: {},
  data() {
    return {
      password: '',
      rePassword: '',
      pwdShow: false,
      loading: false,
      errors: '',
      rules: {
        password: [...passwordRules],
      },
    };
  },
  methods: {
    resetForm() {
      this.$refs.dataForm.reset();
      this.loading = false;
      this.errors = '';
    },
    gobackHandle() {
      this.resetForm();
      this.$router.go(-1);
    },
    redirect(path) {
      this.resetForm();
      if (!path) {
        path = '/index';
      }

      this.$router.push({ path });
    },
    creatWallet() {
      if (this.$refs.dataForm.validate()) {
        // console.log(">>>>>>>>>>>>>>",this.password,this.rePassword)
        if (this.password !== this.rePassword) {
          this.errors = '你输入的确认密码不一致.';
          setTimeout(() => {
            this.errors = '';
          }, 6000);
          return;
        }

        const whisperer = new WhispererController({ portName: 'CreateWallet' });

        const data = {
          password: this.password.trim(),
          redirect: '/index',
        };

        this.loading = true;
        whisperer
          .sendSimpleMessage(API_RT_CREATE_WALLET, data)
          .then(async (data) => {
            this.loading = false;
            logger.debug('API_RT_CREATE_WALLET', data);
            await this.$store.dispatch('updateWalletState', data);
            this.redirect('/index');
          })
          .catch((err) => {
            this.loading = false;
            this.errors = err.message;
            setTimeout(() => {
              this.errors = '';
            }, 6000);
          });
      }
    },
  },
};
</script>
<style></style>
