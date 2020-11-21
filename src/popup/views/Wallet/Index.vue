<template>
  <v-container class="px-0 py-0">
    <subnav-bar
      navColor="rgba(249, 249, 249, 1)"
      :gobackCall="gobackHandle"
      :title="$t('p.wallet.title')"
    />

    <wallet-head-card />
    <tokens-pannel />
  </v-container>
</template>

<script>
import SubnavBar from '@/popup/widgets/SubnavBar.vue';
import WalletHeadCard from './components/WalletHeadCard';
import TokensPannel from './components/TokensPannel';

export default {
  name: 'WalletIndex',
  components: {
    SubnavBar,
    WalletHeadCard,
    TokensPannel,
  },
  methods: {
    gobackHandle() {
      this.$router.go(-1);
    },
  },
};
</script>
<style></style>
