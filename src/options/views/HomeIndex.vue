<template>
  <v-container class="text-center">
    <h4>Auto Locked</h4>
    <v-row justify="center">
      <v-col cols="11">
        <v-radio-group v-model="autoLocked" column>
          <v-radio label="永久" value="-1"></v-radio>
          <v-radio label="5 Minutes" value="5"></v-radio>
          <v-radio label="15 Minutes" value="15"></v-radio>
          <v-radio label="30 Minutes" value="30"></v-radio>
          <v-radio label="1 Hour" value="60"></v-radio>
          <v-radio label="1 Day" value="720"></v-radio>
        </v-radio-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'HomeIndex',
  data() {
    return {
      autoLocked: '-1',
    };
  },
};
</script>
<style></style>
