<template>
  <el-drawer
    v-model="show"
    :title="null"
    :with-header="false"
    size="460px"
    :destroy-on-close="true"
    @closed="closedFn"
  >
    <template #default>
      <div class="host-edit">
        <div class="nav">
          <div class="left" @click="show = false">
            <yb-icon :svg="import('@/svg/delete.svg?raw')" class="top-back-icon" />
            <span class="ml-15">{{ $t('base.settings') }}</span>
          </div>
          <el-button type="primary" class="shrink0" @click="doSubmit">{{
            $t('base.confirm')
          }}</el-button>
        </div>
        <div class="main-wapper">
          <div class="main">
            <el-form label-position="top" class="site-sucker-setup" @submit.prevent>
              <el-form-item :label="$t('util.savePath')">
                <div class="path-choose w-p100">
                  <input
                    type="text"
                    class="input"
                    :placeholder="$t('util.saveAs')"
                    readonly=""
                    :value="form.dir"
                  />
                  <div class="icon-block" @click="chooseRoot()">
                    <yb-icon
                      :svg="import('@/svg/folder.svg?raw')"
                      class="choose"
                      width="18"
                      height="18"
                    />
                  </div>
                </div>
              </el-form-item>
              <el-form-item :label="$t('util.proxy')">
                <div class="path-choose w-p100">
                  <input
                    v-model.trim="form.proxy"
                    type="text"
                    class="input"
                    placeholder="Example: http://127.0.0.1:1087"
                  />
                </div>
              </el-form-item>
              <el-form-item :label="$t('util.pageLimit')">
                <div class="path-choose w-p100">
                  <input
                    v-model.trim="form.pageLimit"
                    type="text"
                    class="input"
                    :placeholder="$t('util.pageLimitTips')"
                  />
                </div>
              </el-form-item>
              <el-form-item :label="$t('util.LinkExclusion')">
                <textarea
                  v-model.trim="form.excludeLink"
                  type="text"
                  class="input-textarea w-p100"
                  :placeholder="$t('util.LinkExclusionTips')"
                ></textarea>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </template>
  </el-drawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue'
  import { AsyncComponentSetup } from '../../../fn'
  import { SiteSuckerStore } from './store'

  const { show, onClosed, onSubmit, closedFn } = AsyncComponentSetup()

  const form = ref({
    dir: '',
    proxy: '',
    excludeLink: '',
    pageLimit: ''
  })

  const store = SiteSuckerStore()
  store.initSetup().then(() => {
    Object.assign(form.value, store.commonSetup)
  })

  const doSubmit = () => {
    console.log('form.value: ', form.value)
    Object.assign(store.commonSetup, form.value)
    console.log('store.commonSetup: ', store.commonSetup)
    store.save()
    show.value = false
  }

  const chooseRoot = () => {}

  defineExpose({
    show,
    onSubmit,
    onClosed
  })
</script>
