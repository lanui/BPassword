import Vue from 'vue';
import VueI18n from 'vue-i18n';

import { DEFAULT_LOCALE } from '@/ui/settings';
import vuetifyI18n from '@/ui/vuetify/vuetify-i18n';

import zh from './zh_CN';
import en from './en_US';

Vue.use(VueI18n);

const messages = {
  en: {
    ...en,
    $vuetify: vuetifyI18n.en,
  },
  zh: {
    ...zh,
    $vuetify: vuetifyI18n.zh,
  },
};

export const locales = [
  {
    title: 'English',
    locale: 'en',
    abbr: 'ENG',
  },
  {
    title: '中文',
    locale: 'zh',
    abbr: 'CHN',
  },
];

export const i18n = new VueI18n({
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
});

/**
 * @param {string} locale
 */
export async function setLocale(locale) {
  const findIndex = locales.findIndex((l) => l.locale === locale);
  if (findIndex >= 0 && i18n.locale !== locale) {
    i18n.locale = locale;
  }
}

export default i18n;
