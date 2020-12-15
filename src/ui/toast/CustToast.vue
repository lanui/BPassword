<template>
  <div class="CustToast cust-toast" :class="'toast-' + type" v-if="showToast">
    <div class="toast-icon">
      <div class="icon">
        <img :src="iconSrc" />
      </div>
    </div>
    <div class="toast-content">
      {{ message }}
    </div>
  </div>
</template>
<script>
import messageIcon from '@ui/assets/icons/tips.svg';
import successIcon from '@ui/assets/icons/success.svg';
import failIcon from '@ui/assets/icons/fail.svg';
import warnIcon from '@ui/assets/icons/warning.svg';
import signedIcon from '@ui/assets/icons/signed.svg';
export default {
  name: 'CustToast',
  computed: {
    iconSrc() {
      const type = this.type;
      switch (type) {
        case 'success':
          return this.icons.success;
        case 'warn':
          return this.icons.warn;
        case 'fail':
          return this.icons.fail;
        case 'signed':
          return this.icons.signed;
        default:
          return this.icons.message;
      }
    },
  },
  data() {
    return {
      icons: {
        message: messageIcon,
        fail: failIcon,
        warn: warnIcon,
        success: successIcon,
        signed: signedIcon,
      },
      showToast: true,
      type: 'normal',
      message: '',
      duration: 5000,
    };
  },
};
</script>
<style scoped>
.cust-toast {
  position: fixed;
  min-width: calc(100% - 77px);
  max-width: calc(100% - 37px);
  left: 50%;
  top: 50%;
  background: rgb(233, 233, 235);
  padding: 8px;
  border-radius: 5px;
  transform: translate(-50%, -50%);
  animation: show-toast 0.2s;
  color: #909399;
  overflow: hidden;
  display: flex;
  align-items: center;
}

@keyframes show-toast {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.icon img {
  width: 20px;
  height: 20px;
  margin-top: 3px;
  margin-right: 4px;
}
.cust-toast > div {
  display: flex;
  align-items: center;
}

.toast-icon {
  flex: 0 0 30px;
  justify-content: center;
  align-items: center;
}

div.toast-content {
  flex: 1 1 auto;
  justify-self: start;
  align-items: center;
}

div.toast-message {
  color: white;
  background: linear-gradient(217deg, #7917d3 0%, #0362c3 100%);
}

.toast-success {
  color: rgba(0, 202, 155, 1);
  background: rgba(0, 202, 155, 0.3);
}

.toast-warn {
  color: #e6a23c;
  background: rgb(250, 236, 216);
}

.toast-fail {
  color: #f56c6c;
  background: rgb(253, 226, 226);
}

.toast-signed {
  color: #515151;
  background: rgb(246, 246, 246);
}
</style>
