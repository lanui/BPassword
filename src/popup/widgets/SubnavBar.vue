<template>
  <v-system-bar
    light
    :color="navColor"
    :height="40"
    :lights-out="false"
    :window="true"
    class="subnav-bar"
  >
    <v-btn @click="navbackHandle" icon small class="mx-1">
      <v-icon>
        {{ icons.ARROW_LEFT_MDI }}
      </v-icon>
    </v-btn>
    <div class="subnav-title">
      {{ title }}
    </div>
    <v-btn v-if="Boolean(hasDelete)" @click="navDelHandle" fab icon small>
      <v-icon>{{ icons.ITEM_DEL_MDI }}</v-icon>
    </v-btn>
  </v-system-bar>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  name: 'SubnavBar',
  computed: {
    ...mapGetters('ui', ['icons']),
  },
  data() {
    return {};
  },
  methods: {
    navbackHandle() {
      if (typeof this.gobackCall === 'function') {
        this.gobackCall();
      }
    },
    navDelHandle() {
      if (this.hasDelete) {
        this.$emit('del-event');
      }
    },
  },
  props: {
    gobackCall: {
      type: Function,
      default: () => {
        this.$router.go(-1);
      },
      required: false,
    },
    navColor: {
      default: '#FFFFFF',
      type: String,
      required: false,
    },
    hasDelete: {
      type: [String, Boolean],
      default: false,
      required: false,
    },
    title: {
      type: String,
      default: '',
      required: false,
    },
    deleteCallback: {
      type: Function,
      default: () => {},
      required: false,
    },
  },
};
</script>
<style>
.subnav-bar {
  display: flex;
  flex: 1 1 100%;
  border-bottom-color: rgba(243, 244, 246, 1);
  border-bottom: 1px solid #f3f4f6 !important;
}
.subnav-title {
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  justify-content: center;
  font-size: 14px;
  color: #19191d;
}
</style>
