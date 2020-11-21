<template>
  <v-avatar tile icon :size="size + 'px'">
    <img :src="logo" />
  </v-avatar>
</template>

<script>
import Logo128 from '@ui/assets/icons/logo_128.png';

export default {
  name: 'logo',
  data() {
    return {
      logo: Logo128,
    };
  },
  props: {
    size: {
      type: [String, Number],
      default: 32,
      required: false,
    },
  },
};
</script>
<style></style>
