<template>
  <transition name="message-fade">
    <div class="message" :class="typeClass" role="atert" v-show="visible">
      <div class="message__content">
        <v-icon :class="color" small> {{ icon }} </v-icon>&nbsp;{{ message }}
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'MessageBox',
  data() {
    return {
      visible: false,
      duration: 4000,
      message: '',
      timer: null,
      closed: false,
      color: '',
      icon: '',
      typeClass: '',
    };
  },
  methods: {
    destroyElement() {
      this.$el;
    },
  },
};
</script>
<style></style>
