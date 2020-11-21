<template>
  <v-container>
    <subnav-bar :gobackCall="gobackHandle" :title="$t('p.wallet.export')" />
    <v-row justify="center" v-if="!unlocked" :class="!unlocked ? 'pt-12' : ''">
      <v-col cols="10">
        <v-form ref="exportForm">
          <v-text-field
            :loading="ctrl.loading"
            dense
            outlined
            rounded
            counter
            :placeholder="$t('l.passwordPlaceholder')"
            :append-icon="ctrl.pwdShow ? 'mdi-eye' : 'mdi-eye-off'"
            :type="ctrl.pwdShow ? 'text' : 'password'"
            @click:append="ctrl.pwdShow = !ctrl.pwdShow"
            v-model="password"
            :value="password"
            :rules="rules.password"
            :error-messages="error"
            name="password"
          ></v-text-field>
        </v-form>
      </v-col>
      <v-col cols="10">
        <v-btn block larage rounded @click="unlockedHandle" color="primary" dark>
          <v-progress-circular
            v-if="ctrl.loading"
            indeterminate
            :size="22"
            :width="2"
            color="white"
          ></v-progress-circular>
          {{ $t('btn.unlock') }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="10" v-if="unlocked" class="text-center">
        <v-img :src="qrcode" width="150" class="py-1 mx-auto" ref="qrcodeImg"></v-img>
        <v-btn @click="downloadQrcodeHandle" rounded dark color="primary" small class="mt-2">
          {{ $t('btn.expqrcode') }}
        </v-btn>
      </v-col>
    </v-row>

    <v-row justify="center" v-if="unlocked">
      <v-col cols="10">
        <v-sheet class="keystore-title-wrap">
          <div class="bp-label">Keystore</div>
          <v-spacer></v-spacer>
          <div class="py-1 bp-tips" ref="clipJsonIcon" :data-clipboard-text="v3json">
            <span>{{ $t('p.wallet.exportJsonCopyTips') }}</span>
            <v-icon size="12" color="orange darken-1"> mdi-hand-pointing-down </v-icon>
          </div>
        </v-sheet>
        <textarea
          name="keystore"
          class="keystore-textarea"
          readonly
          id="keystore-textarea"
          rows="5"
          :value="v3json"
        >
        </textarea>
      </v-col>
      <v-snackbar width="220px" :timeout="4000" v-model="showNotifier" centered :elevation="1">
        {{ 'Keystore copied.' }}
        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text icon v-bind="attrs" @click="showNotifier = false">
            <v-icon> mdi-close </v-icon>
          </v-btn>
        </template>
      </v-snackbar>
    </v-row>

    <v-row class="">
      <a href="#" id="downloadQrcodeLink" style="display: none" ref="downloadQrcodeLink"></a>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import QRCode from 'qrcode';
import Clipboard from 'clipboard';

import SubnavBar from '@/popup/widgets/SubnavBar.vue';
import { passwordRules } from '@/ui/validators/forms.js';

export default {
  name: 'ExportWalletIndex',
  components: {
    SubnavBar,
  },
  computed: {},
  data() {
    return {
      unlocked: false,
      password: '',
      dev3: null,
      v3json: '',
      qrcode: '',
      error: '',
      showNotifier: false,
      ctrl: {
        loading: false,
        pwdShow: false,
      },
      rules: {
        password: passwordRules,
      },
    };
  },
  methods: {
    resetForm() {
      this.password = '';
      this.ctrl.loading = false;
      this.error = '';
      this.v3json = '';
      this.qrcode = '';
      this.unlocked = false;
    },
    gobackHandle() {
      this.resetForm();
      this.$router.go(-1);
    },
    async unlockedHandle() {
      if (this.$refs.exportForm.validate()) {
        const pwd = this.password;

        this.ctrl.loading = true;
        this.$store
          .dispatch('unlockEnv3ForPopup', pwd)
          .catch((err) => {
            this.ctrl.loading = false;
            this.error = typeof err === 'object' && err.message ? err.message : err.toString();

            setTimeout(() => {
              this.resetForm();
            }, 6000);
          })
          .then((state) => {
            this.ctrl.loading = false;
            this.v3json = state.json;
            this.unlocked = true;
            return state.json;
          })
          .then((jsonText) => {
            this.initClipboard();
            QRCode.toDataURL(jsonText)
              .then((url) => {
                this.qrcode = url;
              })
              .catch((err) => {
                console.error(err);
              });
          });
      }
    },
    initClipboard() {
      const clip = new Clipboard(this.$refs.clipJsonIcon);
      clip.on('success', (e) => {
        this.showNotifier = true;
      });
      clip.on('error', (e) => {
        console.log('Copy fail', e);
      });
    },
    downloadQrcodeHandle() {
      const refImg = this.$refs.qrcodeImg;

      let srcUrl = refImg.src;
      const image = refImg.image;

      if (!srcUrl && image) {
        const width = image.width || refImg.$el.clientWidth;
        const height = image.height || refImg.$el.clientHeight;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        canvas.getContext('2d').drawImage(image, 0, 0);
        srcUrl = canvas.toDataURL('image/png');
      }

      if (!srcUrl) {
        console.warn('no image source.');
        return;
      }

      const linkEl = document.querySelector('#downloadQrcodeLink');
      linkEl.setAttribute('href', srcUrl);
      linkEl.setAttribute('download', 'bpassword-keystore.png');

      linkEl.click();
    },
  },
};
</script>
<style lang="css" scope>
.keystore-title-wrap {
  display: flex;
  flex-direction: row;
  flex: 1 1 100%;
  font-family: PingFangSC-Medium, PingFang SC;
  font-weight: 500;
  color: #19191d;
}

.keystore-title-wrap .bp-tips > span {
  font-size: 12px;
  font-weight: 400;
  color: #c8cccf;
}

.keystore-title-wrap .bp-tips > span:hover {
  cursor: pointer;
  color: rgba(69, 138, 249, 0.85);
}

.keystore-textarea {
  width: 100%;
  background-color: rgba(233, 235, 236, 1);
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #19191d;
  padding: 4px 8px;
  border-radius: 16px;
  border: 1px solid #e9ebec;
  outline: 0;
}
</style>
