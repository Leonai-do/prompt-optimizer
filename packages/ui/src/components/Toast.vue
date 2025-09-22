<!-- Toast component - based on Naive UI NMessageProvider -->
<template>
  <!-- Naive UI message provider component -->
  <NMessageProvider placement="top-right" container-style="position: fixed; top: 20px; right: 20px;">
    <MessageApiInitializer />
    <slot />
  </NMessageProvider>
</template>

<script setup lang="ts">
import { NMessageProvider, useMessage } from 'naive-ui'
import { onMounted, defineComponent, h } from 'vue'
import { setGlobalMessageApi } from '../composables/useToast'

// Internal component to initialize message API in the correct context
const MessageApiInitializer = defineComponent({
  name: 'MessageApiInitializer',
  setup() {
    onMounted(() => {
      try {
        const messageApi = useMessage()
        setGlobalMessageApi(messageApi)
      } catch (error) {
        console.error('[Toast] Failed to initialize message API:', error)
      }
    })
    return () => h('div', { style: { display: 'none' } })
  }
})
</script>