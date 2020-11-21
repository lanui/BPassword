import iconPassbook from '@/ui/assets/icons/icon-passbook.png';
import iconWallet from '@/ui/assets/icons/icon-wallet.png';
import iconExport from '@/ui/assets/icons/icon-ex.png';
import iconImport from '@/ui/assets/icons/icon-im.png';
import iconOptions from '@/ui/assets/icons/icon-options.png';

const navs = [
  {
    name: 'passbook',
    path: '/passbook',
    text: '密码本',
    i18n: 'passbook',
    icon: 'mdi-wallet-giftcard',
    iconImg: iconPassbook,
    sort: 1,
    hidden: false,
  },
  {
    name: 'wallet',
    path: '/wallet',
    text: '钱包',
    i18n: 'wallet',
    icon: 'mdi-wallet-giftcard',
    iconImg: iconWallet,
    sort: 2,
    hidden: false,
  },
  {
    name: 'exportorWallet',
    path: '/wallet/export',
    text: '导出账号',
    i18n: 'exportor',
    icon: 'mdi-export',
    iconImg: iconExport,
    sort: 3,
    hidden: false,
  },
  {
    name: 'importor',
    path: '/importor',
    text: '导入账户',
    i18n: 'importor',
    icon: 'mdi-content-duplicate',
    iconImg: iconImport,
    sort: 4,
    hidden: true,
  },
  {
    name: 'profile',
    path: '/profile',
    text: '设置',
    i18n: 'profile',
    icon: 'mdi-cog',
    iconImg: iconOptions,
    sort: 5,
    hidden: false,
  },
];

export default navs
  .filter((nav) => !Boolean(nav.hidden))
  .sort((n1, n2) => {
    const s1 = n1.sort || 0,
      s2 = n2.sort || 0;
    if (s1 > s2) return 1;
    if (s1 < s2) return -1;
    return 0;
  });
