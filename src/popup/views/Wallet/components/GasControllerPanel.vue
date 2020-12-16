<template>
  <div>
    <v-list dense class="px-0">
      <v-list-item class="member-status-item">
        <v-list-item-title> Gas Price: {{ gasPrice / 10 }} Gwei </v-list-item-title>
        <v-list-item-action>
          <v-icon @click="gasPanelShow = !gasPanelShow">
            {{ gasPanelShow ? icons.ARROW_DOWN_MDI : icons.ARROW_RIGHT_MDI }}
          </v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <v-expand-transition>
      <v-card elevation="0" class="px-2" v-show="gasPanelShow">
        <v-card-text class="px-0 py-0">
          <v-slider
            inverse-label
            :thumb-size="14"
            :max="gasState.fastest"
            :min="gasState.safeLow"
            v-model="gasPrice"
          >
            <template v-slot:append>
              <div class="gas-price">
                <div>{{ gasPrice / 10 }}</div>
                <div>Gwei</div>
              </div>
            </template>
          </v-slider>
        </v-card-text>
      </v-card>
    </v-expand-transition>
  </div>
</template>
<script>
import { mapGetters } from 'vuex';
export default {
  name: 'GasControllerPanel',
  computed: {
    ...mapGetters('ui', ['icons']),
    ...mapGetters('web3', ['gasState', 'estimateBts']),
  },
  data() {
    return {
      gasPanelShow: false,
      gasPrice: 0,
    };
  },
  mounted() {
    this.gasPrice = this.gasState.average || this.gasState.gasPrice;
  },
};
</script>
<style>
.gas-price {
  width: 40px;
  text-align: center;
  font-size: 0.75rem;
}

.gas-price > div {
  font-size: 0.75rem;
}
</style>
