<template>
  <div class="tokens-pannel--wrap">
    <div class="token-item">
      <div class="token-item-row icon">
        <v-img :src="iconDiamands" width="26" height="26"></v-img>
      </div>
      <div class="token-item-row balance">
        {{ diamondsBalText }}
      </div>
      <div class="token-item-row symbol">Diamonds</div>
    </div>
    <div class="token-item">
      <div class="token-item-row icon">
        <v-img :src="iconBPTs" width="26" height="26"></v-img>
      </div>
      <div class="token-item-row balance">
        {{ btsBalText }}
      </div>
      <div class="token-item-row symbol">BTs</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import iconDiamands from '@/ui/assets/icons/icon_diamands.png';
import iconBPTs from '@/ui/assets/icons/icon_bpts.png';

export default {
  name: 'WalletTokensPannel',
  computed: {
    ...mapGetters('acc', ['btsBalText', 'diamondsBalText']),
  },
  data() {
    return {
      iconDiamands,
      iconBPTs,
    };
  },
  methods: {},
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
