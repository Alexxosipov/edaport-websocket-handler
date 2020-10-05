import '../scss/app.scss';

import Vue from 'vue';
import Main from './components/Main.vue';

new Vue({
  el: '#app',
  components: { Main },
  template: '<Main/>',
});
