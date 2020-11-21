<template>
  <v-container>
    <v-row class="text-center">
      <v-col cols="12">
        <logo size="48" />
      </v-col>
      <v-col cols="12">
        <h3 class="text-h5">
          <div>{{ $t('p.welcome.title') }}</div>
          <div>{{ $t('p.welcome.subtitle') }}</div>
        </h3>
      </v-col>
    </v-row>
    <v-row justify="center" class="text-center">
      <v-col cols="8">
        <v-btn block rounded @click="goSignUp" color="primary" class="mt-6 mb-0">
          {{ $t('btn.createWallet') }}
        </v-btn>
        <div class="or-label my-2">or</div>
        <v-btn block rounded outlined @click="goImport" color="primary" class="mt-0 mb-6">
          {{ $t('btn.importWallet') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Logo from '@/ui/widgets/Logo';
export default {
  name: 'Welcome',
  components: {
    Logo,
  },
  data() {
    return {};
  },
  methods: {
    goSignUp() {
      this.$router.push({ path: '/signup' });
    },
    goImport() {
      this.$router.push({ path: '/import_new' });
    },
    goIndex() {
      this.$router.push({ path: '/index' });
    },
  },
};
</script>
<style></style>
