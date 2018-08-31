//
// Copyright (c) 2018 by SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the LICENSE file
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict'

var pty = require('node-pty')

const terminals = {}
const logs = {}

exports.create = async function ({cols, rows}) {
  const term = pty.spawn('kubectl', [
    'exec',
    'gardener-dashboard-544648fb4c-58gk4',
    '-it',
    '-n',
    'garden',
    '--',
    'sh'
  ], {
    name: 'xterm-color',
    cols: cols || 80,
    rows: rows || 24,
    cwd: process.env.PWD,
    env: process.env
  })

  console.log('Created terminal with PID: ' + term.pid)
  terminals[term.pid] = term
  logs[term.pid] = ''
  term.on('data', function (data) {
    logs[term.pid] += data
  })
  return term.pid.toString()
}

exports.resize = async function ({pid, cols, rows}) {
  const term = terminals[pid]

  term.resize(cols, rows)
  console.log('Resized terminal ' + pid + ' to ' + cols + ' cols and ' + rows + ' rows.')
}

exports.terminals = terminals
exports.terminalLogs = logs
