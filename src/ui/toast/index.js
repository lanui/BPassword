import vue from 'vue';

import CustomToast from './CustToast';

const ToastConstructor = vue.extend(CustomToast);

function showToast(message, type = 'normal', duration = 3000) {
  const _toast = new ToastConstructor({
    data() {
      return {
        showToast: true,
        type: type,
        message: message,
        duration: duration,
      };
    },
  });

  let $vm = _toast.$mount().$el;
  document.body.appendChild($vm);

  setTimeout(() => {
    _toast.showToast = false;
  }, duration);
}

showToast.install = (Vue) => {
  Vue.prototype.$toast = showToast;
};

export default showToast;
