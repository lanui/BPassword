import Vue from 'vue';
import App from './App';

import '@ui/assets/css/main.css';
import vuetify from '../ui/vuetify/index';

import store from '../store';
import router from './router';

import i18n from '@/locale';

global.browser = require('webextension-polyfill');

/* eslint-disable no-new */
const p2 = new Vue({
  i18n,
  vuetify,
  store,
  router,
  render: (h) => h(App),
}).$mount('#app');

global.$p2 = p2;
