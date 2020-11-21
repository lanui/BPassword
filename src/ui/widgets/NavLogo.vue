<template>
  <v-avatar tile icon size="32px">
    <img :src="logo" />
  </v-avatar>
</template>

<script>
import Logo128 from '@ui/assets/icons/logo_128.png';

export default {
  name: 'BPasswordLogo',
  data() {
    return {
      logo: Logo128,
    };
  },
  props: {
    size: {
      type: String,
      default: '32px',
    },
  },
};
</script>
<style></style>
