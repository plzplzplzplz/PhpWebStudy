<template>
  <div class="setup-common editor-config">
    <div class="main proxy-set">
      <el-form label-width="130px" label-position="left" @submit.prevent>
        <el-form-item :label="$t('base.theme')">
          <el-radio-group v-model="editorConfig.theme">
            <el-radio-button label="vs-dark" />
            <el-radio-button label="vs-light" />
            <el-radio-button label="hc-black" />
            <el-radio-button label="hc-light" />
            <el-radio-button label="auto">{{ $t('util.auto') }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('util.fontSize')">
          <el-input v-model.number="editorConfig.fontSize" type="number"></el-input>
        </el-form-item>
        <el-form-item :label="$t('util.lineHeight')">
          <el-input v-model.number="editorConfig.lineHeight" type="number"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div ref="wapper" class="editor-wapper"></div>
  </div>
</template>

<script lang="ts" setup>
  import { AppStore } from '@/store/app'
  import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import { editor } from 'monaco-editor/esm/vs/editor/editor.api.js'
  import { EditorConfigMap } from '@/components/Setup/EditorConfig/store'
  import { EditorCreate } from '@/util/Editor'

  const { readFile } = require('fs-extra')
  const { join } = require('path')
  const { nativeTheme } = require('@electron/remote')

  const wapper = ref()
  const appStore = AppStore()
  const editorConfig = computed({
    get() {
      return appStore.editorConfig
    },
    set() {}
  })
  let monacoInstance: editor.IStandaloneCodeEditor | null = null

  const index = ref(1)

  const currentTheme = computed(() => {
    if (index.value < 0) {
      return 'vs-light'
    }
    let theme = editorConfig.value.theme
    if (theme === 'auto') {
      let appTheme = appStore?.config?.setup?.theme
      if (!appTheme || appTheme === 'system') {
        appTheme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light'
      }
      if (appTheme === 'light') {
        theme = 'vs-light'
      } else {
        theme = 'vs-dark'
      }
    }
    return theme
  })

  const initEditor = () => {
    monacoInstance = EditorCreate(wapper.value, {
      value: EditorConfigMap.text,
      language: 'ini',
      scrollBeyondLastLine: false,
      overviewRulerBorder: true,
      automaticLayout: true,
      theme: currentTheme.value,
      fontSize: editorConfig.value.fontSize,
      lineHeight: editorConfig.value.lineHeight
    })
  }

  onMounted(() => {
    if (!EditorConfigMap.text) {
      readFile(join(global.Server.Static, 'tmpl/httpd.conf'), 'utf-8').then((text: string) => {
        EditorConfigMap.text = text
        initEditor()
      })
    } else {
      initEditor()
    }
  })

  onUnmounted(() => {
    monacoInstance?.dispose()
    monacoInstance = null
  })

  watch(
    editorConfig,
    () => {
      monacoInstance?.updateOptions({
        theme: currentTheme.value,
        fontSize: editorConfig.value.fontSize,
        lineHeight: editorConfig.value.lineHeight
      })
      appStore.saveConfig()
    },
    {
      deep: true
    }
  )

  const onNativeThemeUpdate = () => {
    index.value += 1
    nextTick().then(() => {
      monacoInstance?.updateOptions({
        theme: currentTheme.value,
        fontSize: editorConfig.value.fontSize,
        lineHeight: editorConfig.value.lineHeight
      })
    })
  }

  nativeTheme.on('updated', onNativeThemeUpdate)

  onUnmounted(() => {
    console.log('EditorConfig onUnmounted !!!')
    nativeTheme.removeListener('updated', onNativeThemeUpdate)
  })
</script>
