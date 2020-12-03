import Vue from 'vue';
import vuetify from '../ui/vuetify';

import App from './App.vue';
import i18n from '@/locale';
import store from './store';
import router from './router';

import LivedManager from '@lib/messages/leech-lived-manager';
import logger from '@lib/logger';

global.browser = require('webextension-polyfill');

// communicate backend
import { ENV_TYPE_LEECH } from '@lib/enums';
const livedManager = new LivedManager({
  portName: ENV_TYPE_LEECH,
  store,
});

global.leech = new Vue({
  el: '#Root',
  i18n,
  store,
  router,
  vuetify,
  render: (h) => h(App),
});

/**
 * 阻止 触发 主页面失去焦点
 */
window.document.addEventListener('mousedown', function (e) {
  logger.debug('Leech App stop event.');
  e.stopImmediatePropagation();
  e.preventDefault();
});
