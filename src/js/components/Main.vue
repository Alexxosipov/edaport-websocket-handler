<template>

    <div class="container mx-auto px-3">
        <div class="mt-5 text-xs">
            <div v-if="echo">
                <div class="flex justify-between -mx-3">
                    <div class="w-1/2 px-3">
                        <h2 class="mt-3 text-lg text-gray-800">Subscribe on channel</h2>
                        <div class="mt-3 flex">
                            <div>
                                <label class="text-sm mb-2 block">Channel name</label>
                                <input class="border border-gray-300 px-2 py-1 w-64" type="text" v-model="channel_subscribe_form.channel">
                            </div>
                            <div class="ml-3">
                                <label class="text-sm mb-2 block">Is channel private?</label>
                                <input type="checkbox" v-model="channel_subscribe_form.is_private">
                            </div>
                        </div>
                        <div class="mt-3">
                            <div>
                                <label class="text-sm mb-2 block">Add event</label>
                                <input class="border border-gray-300 px-2 py-1 w-64" type="text" v-model="channel_subscribe_form.event_name">
                                <a href="#" class="py-1 px-2 mt-3 bg-blue-200 text-blue-800 text-xs rounded-lg inline-block" @click.prevent="addEvent">More</a>
                            </div>
                        </div>
                        <div class="mt-3" v-if="channel_subscribe_form.events.length">
                            <p class="text-lg text-gray-800">Listening events:</p>
                            <p v-for="(event, key) in channel_subscribe_form.events">{{event}}</p>
                        </div>
                        <a href="#" class="py-2 px-3 mt-3 bg-green-200 text-green-800 text-lg rounded-lg inline-block" @click.prevent="listenChannel">Listen this channel</a>
                    </div>
                    <div class="w-1/2 px-3">
                        <h2 class="mt-3 text-lg text-gray-800">Subscribed channels</h2>
                        <div v-for="(channel, key) in channels" :key="key" class="text-xs mt-3">
                            <p class="font-semibold">Channel {{channel.name}}</p>
                            <p class="font-semibold">Events: <span class="font-light" v-for="event in channel.events">{{event}}, </span></p>
                        </div>
                    </div>
                </div>
                <div class="mt-6">
                    <h2 class="text-lg font-semibold text-gray-800">Messages</h2>
                    <table class="mt-3">
                        <tr v-for="(event, index) in eventBag" :key="index">
                            <td class="px-3 py-1 h-16 overflow-x-scroll">{{event.event}}</td>
                            <td class="px-3 py-1 h-16 overflow-x-scroll">
                                <vue-json-pretty
                                        :data="event.data">
                                </vue-json-pretty>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>

            <div v-else>
                <div class="mt-5">
                    <label class="text-sm mb-2 block">Key</label>
                    <input class="border border-gray-300 px-2 py-1 w-64" type="text" v-model="connection.key">
                </div>
                <div class="mt-5">
                    <label class="text-sm mb-2 block">Host</label>
                    <input class="border border-gray-300 px-2 py-1 w-64" type="text" v-model="connection.host">
                </div>
                <div class="mt-5">
                    <label class="text-sm mb-2 block">Port</label>
                    <input class="border border-gray-300 px-2 py-1 w-64" type="text" v-model="connection.port">
                </div>
                <div class="mt-5">
                    <label class="text-sm mb-2 block">Token</label>
                    <input class="border border-gray-300 px-2 py-1 w-64" type="text" v-model="connection.token">
                </div>
                <div class="mt-5">
                    <label class="text-sm mb-2 block">User ID</label>
                    <input class="border border-gray-300 px-2 py-1 w-64" type="text" v-model="connection.user_id">
                </div>
                <div class="mt-5">
                    <a href="#" class="py-2 px-6 bg-blue-200 text-blue-800 text-base rounded-lg" @click.prevent="setConnection">Connect</a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import Echo from "laravel-echo";
  import VueJsonPretty from 'vue-json-pretty';

  window.Pusher = require('pusher-js');
  window.Pusher.log = function (message) { window.console.log(message); };

  export default {
    name: 'Main',
    components: { VueJsonPretty },
    data() {
      return {
        connection: {
          key: 'ebff05f3015923c6ccfd',
          host: '127.0.0.1',
          port: 6001,
          authEndpoint: 'http://localhost:8080/api/broadcasting/auth',
          token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3Q6Mjg1OTNcL2FwaVwvYXV0aFwvbG9naW4iLCJpYXQiOjE2MDA4NjMyMTksIm5iZiI6MTYwMDg2MzIxOSwianRpIjoialpGZGlUQk9nWXlLaUhSUSIsInN1YiI6NjEsInBydiI6Ijg3ZTBhZjFlZjlmZDE1ODEyZmRlYzk3MTUzYTE0ZTBiMDQ3NTQ2YWEifQ.4fmetblByjkN6WM17-R5pD8ZMoj_u1t_GR19zZ8xd7Y',
          user_id: 61
        },
        channel_subscribe_form: {
          channel: null,
          is_private: false,
          events: [],
          event_name: null
        },
        channels: [],
        echo: null,
        eventBag: []
      }
    },
    created() {

    },
    methods: {
        setConnection() {
          this.echo = new Echo({
            broadcaster: 'pusher',
            key: this.connection.key,
            wsHost: this.connection.host,
            wsPort: this.connection.port,
            forceTLS: false,
            disableStats: true,
            authEndpoint: this.connection.authEndpoint,
            auth: {
              headers: {
                Authorization: 'Bearer ' + this.connection.token,
              },
            },
          });

          this.echo.private(`user-${this.connection.user_id}`)
            .listen('.orders.status_changed', (event) => {
              this.eventBag.push({
                event: 'user-61',
                data: event
              });
            });

          this.channels.push({
            'name': `user-${this.connection.user_id}`,
            'events': ['.orders.status_changed']
          });
        },
        addEvent() {
          this.channel_subscribe_form.events.push(this.channel_subscribe_form.event_name);
          this.channel_subscribe_form.event_name = null;
        },
        listenChannel() {
          if (!this.channel_subscribe_form.events || !this.channel_subscribe_form.channel) {
            return;
          }
          let channel;
          if (this.channel_subscribe_form.is_private) {
            channel = this.echo.private(this.channel_subscribe_form.channel);
          } else {
            channel = this.echo.channel(this.channel_subscribe_form.channel);
          }

          let events = this.channel_subscribe_form.events;
          if (this.channel_subscribe_form.event_name) {
            events.push(this.channel_subscribe_form.event_name);
            this.channel_subscribe_form.event_name = null;
          }

          for (let event of this.channel_subscribe_form.events) {
            channel.listen(event, (data) => {
              this.eventBag.push({
                event: event,
                data: data
              });
            })
          }

          this.channels.push({
            'name': this.channel_subscribe_form.channel,
            'events': events
          });

          this.channel_subscribe_form.events = [];
          this.channel_subscribe_form.channel = null;
          this.channel_subscribe_form.is_private = false;
        }
    }
  };
</script>

<style scoped>

</style>
