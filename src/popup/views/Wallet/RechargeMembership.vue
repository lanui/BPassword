<template>
  <v-container class="px-0 py-0">
    <subnav-bar
      navColor="rgba(249, 249, 249, 1)"
      :gobackCall="gobackHandle"
      :title="$t('p.recharge.title')"
    />

    <v-list dense class="py-0">
      <v-list-item class="member-status-item">
        <v-list-item-title>
          <div class="flex-item-left item-label">{{ $t('l.memberExpired') }}:</div>
          <v-spacer></v-spacer>
          <div class="flex-item-end item-expired">
            <span>
              {{ expiredText }}
            </span>
          </div>
        </v-list-item-title>
      </v-list-item>
      <v-list-item class="member-status-item">
        <v-list-item-title>
          <div class="flex-item-left item-label"></div>
          <v-spacer></v-spacer>
          <div class="flex-item-end item-expired">
            <span>{{ membershipCostBTsPerYear }} BTs/year</span>
          </div>
        </v-list-item-title>
      </v-list-item>
    </v-list>
    <gas-controller-panel ref="gasCtx" />
    <v-row justify="center" class="px-0">
      <v-col v-if="validNeedApprove" cols="5">
        <v-btn block @click.stop="approveAndChargeHandler" color="primary" small> Approve </v-btn>
      </v-col>
      <v-col :cols="validNeedApprove ? 5 : 10">
        <v-btn @click.stop="rechargeHandler" block color="primary" small> 充值 </v-btn>
      </v-col>
    </v-row>
    <v-overlay :z-index="0" :value="loading" class="trading-mask">
      <div class="trading-mask--inner">
        <div class="trading-row">
          <v-progress-circular indeterminate size="50"></v-progress-circular>
        </div>
        <div class="trading-row pt-3">
          {{ statusText }}
        </div>
      </div>
    </v-overlay>
  </v-container>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import SubnavBar from '@/popup/widgets/SubnavBar.vue';
import GasControllerPanel from './components/GasControllerPanel.vue';

import logger from '@lib/logger';
import WhispererController from '@lib/messages/whisperer-controller';
import { getWeb3Inst } from '@lib/web3/web3-helpers';
import { API_RT_FETCH_BTAPPROVED_RAW_DATA, API_RT_ADDORUP_TX_STATE } from '@lib/msgapi/api-types';

import { INTERNAL_ERROR, INTERNAL_MISS_MSG } from '@lib/biz-error/error-codes';
import { TX_PENDING, TX_FAILED, TX_CONFIRMED } from '@lib/web3/cnst';

export default {
  name: 'RechargeMembership',
  components: {
    SubnavBar,
    GasControllerPanel,
  },
  computed: {
    ...mapGetters('web3', [
      'chainId',
      'rpcUrl',
      'getMembershipExpired',
      'membershipCostBTsPerYear',
      'validNeedApprove',
      'chainTxs',
    ]),
    expiredText() {
      let text = this.getMembershipExpired;
      return !text ? this.$t('l.nonMember') : text;
    },
    trading() {
      const txs = this.chainTxs || [];
      const reqId = this.txReqId;
      if (!reqId || !txs.length) return false;

      let txState = txs.find((tx) => tx.reqId === reqId);
      if (txState && txState.statusText === TX_PENDING) {
        return true;
      }
      return false;
    },
  },
  data() {
    return {
      txReqId: '',
      loading: false,
      statusText: 'Approving...',
    };
  },
  methods: {
    gobackHandle() {
      this.$router.go(-1);
    },
    startLoading(text) {
      this.loading = true;
      this.statusText = text || '';
    },
    stopLoading() {
      this.loading = false;
      this.statusText = '';
    },
    updateTradingText(text) {
      this.statusText = text || '';
    },
    async approveAndChargeHandler() {
      const reqId = this.$uid();
      const chainId = this.chainId;

      const that = this;

      let tradingText = '';

      try {
        that.startLoading('Approving...');
        const web3js = getWeb3Inst(this.rpcUrl);
        const gasPriceSwei = this.$refs.gasCtx.gasPrice;

        const whisperer = new WhispererController({ portName: `BTAPPROVED_${reqId}` });

        const data = { reqId, gasPriceSwei };

        //
        const signedRet = await whisperer.sendSimpleMessage(API_RT_FETCH_BTAPPROVED_RAW_DATA, data);

        logger.debug('Signed result:', signedRet);

        if (!signedRet || !signedRet.rawData) {
          throw new BizError('Signed Approved fail.', INTERNAL_ERROR);
        }

        const rawData = signedRet.rawData;
        tradingText = `Approved Signed rawData : ${rawData}`;
        that.updateTradingText(tradingText);

        let txState = {
          reqId,
          chainId,
          cts: new Date().getTime(),
          statusText: TX_PENDING,
          txHash: null,
        };

        // start send raw transaction
        web3js.eth
          .sendSignedTransaction(rawData)
          .once('transactionHash', async (txHash) => {
            txState.txHash = txHash;
            await that.$store.dispatch('web3/addTxState', txState);

            //send
            whisperer
              .sendSimpleMessage(API_RT_ADDORUP_TX_STATE, txState)
              .then((respState) => {
                if (respState && respState.chainTxs) {
                  that.$store.dispatch('web3/updateChainTxs', respState.chainTxs);
                }
              })
              .catch((err) => {
                console.log(err);
              });

            tradingText = `Approved Tx [ ${txHash} ] appending...`;
            that.updateTradingText(tradingText);
            //that.$toast(`Approved Tx [ ${txHash} ] appending...`, 'signed', 6000)
          })
          .on('error', async (err, receipt) => {
            let errTxState = txState;

            if (receipt) {
              // update ui store
              errTxState = { ...txState, ...receipt };
            }

            errTxState.statusText = TX_FAILED;
            await that.$store.dispatch('web3/addOrUpdateChainTxState', errTxState);
            //send to back
            whisperer
              .sendSimpleMessage(API_RT_ADDORUP_TX_STATE, errTxState)
              .then((respState) => {
                if (respState && respState.chainTxs) {
                  that.$store.dispatch('web3/updateChainTxs', respState.chainTxs);
                }
              })
              .catch((err) => {
                console.log(err);
              });

            that.stopLoading();
            that.$toast(`Approved Failed.`, 'fail', 6000);
          })
          .then(async (receipt) => {
            const _status = receipt.status;
            let _retTxState = {
              ...txState,
              ...receipt,
              statusText: _status ? TX_CONFIRMED : TX_FAILED,
            };

            await that.$store.dispatch('web3/addOrUpdateChainTxState', _retTxState);
            that.$toast(`Approved Success.`, 'success', 4000);

            //send
            whisperer
              .sendSimpleMessage(API_RT_ADDORUP_TX_STATE, _retTxState)
              .then((respState) => {
                if (respState && respState.chainTxs) {
                  that.$store.dispatch('web3/updateChainTxs', respState.chainTxs);
                }
              })
              .catch((err) => {
                console.log(err);
              });
            that.stopLoading();
          });
      } catch (err) {
        let message = 'Approved Failed.';
        that.stopLoading();
        if (err.code === INTERNAL_ERROR) {
          console.warn(err.message);
        } else {
          message = err.message;
        }
        this.$toast(message, 'fail', 8000);
      }
    },
    async rechargeHandler() {
      const text =
        'web3.js is a collection of libraries that allow you to interact with a local or remote' +
        ' ethereum node using HTTP, IPC or WebSocket. The following documentation will guide you through installing and running web3.js as well as providing an API reference documentation with examples.';
      this.startLoading(text);
    },
  },
};
</script>
<style>
.member-status-item > div.v-list-item__title {
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
}

.flex-item-left {
  display: flex;
  align-content: flex-start;
  flex: 1 0 35%;
}

.flex-item-end {
  display: flex;
  justify-content: flex-end;
  flex: 1 0 55%;
}

.flex-item-recharge {
  display: flex;
  justify-content: flex-end;
  flex: 1 0 30%;
}

.trading-mask {
  width: 100%;
  display: flex;
}

.trading-mask .trading-mask--inner {
  width: calc(100% -30px);
  display: flex;
  justify-content: center;
  flex: 1 1 auto;
  flex-direction: column;
}

.trading-row {
  flex: 1 0 auto;
  padding: 12px 16px;
  justify-content: center;
  align-self: center;
  word-break: break-all;
}
</style>
