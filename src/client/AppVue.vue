<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/template">templateUpload</router-link> |
      <router-link to="/register">register</router-link>
    </div>
    <router-view/>
  </div>
</template>
<script lang="ts">
import { AppTS } from './AppTS';
export default class AppVue extends AppTS {}
</script>
<style lang="less">
@import url("//unpkg.com/element-ui@2.4.11/lib/theme-chalk/index.css");
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
