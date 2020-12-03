<template>
  <div class="bpassword-icon-wrap">
    <img :src="iconBText" />
    <div class="icon-text">{{ text }}</div>
  </div>
</template>

<script>
import IconBText from '@/ui/assets/icons/icon-b-text.png';
export default {
  name: 'BPassIcon',
  data() {
    return {
      iconBText: IconBText,
      text: 'Password',
    };
  },
};
</script>
<style lang="css" scope>
.bpassword-icon-wrap {
  display: flex;
  align-items: flex-end;
  color: #abadaf;
  font-size: 14px;
  font-family: PingFangSC-Regular, PingFang SC;
  font-weight: 400;
  line-height: 16px;
  vertical-align: bottom;
}

.bpassword-icon-wrap .icon-text {
  height: 100%;
  bottom: 0;
  margin-bottom: -2px;
}
</style>
