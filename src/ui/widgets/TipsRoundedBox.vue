<template>
  <div class="lany-rounded-box" :style="styleText">
    <div class="lany-rounded-content">
      {{ text }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'LanyRoundedBox',
  computed: {
    styleText() {
      return !!this.background ? this.background : '';
    },
  },
  props: {
    text: {
      default: '',
      type: [String],
      required: false,
    },
    background: {
      default: 'rgba(151, 151, 151, .2)',
      type: [String],
      required: false,
    },
  },
};
</script>
<style>
.lany-rounded-box {
  display: flex;
  width: 100%;
  flex-direction: row;
  padding: 0.75rem 0.5rem;
  margin: 0;
  background: rgba(151, 151, 151, 0.2);
  border-radius: 1rem;
  border: 1px solid #979797;
  color: rgba(79, 82, 110, 1);
}

.lany-rounded-content {
  flex: 1 1 auto;
  word-wrap: break-word;
  word-break: break-all;
}
</style>
