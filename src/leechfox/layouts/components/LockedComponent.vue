<template>
  <v-card elevation="0" class="text-center py-1 pt-2">
    <v-row justify="center" class="py-0">
      <v-col cols="10" class="py-0">
        <logo size="24" />
        <div class="my-1 locked-tips">BPassword未解锁，请先解锁</div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import logo from '@/ui/widgets/Logo.vue';
export default {
  name: 'LockedComponent',
  components: {
    logo,
  },
  data() {
    return {};
  },
};
</script>
<style></style>
