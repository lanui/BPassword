<template>
  <div class="white--text wallet--wrapper text-center">
    <div class="wallet-inner--wrap">
      <div class="wallet-item--wrap">
        <div class="item-line">
          <v-icon color="white">
            {{ icons.DIAMOND_MDI }}
          </v-icon>
        </div>
        <div class="item-line balance">
          {{ diamondsBalText }}
        </div>
        <div class="item-line symbol">Diamonds</div>
      </div>
      <div class="wallet-item--wrap">
        <div class="item-line">
          <v-icon color="white">
            {{ icons.BTS_MDI }}
          </v-icon>
        </div>
        <div class="item-line balance">
          {{ btsBalText }}
        </div>
        <div class="item-line symbol">BTs</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
export default {
  name: 'TokensRect',
  components: {},
  computed: {
    ...mapGetters('ui', ['icons']),
    ...mapGetters('acc', ['diamondsBalText', 'ethBalText', 'btsBalText']),
  },
  data() {
    return {};
  },
  methods: {},
};
</script>
<style lang="css" scoped>
.wallet--wrapper {
  width: 100%;
  height: 160px;
  background: #ffffff;
  display: flex;
}

.wallet-inner--wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1 1;
  margin: 24px;
  padding: 4px 8px;
  background: linear-gradient(217deg, #86b3e7 0%, #6fa0ef 100%, #6fa0ef 100%);
  border-radius: 16px;
}
.wallet-item--wrap {
  display: flex;
  flex-direction: column;
  flex: 1 1 50%;
  align-self: center;
}

.wallet-item--wrap.item-line {
  width: 100%;
  justify-content: center;
}

.item-line.balance {
  font-size: 26px;
  font-family: SFProText-Semibold, SFProText;
  font-weight: 600;
}

.item-line.symbol {
  font-size: 14px;
  font-family: SFProText-Semibold, SFProText;
  font-weight: 300;
}

.wallet--wrapper .inner-nickname {
  font-size: 1.75rem;
  padding: 1rem auto;
}
.wallet--wrapper .inner-wallet {
  font-size: 0.75rem;
  margin: 0.5rem auto;
}
</style>
