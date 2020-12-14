import MainLayout from '../layouts/MainLayout.vue';
import GuessLayout from '../layouts/GuessLayout';

import HomeIndex from '../views/Home/Index.vue';
import Welcome from '../views/Login/Welcome.vue';
import Signin from '../views/Login/Signin.vue';
import Signup from '../views/Login/Signup.vue';
import ImportNew from '../views/Wallet/ImportNewWallet.vue';

//passbook
import AddWebsiteItem from '../views/Passbook/AddWebsiteItem.vue';
import EditWebsiteItem from '../views/Passbook/EditWebsiteItem.vue';
import AddMobileItem from '../views/Passbook/AddMobileItem.vue';
import EditMobileItem from '../views/Passbook/EditMobileItem.vue';

//wallet
import WalletIndex from '../views/Wallet/Index.vue';
import ExportWallet from '../views/Wallet/ExportWallet.vue';

//Profile
import ProfileIndex from '../views/Profile/Index.vue';

export default [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: 'index',
        alias: ['/', '/passbook'],
        component: HomeIndex, //HomeIndex
        meta: {
          auth: true,
          refreshBalance: true,
        },
      },
    ],
    meta: {},
  },
  {
    path: '/passbook',
    component: MainLayout,
    children: [
      {
        path: 'add_website_item',
        name: 'addWebsiteItem',
        component: AddWebsiteItem,
        meta: {
          auth: true,
        },
      },
      {
        path: 'edit_website_item',
        name: 'editWebsiteItem',
        component: EditWebsiteItem,
        meta: {
          auth: true,
        },
      },
      {
        path: 'add_mobile_item',
        name: 'addMobileItem',
        component: AddMobileItem,
        meta: {
          auth: true,
        },
      },
      {
        path: 'edit_mobile_item',
        name: 'editMobileItem',
        component: EditMobileItem,
        meta: {
          auth: true,
        },
      },
    ],
    meta: {
      auth: true,
    },
  },
  {
    path: '/wallet',
    component: MainLayout,
    children: [
      {
        path: 'index',
        alias: '/wallet',
        component: WalletIndex, //HomeIndex
        meta: {
          auth: true,
          refreshBalance: true,
        },
      },
      {
        path: 'export',
        component: ExportWallet, //HomeIndex
        meta: {
          auth: true,
        },
      },
    ],
    meta: { auth: true },
  },
  {
    path: '/profile',
    component: MainLayout,
    children: [
      {
        path: 'index',
        alias: '/profile',
        component: ProfileIndex,
        meta: {
          auth: true,
        },
      },
    ],
    meta: { auth: true },
  },
  {
    path: '/',
    component: GuessLayout,
    children: [
      {
        path: 'welcome',
        component: Welcome,
      },
      {
        path: 'signup',
        component: Signup,
      },
      {
        path: 'signin',
        alias: '/login',
        component: Signin,
      },
      {
        path: 'import_new',
        component: ImportNew,
      },
    ],
    meta: {},
  },
];
