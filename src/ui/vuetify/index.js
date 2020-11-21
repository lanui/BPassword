import '@mdi/font/css/materialdesignicons.css';
import Vue from 'vue';

import Vuetify, { VLayout } from 'vuetify/lib';

// import { i18n } from '@/locale';

/**
 * Vuetify
 */
const vuetifyOpts = {
  theme: {
    options: {},
    dark: false,
    themes: {
      light: {
        primary: '#458AF9',
        bpgray: '#8C9092',
      },
    },
  },
  icons: {
    iconfont: 'mdi',
  },
  // lang: {
  //   t: (key, ...params) => i18n.t(key, params),
  // },
};

Vue.use(Vuetify, {
  components: {
    VLayout,
  },
});
const vuetify = new Vuetify(vuetifyOpts);

export default vuetify;
