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
    <v-row justify="center" class="px-0">
      <v-col cols="10">
        <v-btn block color="primary" small> 充值 </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import SubnavBar from '@/popup/widgets/SubnavBar.vue';
export default {
  name: 'RechargeMembership',
  components: {
    SubnavBar,
  },
  computed: {
    ...mapGetters('web3', ['getMembershipExpired', 'membershipCostBTsPerYear']),
    expiredText() {
      let text = this.getMembershipExpired;
      return !text ? this.$t('l.nonMember') : text;
    },
  },
  data() {
    return {};
  },
  methods: {
    gobackHandle() {
      this.$router.go(-1);
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
</style>
