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
    <v-tooltip top>
      <v-btn slot="activator" icon @click="showDialog">
        <v-icon medium>{{icon}}</v-icon>
      </v-btn>
      {{caption}}
    </v-tooltip>
    <confirm-dialog
      :confirm="confirm"
      :confirmButtonText="confirmText"
      v-model="dialog"
      :cancel="hideDialog"
      :ok="updateShootHibernation"
      :errorMessage.sync="hibernationErrorMessage"
      :detailedErrorMessage.sync="hibernationDetailedErrorMessage"
      confirmColor="orange"
      defaultColor="orange"
      >
      <template slot="caption">{{caption}}</template>
      <template slot="affectedObjectName">{{shootName}}</template>
      <template slot="message">
        <template v-if="!isHibernated">
          This will scale the worker nodes of your cluster down to zero.<br /><br />
          Type <b>{{shootName}}</b> below and confirm to hibernate your cluster.<br /><br />
        </template>
        <template v-else>
          This will wake-up your cluster and scale the worker nodes up to their previous count.<br /><br />
        </template>
      </template>
    </confirm-dialog>
  </div>
</template>

<script>
import ConfirmDialog from '@/dialogs/ConfirmDialog'
import { isHibernated } from '@/utils'
import { updateShootHibernation } from '@/utils/api'
import get from 'lodash/get'

export default {
  components: {
    ConfirmDialog
  },
  props: {
    shootItem: {
      type: Object
    }
  },
  data () {
    return {
      dialog: false,
      hibernationErrorMessage: null,
      hibernationDetailedErrorMessage: null,
      enableHibernation: false
    }
  },
  computed: {
    confirmRequired () {
      return !this.isHibernated
    },
    confirm () {
      return this.confirmRequired ? this.shootName : undefined
    },
    confirmText () {
      if (!this.isHibernated) {
        return 'Hibernate'
      } else {
        return 'Wake-up'
      }
    },
    icon () {
      if (!this.isHibernated) {
        return 'mdi-pause-circle-outline'
      } else {
        return 'mdi-play-circle-outline'
      }
    },
    caption () {
      if (!this.isHibernated) {
        return 'Hibernate Cluster'
      } else {
        return 'Wake-up Cluster'
      }
    },
    isHibernated () {
      return isHibernated(get(this.shootItem, 'spec'))
    },
    shootName () {
      return get(this.shootItem, 'metadata.name')
    },
    shootNamespace () {
      return get(this.shootItem, 'metadata.namespace')
    }
  },
  methods: {
    showDialog () {
      this.dialog = true
      this.enableHibernation = !this.isHibernated
    },
    hideDialog () {
      this.dialog = false
      this.hibernationErrorMessage = null
      this.hibernationDetailedErrorMessage = null
    },
    updateShootHibernation () {
      const user = this.$store.state.user
      updateShootHibernation({ namespace: this.shootNamespace, name: this.shootName, user, data: { enabled: this.enableHibernation } })
        .then(() => this.hideDialog())
        .catch((err) => {
          let msg
          if (!this.isHibernated) {
            msg = 'Could not hibernate cluster'
          } else {
            msg = 'Could not wake up cluster from hibernation'
          }
          this.hibernationErrorMessage = msg
          this.hibernationDetailedErrorMessage = err.message
          console.error(msg, err)
        })
    }
  },
  watch: {
    isHibernated (value) {
      // hide dialog if hibernation state changes
      this.hideDialog()
    }
  }
}
</script>
