import mutations from './mutations';
import * as actions from './actions';
import * as getters from './getters';

export default {
  namespaced: true,
  actions,
  mutations,
  getters: {
    icons: (state) => state.icons,
    snackbarShow: (state) => Boolean(state.snackbar.text),
    snackbar: (state) => state.snackbar,
    itemListBox: (state) => state.itemListBox,
    ...getters,
  },
  state: {
    p3: {
      dense: true,
      drawer: false,
    },
    itemListBox: {
      itemHeight: 70,
      height: 282,
      imgSize: 22,
    },
    icons: {
      ARROW_LEFT_MDI: 'mdi-chevron-left',
      ARROW_RIGHT_MDI: 'mdi-chevron-right',
      ARROW_DOWN_MDI: 'mdi-chevron-down',
      ITEM_DEL_MDI: 'mdi-delete-forever-outline',
      DIAMOND_MDI: 'mdi-diamond-stone',
      BTS_MDI: 'mdi-database',
      ETHEREUMN_MDI: 'mdi-ethereum',
      DESKTOP_MAC_MDI: 'mdi-desktop-mac',
      CELLPHONE_KEY_MDI: 'mdi-cellphone-key',
    },
    snackbar: {
      text: '',
      color: 'success',
      snackClass: 'success',
      timeout: 5000,
    },
  },
};
