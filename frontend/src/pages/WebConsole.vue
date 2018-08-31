<!--
Copyright (c) 2018 by SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the LICENSE file

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
  <div>
    <div>
      <v-btn v-if="terminalVisible"
       @click="closeConsole"
       floating
       fab
       right
       absolute
       small
       class="close_button"
       color="cyan darken-2"
       dark>
        <v-icon>close</v-icon>
      </v-btn>
      <alert color="error" :message.sync="errorMessage" :detailedMessage.sync="detailedErrorMessage"></alert>
      <div ref="terminal" class="terminal"></div>
    </div>
    <v-container fluid grid-list-lg v-if="!terminalVisible">
      <v-layout d-flex wrap row>
        <v-flex md3>
          <v-card class="cyan darken-2">
            <v-card-title class="subheading white--text">
              Shoot Landscape Access
            </v-card-title>
            <v-list>
              <v-list-tile>
                <v-list-tile-action>
                  <v-btn block flat class="action-button cyan--text text--darken-2" @click="openConsole">
                    <v-icon left>mdi-console</v-icon>
                    Garden Console
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile v-if="shootSelected">
                <v-list-tile-action>
                  <v-btn block flat class="action-button cyan--text text--darken-2">
                    <v-icon left>mdi-console</v-icon>
                    Shoot Console
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-flex>
        <v-flex md3>
          <v-card class="cyan darken-2" v-if="shootSelected">
            <v-card-title class="subheading white--text">
              Seed Landscape Access
            </v-card-title>
            <v-list>
              <v-list-tile>
                <v-list-tile-action>
                  <v-btn block flat class="action-button cyan--text text--darken-2">
                    <v-icon left>mdi-console</v-icon>
                    Seed Console
                  </v-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
  import get from 'lodash/get'

  import { createTerminal, resizeTerminal } from '@/utils/api'
  import EmitterWrapper from '@/utils/Emitter'
  import Alert from '@/components/Alert'
  import { mapState } from 'vuex'

  import { Terminal } from 'xterm'
  import * as fullscreen from 'xterm/lib/addons/fullscreen/fullscreen'
  import * as attach from 'xterm/lib/addons/attach/attach'
  import 'xterm/dist/xterm.css'
  Terminal.applyAddon(fullscreen)

  export default {
    name: 'web-console',
    components: {
      Alert
    },
    computed: {
      ...mapState([
        'user'
      ]),
      shootSelected () {
        return this.namespace && this.shootName
      },
      namespace () {
        return get(this.$route.params, 'namespace')
      },
      shootName () {
        return get(this.$route.params, 'name')
      },
      terminalVisible () {
        return this.terminal
      }
    },
    data () {
      return {
        terminal: undefined,
        backendTerminalPid: undefined,
        errorMessage: undefined,
        detailedErrorMessage: undefined
      }
    },
    methods: {
      openConsole () {
        this.terminal = new Terminal()
        this.terminal.on('resize', function (size) {
          if (!this.backendTerminalPid) {
            return
          }
          resizeTerminal({user: this.user, pid: this.backendTerminalPid, cols: size.cols, rows: size.rows})
        })

        createTerminal({user: this.user, cols: this.terminal.cols, rows: this.terminal.rows})
          .then(res => {
            this.backendTerminalPid = res.data
            EmitterWrapper.terminalEmitter.subscribeTerminal({term: this.terminal, pid: this.backendTerminalPid})

            this.terminal.open(this.$refs.terminal)
            this.terminal.toggleFullScreen()

            this.terminal.on('data', function(data) {
              EmitterWrapper.terminalEmitter.emitMessage({message: data})
            })
          })
          .catch(error => {
            this.errorMessage = 'Could not spawn a terminal process on the backend'
            this.detailedErrorMessage = error.message

            this.closeConsole()
          })
      },
      closeConsole () {
        this.terminal = undefined
        this.$refs.terminal.innerHTML = ''

        EmitterWrapper.terminalEmitter.unsubscribe()
      }
    },
    beforeRouteLeave (to, from, next) {
      this.closeConsole()
      next()
    },
  }
</script>

<style lang="styl" scoped>

.close_button {
  margin-top: 10px;
}

</style>