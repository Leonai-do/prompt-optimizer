<template>
  <NDropdown
    :options="dropdownOptions"
    @select="handleLanguageSelect"
    placement="bottom-end"
    trigger="click"
  >
    <NButton 
      quaternary 
      size="small"
      class="flex items-center justify-center"
      :title="currentLanguageLabel"
      :aria-label="currentLanguageLabel"
    >
      <template #icon>
        <svg class="w-5 h-5 language-icon" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Clean globe icon - larger and clearer -->
          <circle cx="16" cy="16" r="14"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"/>

          <!-- Longitude lines -->
          <ellipse cx="16" cy="16" rx="6" ry="14"
                   fill="none"
                   stroke="currentColor"
                   stroke-width="2"/>
          <ellipse cx="16" cy="16" rx="11" ry="8"
                   fill="none"
                   stroke="currentColor"
                   stroke-width="2"/>

          <!-- Latitude line -->
          <line x1="2" y1="16" x2="30" y2="16"
                stroke="currentColor"
                stroke-width="2"/>
          
          <!-- Language symbols -->
          <text x="21" y="12"
                fill="currentColor"
                font-family="system-ui, -apple-system"
                font-size="8"
                font-weight="bold">A</text>

          <text x="8" y="25"
                fill="currentColor"
                font-family="system-ui"
                font-size="7"
                font-weight="bold">E</text>
        </svg>
      </template>
    </NButton>
  </NDropdown>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { NButton, NDropdown, type DropdownOption } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { i18n } from '../plugins/i18n'
import { UI_SETTINGS_KEYS } from '@prompt-optimizer/core'
import { usePreferences } from '../composables/usePreferenceManager'
import type { AppServices } from '../types/services'

// Service injection
const services = inject<Ref<AppServices | null>>('services')!
const { setPreference } = usePreferences(services)
const { t } = useI18n()

// Language options configuration - interface reserved for future expansion
interface LanguageOption {
  key: string
  label: string
  locale: string
}

const availableLanguages = computed<LanguageOption[]>(() => [
  {
    key: 'en-US',
    label: t('language.english'),
    locale: 'en-US'
  },
  {
    key: 'es',
    label: t('language.spanish'),
    locale: 'es'
  }
])

// Current language computed property
const currentLocale = computed(() => i18n.global.locale.value)

const currentLanguageLabel = computed(() => {
  const current = availableLanguages.value.find(lang => lang.locale === currentLocale.value)
  return current ? `${t('language.switchLanguage')} (${current.label})` : t('language.switchLanguage')
})

// Create options for Naive UI Dropdown
const dropdownOptions = computed<DropdownOption[]>(() => {
  return availableLanguages.value.map(language => ({
    key: language.key,
    label: language.label
  }))
})

// Handle language selection
const handleLanguageSelect = async (key: string) => {
  const selectedLanguage = availableLanguages.value.find(lang => lang.key === key)
  if (!selectedLanguage) return

  // Switch language
  i18n.global.locale.value = selectedLanguage.locale

  // Save user preference
  try {
    await setPreference(UI_SETTINGS_KEYS.PREFERRED_LANGUAGE, selectedLanguage.locale)
    console.log(`[LanguageSwitchDropdown] Language switched to: ${selectedLanguage.label}`)
  } catch (error) {
    console.error('[LanguageSwitchDropdown] Failed to save language preference:', error)
    // Language switch still takes effect, just preference saving failed
  }
}
</script>

<style scoped>
.language-icon {
  transition: all 0.2s ease;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.language-icon:hover {
  opacity: 0.8;
  transform: scale(1.05);
}

/* Ensure text is clearly visible in dark theme */
.language-icon text {
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  paint-order: stroke fill;
  stroke: var(--base-color, currentColor);
  stroke-width: 0.5;
  stroke-linejoin: round;
}
</style>