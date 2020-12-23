<template>
  <v-container>
    <v-row>
      <div class="tokens-pannel--wrap">
        <div class="token-item">
          <div class="token-item-row icon">
            <v-img :src="iconDiamands" width="26" height="26"></v-img>
          </div>
          <div class="token-item-row balance">
            {{ getDiamondsText }}
          </div>
          <div class="token-item-row symbol">Diamonds</div>
        </div>
        <div class="token-item" @click.stop="gotoRechargePage">
          <div class="token-item-row icon">
            <v-img :src="iconBPTs" width="26" height="26"></v-img>
          </div>
          <div class="token-item-row balance">
            {{ getBTsBalanceText }}
          </div>
          <div class="token-item-row symbol">BTs</div>
        </div>
      </div>
    </v-row>
    <v-row justify="center" class="text-center">
      <v-col cols="6" class="py-0"></v-col>
      <v-col cols="6" class="py-0">
        <v-btn v-if="showRechargeBtn" @click.stop="gotoRechargePage" small color="primary">
          {{ $t('btn.recharge') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import iconDiamands from '@/ui/assets/icons/icon_diamands.png';
import iconBPTs from '@/ui/assets/icons/icon_bpts.png';

export default {
  name: 'WalletTokensPannel',
  computed: {
    ...mapGetters('web3', [
      'getBTsBalanceText',
      'getDiamondsText',
      'estimateBts',
      'showRechargeBtn',
    ]),
  },
  data() {
    return {
      iconDiamands,
      iconBPTs,
    };
  },
  methods: {
    gotoRechargePage() {
      this.$router.push({ path: '/wallet/recharge' });
    },
  },
  mounted() {},
};
</script>
<style>
.tokens-pannel--wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: transparent;
  padding: 16px 0;
}

.tokens-pannel--wrap .token-item {
  display: flex;
  flex-direction: column;
  margin: 0;
  margin-left: 15px;
  background: rgba(249, 249, 249, 1);
  border-radius: 16px;
  height: 111px;
  flex: 1 1 50%;
  justify-content: center;
  align-items: center;
}

.token-item:hover {
  cursor: pointer;
  background: rgba(239, 240, 240, 1);
}

.tokens-pannel--wrap .token-item:last-child {
  margin-right: 15px;
}

.token-item-row {
  display: flex;
  flex: 1 1 auto;
  justify-content: center;
  align-items: center;
  align-self: center;
  justify-self: center;
  vertical-align: middle;
}

.token-item-row.icon {
  margin-top: 14px;
}

.token-item-row.balance {
  font-size: 24px;
  font-family: SFProText-Semibold, SFProText;
  font-weight: 600;
  color: #19191d;
  line-height: 29px;
}

.token-item-row.symbol {
  font-size: 14px;
  font-family: SFProText-Regular, SFProText;
  font-weight: 400;
  color: #19191d;
  line-height: 16px;
  margin-bottom: 14px;
}
</style>
