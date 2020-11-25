<template>
  <v-container class="text-center px-0 py-0">
    <v-row>
      <v-col class="py-2">
        <logo size="32" />
        <div class="my-1 locked-tips">BPassword处于加密状态，请先解锁</div>
      </v-col>
    </v-row>
    <div class="command-wrap pt-1">
      <div class="command-key-tips">解锁快捷键 control+shift+9</div>
    </div>
  </v-container>
</template>

<script>
import logo from '@/ui/widgets/Logo.vue';
export default {
  name: 'GuestIndex',
  components: {
    logo,
  },
};
</script>
<style>
.locked-tips {
  font-size: 14px;
  line-height: 20px;
}
.command-wrap {
  display: flex;
  width: 100%;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  padding: 4px auto 8px;
  justify-content: center;
  align-items: center;
}
.command-key-tips {
  flex: 1 1 auto;
  font-size: 12px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  color: #8c9092;
  line-height: 17px;
  padding: 0.25rem auto 0.75rem;
}
</style>
