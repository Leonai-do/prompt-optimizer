<template>
  <NFlex vertical :style="{ height: '100%' }">
    <!-- Test input area (only shown in system prompt optimization mode) -->
    <div v-if="showTestInput" :style="{ flexShrink: 0 }">
      <TestInputSection
        v-model="testContentProxy"
        :label="t('test.content')"
        :placeholder="t('test.placeholder')"
        :help-text="t('test.simpleMode.help')"
        :disabled="isTestRunning"
        :mode="adaptiveInputMode"
        :size="inputSize"
        :enable-fullscreen="enableFullscreen"
        :style="{ marginBottom: '16px' }"
      />
    </div>
    
    <!-- Control toolbar -->
    <div :style="{ flexShrink: 0 }">
      <TestControlBar
        :model-label="t('test.model')"
        :show-compare-toggle="enableCompareMode"
        :is-compare-mode="props.isCompareMode"
        :primary-action-text="primaryActionText"
        :primary-action-disabled="primaryActionDisabled"
        :primary-action-loading="isTestRunning"
        :layout="adaptiveControlBarLayout"
        :button-size="adaptiveButtonSize"
        @compare-toggle="handleCompareToggle"
        @primary-action="handleTest"
        :style="{ marginBottom: '16px' }"
      >
        <template #model-select>
          <slot name="model-select"></slot>
        </template>
        <template #secondary-controls>
          <slot name="secondary-controls"></slot>
        </template>
        <template #custom-actions>
          <slot name="custom-actions"></slot>
        </template>
      </TestControlBar>
    </div>

    <!-- Test result area -->
    <TestResultSection
      :is-compare-mode="props.isCompareMode && enableCompareMode"
      :vertical-layout="adaptiveResultVerticalLayout"
      :show-original="showOriginalResult"
      :original-title="originalResultTitle"
      :optimized-title="optimizedResultTitle"
      :single-result-title="singleResultTitle"
      :original-result="originalResult"
      :optimized-result="optimizedResult"
      :single-result="singleResult"
      :size="adaptiveButtonSize"
      :style="{ flex: 1, minHeight: 0 }"
    >
      <template #original-result>
        <div class="result-container">
          <!-- Tool call display for original result - moved before main content -->
          <ToolCallDisplay 
            v-if="originalToolCalls.length > 0"
            :tool-calls="originalToolCalls"
            :size="adaptiveButtonSize === 'large' ? 'medium' : 'small'"
            class="tool-calls-section"
          />
          
          <div class="result-body">
            <slot name="original-result"></slot>
          </div>
        </div>
      </template>
      <template #optimized-result>
        <div class="result-container">
          <!-- Tool call display for optimized result - moved before main content -->
          <ToolCallDisplay 
            v-if="optimizedToolCalls.length > 0"
            :tool-calls="optimizedToolCalls"
            :size="adaptiveButtonSize === 'large' ? 'medium' : 'small'"
            class="tool-calls-section"
          />
          
          <div class="result-body">
            <slot name="optimized-result"></slot>
          </div>
        </div>
      </template>
      <template #single-result>
        <div class="result-container">
          <!-- Tool call display for single result - moved before main content (using optimized result data) -->
          <ToolCallDisplay 
            v-if="optimizedToolCalls.length > 0"
            :tool-calls="optimizedToolCalls"
            :size="adaptiveButtonSize === 'large' ? 'medium' : 'small'"
            class="tool-calls-section"
          />
          
          <div class="result-body">
            <slot name="single-result"></slot>
          </div>
        </div>
      </template>
    </TestResultSection>
  </NFlex>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NSpace, NGrid, NFlex } from 'naive-ui'
import type { OptimizationMode, AdvancedTestResult, ToolCallResult } from '@prompt-optimizer/core'
import { useResponsive } from '../composables/useResponsive'
import { usePerformanceMonitor } from '../composables/usePerformanceMonitor'
import { useDebounceThrottle } from '../composables/useDebounceThrottle'
import TestInputSection from './TestInputSection.vue'
import TestControlBar from './TestControlBar.vue'
import TestResultSection from './TestResultSection.vue'
import ToolCallDisplay from './ToolCallDisplay.vue'

const { t } = useI18n()

// Performance monitoring
const {
  recordUpdate,
  getPerformanceReport,
  performanceGrade
} = usePerformanceMonitor('TestAreaPanel')

// Debounce throttle
const { debounce, throttle } = useDebounceThrottle()

// Responsive configuration
const {
  shouldUseVerticalLayout,
  shouldUseCompactMode,
  spaceSize,
  buttonSize,
  inputSize,
  gridConfig
} = useResponsive()

interface Props {
  // Core state
  optimizationMode: OptimizationMode
  isTestRunning?: boolean
  advancedModeEnabled?: boolean

  // Test content
  testContent?: string
  isCompareMode?: boolean

  // Feature switches
  enableCompareMode?: boolean
  enableFullscreen?: boolean

  // Layout configuration
  inputMode?: 'compact' | 'normal'
  controlBarLayout?: 'default' | 'compact' | 'minimal'
  buttonSize?: 'small' | 'medium' | 'large'

  // Result display configuration
  showOriginalResult?: boolean
  resultVerticalLayout?: boolean
  originalResultTitle?: string
  optimizedResultTitle?: string
  singleResultTitle?: string

  // Advanced features: test result data (supports tool call display)
  originalResult?: AdvancedTestResult
  optimizedResult?: AdvancedTestResult
  singleResult?: AdvancedTestResult
}

const props = withDefaults(defineProps<Props>(), {
  isTestRunning: false,
  advancedModeEnabled: false,
  testContent: '',
  isCompareMode: true,
  enableCompareMode: true,
  enableFullscreen: true,
  inputMode: 'normal',
  controlBarLayout: 'default',
  buttonSize: 'medium',
  showOriginalResult: true,
  resultVerticalLayout: false,
  originalResultTitle: '',
  optimizedResultTitle: '',
  singleResultTitle: ''
})

const emit = defineEmits<{
  'update:testContent': [value: string]
  'update:isCompareMode': [value: boolean]
  'test': []
  'compare-toggle': []
  // Advanced feature events
  'open-variable-manager': []
  'open-context-editor': []
  'variable-change': [name: string, value: string]
  'context-change': [messages: any[], variables: Record<string, string>]
  // Tool call events
  'tool-call': [toolCall: ToolCallResult, testType: 'original' | 'optimized']
  'tool-calls-updated': [toolCalls: ToolCallResult[], testType: 'original' | 'optimized']
}>()

// Internal state management - removed debounce to ensure immediate input response
const testContentProxy = computed({
  get: () => props.testContent,
  set: (value: string) => {
    emit('update:testContent', value)
    recordUpdate()
  }
})

// Tool call state management
const originalToolCalls = ref<ToolCallResult[]>([])
const optimizedToolCalls = ref<ToolCallResult[]>([])

// Method to handle tool calls
const handleToolCall = (toolCall: ToolCallResult, testType: 'original' | 'optimized') => {
  if (testType === 'original') {
    originalToolCalls.value.push(toolCall)
  } else {
    optimizedToolCalls.value.push(toolCall)
  }
  
  emit('tool-call', toolCall, testType)
  emit('tool-calls-updated', testType === 'original' ? originalToolCalls.value : optimizedToolCalls.value, testType)
  recordUpdate()
}

// Method to clear tool call data
const clearToolCalls = (testType: 'original' | 'optimized' | 'both' = 'both') => {
  if (testType === 'original' || testType === 'both') {
    originalToolCalls.value = []
  }
  if (testType === 'optimized' || testType === 'both') {
    optimizedToolCalls.value = []
  }
}

// Removed result caching and related throttling logic to avoid unnecessary complexity

// Key computed property: eliminate interface redundancy, showTestInput depends on optimizationMode
const showTestInput = computed(() => props.optimizationMode === 'system')

// Responsive layout configuration
const adaptiveInputMode = computed(() => {
  if (shouldUseCompactMode.value) return 'compact'
  return props.inputMode || 'normal'
})

const adaptiveControlBarLayout = computed(() => {
  if (shouldUseCompactMode.value) return 'minimal'
  if (shouldUseVerticalLayout.value) return 'compact'
  return props.controlBarLayout || 'default'
})

const adaptiveButtonSize = computed(() => {
  return buttonSize.value
})

const adaptiveResultVerticalLayout = computed(() => {
  return shouldUseVerticalLayout.value || props.resultVerticalLayout
})

// Primary action button text
const primaryActionText = computed(() => {
  if (props.isTestRunning) {
    return t('test.testing')
  }
  return props.isCompareMode && props.enableCompareMode
    ? t('test.startCompare')
    : t('test.startTest')
})

// Primary action button disabled state
const primaryActionDisabled = computed(() => {
  if (props.isTestRunning) return true

  // System prompt mode requires test content
  if (props.optimizationMode === 'system' && !props.testContent.trim()) {
    return true
  }

  return false
})

// Event handling - immediately toggle compare mode to avoid click delay
const handleCompareToggle = () => {
  const newValue = !props.isCompareMode
  emit('update:isCompareMode', newValue)
  emit('compare-toggle')
  recordUpdate()
}

const handleTest = throttle(() => {
  emit('test')
  recordUpdate()
}, 200, 'handleTest')

// Removed unused props change debounce handling to avoid extra complexity

// Performance debugging in development environment
if (import.meta.env.DEV) {
  const logPerformance = debounce(() => {
    const report = getPerformanceReport()
    if (report.grade.grade === 'F') {
      console.warn('TestAreaPanel performance is poor:', report)
    }
  }, 5000, false, 'performanceLog')

  // Check performance periodically
  setInterval(logPerformance, 10000)
}

// Expose methods for parent component to call
defineExpose({
  handleToolCall,
  clearToolCalls,
  // Get current tool call status
  getToolCalls: () => ({
    original: originalToolCalls.value,
    optimized: optimizedToolCalls.value
  })
})
</script>

<style scoped>
.result-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.result-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.tool-calls-section {
  flex: 0 0 auto;
}

/* Hide empty content placeholder in result area when tool call list exists */
/* Hide Naive UI NEmpty when sibling container has .tool-call-display */
.result-container:has(.tool-call-display) :deep(.n-empty) {
  display: none;
}
</style>
