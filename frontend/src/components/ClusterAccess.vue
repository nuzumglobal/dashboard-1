<!--
Copyright 2018 by The Gardener Authors.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
-->

<template>
  <v-list>

    <v-list-tile>
      <v-list-tile-action>
        <v-icon class="cyan--text text--darken-2">developer_board</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-sub-title>Dashboard</v-list-tile-sub-title>
        <v-list-tile-title><a :href="dashboardUrl" target="_blank">{{dashboardUrlText}}</a></v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-action>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-sub-title>Grafana</v-list-tile-sub-title>
        <v-list-tile-title><a :href="grafanaUrl" target="_blank">{{grafanaUrlText}}</a></v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-action>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-sub-title>Prometheus</v-list-tile-sub-title>
        <v-list-tile-title><a :href="prometheusUrl" target="_blank">{{prometheusUrlText}}</a></v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-action>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-sub-title>Alertmanager</v-list-tile-sub-title>
        <v-list-tile-title><a :href="alertmanagerUrl" target="_blank">{{alertmanagerUrlText}}</a></v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-divider class="my-2" inset></v-divider>

    <v-list-tile>
      <v-list-tile-action>
        <v-icon class="cyan--text text--darken-2">perm_identity</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-sub-title>User</v-list-tile-sub-title>
        <v-list-tile-title>{{username}}</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>
    <v-list-tile>
      <v-list-tile-action>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-sub-title>Password</v-list-tile-sub-title>
        <v-list-tile-title ref="password">{{passwordText}}</v-list-tile-title>
        <v-snackbar :bottom="true" v-model="snackbar" :success="true" :absolute="true" :timeout.number="2000">
          Copied to clipboard!
        </v-snackbar>
      </v-list-tile-content>
      <v-btn v-show="showPassword" icon ref="copy" title="copy to clipboard">
        <v-icon>content_copy</v-icon>
      </v-btn>
      <v-btn icon :title="passwordVisibilityTitle" @click.native.stop="showPassword = !showPassword">
        <v-icon>{{visibilityIcon}}</v-icon>
      </v-btn>
    </v-list-tile>

  </v-list>
</template>



<script>
  import Clipboard from 'clipboard'

  export default {
    name: 'shoot-list',
    components: {
      Clipboard
    },
    props: {
      info: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        snackbar: false,
        showPassword: false
      }
    },
    methods: {
      enableCopy () {
        const pwdClipboard = new Clipboard(this.$refs.copy.$el, {
          target: () => this.$refs.password
        })
        pwdClipboard.on('success', (event) => {
          this.snackbar = true
        })
      }
    },
    computed: {
      grafanaUrl () {
        return this.info.grafanaUrl || ''
      },
      grafanaUrlText () {
        return this.info.grafanaUrlText || ''
      },
      prometheusUrl () {
        return this.info.prometheusUrl || ''
      },
      prometheusUrlText () {
        return this.info.prometheusUrlText || ''
      },
      alertmanagerUrl () {
        return this.info.alertmanagerUrl || ''
      },
      alertmanagerUrlText () {
        return this.info.alertmanagerUrlText || ''
      },
      dashboardUrl () {
        return this.info.dashboardUrl || ''
      },
      dashboardUrlText () {
        return this.info.dashboardUrlText || ''
      },
      username () {
        return this.info.username || ''
      },
      password () {
        return this.info.password || ''
      },
      passwordText () {
        if (this.showPassword) {
          return this.password
        } else {
          return '****************'
        }
      },
      passwordVisibilityTitle () {
        if (this.showPassword) {
          return 'Hide password'
        } else {
          return 'Show password'
        }
      },
      visibilityIcon () {
        if (this.showPassword) {
          return 'visibility_off'
        } else {
          return 'visibility'
        }
      }
    },
    mounted () {
      this.enableCopy()
    }
  }
</script>