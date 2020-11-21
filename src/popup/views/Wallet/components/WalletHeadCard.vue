<template>
  <v-container class="head-card--wrapper">
    <v-img :src="qrcode" width="100" class="mx-auto my-2"></v-img>
    <div class="d-flex justify-center elevation-0">
      <p class="body-2">{{ shortAddress }}</p>
      <v-btn ref="clipboardIcon" :data-clipboard-text="selectedAddress" icon x-small>
        <v-icon color="primary"> mdi-content-copy </v-icon>
      </v-btn>
    </div>
    <v-snackbar width="220px" :timeout="4000" v-model="showNotifier" centered :elevation="1">
      {{ 'Address copied.' }}
      <template v-slot:action="{ attrs }">
        <v-btn color="pink" text icon v-bind="attrs" @click="showNotifier = false">
          <v-icon> mdi-close </v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import Clipboard from 'clipboard';
import QRCode from 'qrcode';
import { mapGetters, mapState } from 'vuex';
import { compressAddress } from '@/ui/utils.js';

export default {
  name: 'WalletHeadCard',
  computed: {
    ...mapGetters('web3', ['selectedAddress']),
    shortAddress() {
      const address = this.selectedAddress;
      return address ? compressAddress(address) : '';
    },
  },
  data() {
    return {
      qrcode: '',
      showNotifier: false,
    };
  },
  methods: {
    getQrcodeUrl() {
      const text = this.selectedAddress;
      QRCode.toDataURL(text)
        .then((url) => {
          this.qrcode = url;
        })
        .catch((err) => {
          console.error(err);
        });
    },
    initClipboard() {
      const clip = new Clipboard(this.$refs.clipboardIcon.$el);
      clip.on('success', (e) => {
        this.showNotifier = true;
      });
    },
  },
  mounted() {
    this.initClipboard();
    this.getQrcodeUrl();
  },
};
</script>
<style lang="css" scope>
.head-card--wrapper {
  width: 100%;
  justify-content: center;
  padding: 0;
  background: rgba(249, 249, 249, 1);
}
</style>
