import { defineAsyncComponent } from 'vue'
import type { AppModuleItem } from '@web/core/type'

const module: AppModuleItem = {
  moduleType: 'emailServer',
  typeFlag: 'mailpit',
  label: 'Mailpit',
  icon: import('@/svg/mailpit.svg?raw'),
  index: defineAsyncComponent(() => import('./Index.vue')),
  aside: defineAsyncComponent(() => import('./aside.vue')),
  asideIndex: 13,
  isService: true,
  isTray: true
}
export default module
