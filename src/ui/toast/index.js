import vue from 'vue';

import CustomToast from './CustToast';

const ToastConstructor = vue.extend(CustomToast);
/**
 *
 * @param {string} message
 * @param {string} type [normal(default),message,success,signed,fail,warn]
 * @param {number} duration
 */
function showToast(message, type = 'normal', duration = 5000) {
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
