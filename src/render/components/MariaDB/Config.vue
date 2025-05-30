<template>
  <Conf
    ref="conf"
    :type-flag="'mariadb'"
    :default-conf="defaultConf"
    :file="file"
    :file-ext="'cnf'"
    :show-commond="true"
    @on-type-change="onTypeChange"
  >
    <template #common>
      <Common :setting="commonSetting" />
    </template>
  </Conf>
</template>

<script lang="ts" setup>
  import { computed, ref, watch, Ref, reactive } from 'vue'
  import Conf from '@/components/Conf/index.vue'
  import Common from '@/components/Conf/common.vue'
  import type { CommonSetItem } from '@/components/Conf/setup'
  import { I18nT } from '@lang/index'
  import { debounce } from 'lodash'
  import { AppStore } from '@/store/app'
  import { uuid } from '@shared/utils'

  const { join } = require('path')

  const appStore = AppStore()
  const conf = ref()
  const commonSetting: Ref<CommonSetItem[]> = ref([])

  const currentVersion = computed(() => {
    return appStore.config?.server?.mariadb?.current?.version
  })

  const vm = computed(() => {
    return currentVersion?.value?.split('.')?.slice(0, 2)?.join('.')
  })

  const file = computed(() => {
    if (!vm.value) {
      return ''
    }
    return join(global.Server.MariaDBDir, `my-${vm.value}.cnf`)
  })

  const defaultConf = computed(() => {
    if (!vm.value) {
      return ''
    }
    const dataDir = join(global.Server.MariaDBDir, `data-${vm.value}`)
    return `[mariadbd]
# Only allow connections from localhost
bind-address = 127.0.0.1
sql-mode=NO_ENGINE_SUBSTITUTION
datadir=${dataDir}`
  })

  const names: CommonSetItem[] = [
    {
      name: 'port',
      value: '3306',
      enable: true,
      tips() {
        return I18nT('mysql.port')
      }
    },
    {
      name: 'key_buffer_size',
      value: '64M',
      enable: true,
      tips() {
        return I18nT('mysql.key_buffer_size')
      }
    },
    {
      name: 'query_cache_size',
      value: '32M',
      enable: true,
      // show: vm?.value?.startsWith('5.'),
      tips() {
        return I18nT('mysql.query_cache_size')
      }
    },
    {
      name: 'tmp_table_size',
      value: '64M',
      enable: true,
      tips() {
        return I18nT('mysql.tmp_table_size')
      }
    },
    {
      name: 'innodb_buffer_pool_size',
      value: '256M',
      enable: true,
      tips() {
        return I18nT('mysql.innodb_buffer_pool_size')
      }
    },
    {
      name: 'innodb_log_buffer_size',
      value: '32M',
      enable: true,
      tips() {
        return I18nT('mysql.innodb_log_buffer_size')
      }
    },
    {
      name: 'sort_buffer_size',
      value: '1M',
      enable: true,
      tips() {
        return I18nT('mysql.sort_buffer_size')
      }
    },
    {
      name: 'read_buffer_size',
      value: '1M',
      enable: true,
      tips() {
        return I18nT('mysql.read_buffer_size')
      }
    },
    {
      name: 'read_rnd_buffer_size',
      value: '256K',
      enable: true,
      tips() {
        return I18nT('mysql.read_rnd_buffer_size')
      }
    },
    {
      name: 'thread_cache_size',
      value: '32',
      enable: true,
      tips() {
        return I18nT('mysql.thread_cache_size')
      }
    },
    {
      name: 'table_open_cache',
      value: '256',
      enable: true,
      tips() {
        return I18nT('mysql.table_open_cache')
      }
    },
    {
      name: 'max_connections',
      value: '500',
      enable: true,
      tips() {
        return I18nT('mysql.max_connections')
      }
    }
  ]
  let editConfig = ''
  let watcher: any

  const onSettingUpdate = () => {
    let config = editConfig.replace(/\r\n/gm, '\n')
    const list = ['#PhpWebStudy-Conf-Common-Begin#']
    commonSetting.value.forEach((item) => {
      const regex = new RegExp(`^[\\s\\n#]?([\\s#]*?)${item.name}\\s+(.*?)([^\\n])(\\n|$)`, 'gm')
      config = config.replace(regex, `\n\n`)
      if (item.enable) {
        list.push(`${item.name} = ${item.value}`)
      }
    })
    list.push('#PhpWebStudy-Conf-Common-END#')
    config = config
      .replace(
        /([\s\n]?[^\n]*)#PhpWebStudy-Conf-Common-Begin#([\s\S]*?)#PhpWebStudy-Conf-Common-END#/g,
        ''
      )
      .replace(/\n+/g, '\n\n')
      .trim()
    if (config.includes('[mariadbd]')) {
      config = config.replace(/\[mariadbd](.*?)\n/g, `[mariadbd]\n${list.join('\n')}\n`)
    } else {
      config = `[mariadbd]\n${list.join('\n')}\n` + config
    }
    conf.value.setEditValue(config)
    editConfig = config
  }

  const getCommonSetting = () => {
    if (watcher) {
      watcher()
    }
    let config = editConfig.replace(/\r\n/gm, '\n')
    const arr = [...names]
      .map((item) => {
        const regex = new RegExp(
          `^[\\s\\n]?((?!#)([\\s]*?))${item.name}\\s+(.*?)([^\\n])(\\n|$)`,
          'gm'
        )
        const matchs =
          config.match(regex)?.map((s) => {
            const sarr = s
              .trim()
              .split('=')
              .filter((s) => !!s.trim())
              .map((s) => s.trim())
            const k = sarr.shift()
            const v = sarr.join(' ').replace(';', '').replace('=', '').trim()
            return {
              k,
              v
            }
          }) ?? []
        console.log('getCommonSetting: ', matchs, item.name)
        const find = matchs?.find((m) => m.k === item.name)
        item.enable = !!find
        item.value = find?.v ?? item.value
        item.key = uuid()
        return item
      })
      .filter((item) => item.show !== false)
    commonSetting.value = reactive(arr) as any
    watcher = watch(commonSetting, debounce(onSettingUpdate, 500), {
      deep: true
    })
  }

  const onTypeChange = (type: 'default' | 'common', config: string) => {
    console.log('onTypeChange: ', type, config)
    if (editConfig !== config) {
      editConfig = config
      getCommonSetting()
    }
  }
</script>
