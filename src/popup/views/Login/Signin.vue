<template>
  <v-container>
    <v-row justify="center" class="text-center">
      <v-col cols="12">
        <logo :size="58" />
      </v-col>
      <v-col>
        <h1 class="title">
          {{ $t('g.EnlishName') }}
        </h1>
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="10">
        <v-form ref="dataForm">
          <v-text-field
            :loading="loading"
            :append-icon="ctrl.pwdShow ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="rules.password"
            :type="ctrl.pwdShow ? 'text' : 'password'"
            name="Password"
            counter
            @click:append="ctrl.pwdShow = !ctrl.pwdShow"
            :error-messages="loginError"
            :placeholder="$t('l.passwordPlaceholder')"
            v-model="password"
            rounded
            outlined
            dense
            color="bggray"
          >
          </v-text-field>

          <v-btn @click="loginHandle" rounded block color="light-blue darken-1" dark dense>
            <v-progress-circular
              v-if="loading"
              indeterminate
              :size="22"
              :width="2"
              color="white"
            ></v-progress-circular>
            {{ $t('nav.login.unlock') }}
          </v-btn>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapState } from 'vuex';
import Logo from '@/ui/widgets/Logo';

import { passwordRules } from '@/ui/validators/forms.js';

import WhispererController from '@/libs/messages/whisperer-controller';
import { API_RT_LOGIN_WALLET } from '@/libs/msgapi/api-types';

export default {
  name: 'Signin',
  components: { Logo },
  computed: {
    ...mapState(['isUnlocked']),
  },
  data() {
    return {
      password: '',
      loginError: '',
      loading: false,
      ctrl: {
        pwdShow: false,
      },
      rules: {
        password: [...passwordRules],
      },
    };
  },
  methods: {
    resetForm() {
      this.password = '';
      this.loading = false;
      this.loginError = '';
    },
    loginHandle() {
      if (this.$refs.dataForm.validate()) {
        try {
          const whisperer = new WhispererController({ portName: 'P3-login' });
          const data = {
            password: this.password.trim(),
            redirect: '/index',
          };

          this.loading = true;
          whisperer
            .sendSimpleMessage(API_RT_LOGIN_WALLET, data)
            .then(async (initState) => {
              this.loading = false;
              await this.$store.dispatch('initState', initState);
              this.redirectIndex('/index');
            })
            .catch((err) => {
              console.log(err);
              this.loading = false;
              this.loginError = err.message;
              setTimeout(() => {
                this.loginError = '';
              }, 6000);
            });
        } catch (ex) {
          this.loading = false;
          console.error(ex);
        }
      }
    },
    redirectIndex() {
      this.resetForm();
      this.$router.push({ path: '/index' });
    },
  },
  watch: {
    isUnlocked: function (val, old) {
      if (val && old === false) {
        console.log(val);
        this.redirectIndex();
      }
    },
  },
};
</script>
<style></style>
