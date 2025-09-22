import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import LanguageSwitchDropdown from '../../src/components/LanguageSwitchDropdown.vue'

// Mock Naive UI components
vi.mock('naive-ui', () => ({
  NButton: {
    name: 'NButton',
    template: '<button><slot name="icon"></slot><slot></slot></button>',
    props: ['quaternary', 'size', 'title', 'aria-label']
  },
  NDropdown: {
    name: 'NDropdown',
    template: '<div><slot></slot></div>',
    emits: ['select'],
    props: ['options', 'placement', 'trigger']
  }
}))

// Mock the i18n plugin
vi.mock('../../src/plugins/i18n', () => ({
  i18n: {
    global: {
      locale: { value: 'en-US' }
    }
  }
}))

// Mock preference manager
vi.mock('../../src/composables/usePreferenceManager', () => ({
  usePreferences: () => ({
    setPreference: vi.fn().mockResolvedValue(true)
  })
}))

// Mock core settings
vi.mock('@prompt-optimizer/core', () => ({
  UI_SETTINGS_KEYS: {
    PREFERRED_LANGUAGE: 'preferredLanguage'
  }
}))

// Test i18n instance with language keys
const createTestI18n = () => createI18n({
  legacy: false,
  locale: 'en-US',
  messages: {
    'en-US': {
      language: {
        switchLanguage: 'Switch Language',
        english: 'English',
        spanish: 'Español'
      }
    },
    'es': {
      language: {
        switchLanguage: 'Cambiar idioma',
        english: 'English',
        spanish: 'Español'
      }
    }
  }
})

// Mock service injection
const mockServices = {
  value: {
    preferenceService: {
      get: vi.fn().mockResolvedValue('en-US'),
      set: vi.fn().mockResolvedValue(true)
    }
  }
}

describe('Language Switcher Component', () => {
  let wrapper: any
  let i18n: any

  beforeEach(() => {
    i18n = createTestI18n()
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(LanguageSwitchDropdown, {
      global: {
        plugins: [i18n],
        provide: {
          services: mockServices
        }
      },
      props
    })
  }

  describe('Component Rendering', () => {
    it('should render the language switcher button', () => {
      wrapper = createWrapper()
      expect(wrapper.vm).toBeDefined()
      expect(wrapper.findComponent({ name: 'NButton' }).exists()).toBe(true)
    })

    it('should render with correct accessibility attributes', () => {
      wrapper = createWrapper()
      const button = wrapper.findComponent({ name: 'NButton' })
      expect(button.attributes('aria-label')).toBeDefined()
      expect(button.attributes('title')).toBeDefined()
    })
  })

  describe('Language Options', () => {
    it('should provide correct language options', () => {
      wrapper = createWrapper()
      const vm = wrapper.vm
      const options = vm.dropdownOptions

      expect(options).toHaveLength(2)
      expect(options[0].key).toBe('en-US')
      expect(options[1].key).toBe('es')
    })

    it('should use translated language labels', () => {
      wrapper = createWrapper()
      const vm = wrapper.vm
      const options = vm.dropdownOptions

      expect(options[0].label).toBe('English')
      expect(options[1].label).toBe('Español')
    })
  })

  describe('Language Switching', () => {
    it('should switch to Spanish when selected', async () => {
      wrapper = createWrapper()
      const vm = wrapper.vm

      await vm.handleLanguageSelect('es')

      expect(i18n.global.locale.value).toBe('es')
      expect(mockServices.value.preferenceService.set).toHaveBeenCalledWith(
        'preferredLanguage',
        'es'
      )
    })

    it('should switch back to English when selected', async () => {
      wrapper = createWrapper()
      const vm = wrapper.vm

      // First switch to Spanish
      await vm.handleLanguageSelect('es')
      expect(i18n.global.locale.value).toBe('es')

      // Then switch back to English
      await vm.handleLanguageSelect('en-US')
      expect(i18n.global.locale.value).toBe('en-US')
    })

    it('should handle invalid language selection gracefully', async () => {
      wrapper = createWrapper()
      const vm = wrapper.vm
      const originalLocale = i18n.global.locale.value

      await vm.handleLanguageSelect('invalid-lang')

      // Should not change the locale for invalid selection
      expect(i18n.global.locale.value).toBe(originalLocale)
      expect(mockServices.value.preferenceService.set).not.toHaveBeenCalled()
    })
  })

  describe('Current Language Display', () => {
    it('should display current language in button title', () => {
      wrapper = createWrapper()
      const vm = wrapper.vm
      const title = vm.currentLanguageLabel

      expect(title).toContain('Switch Language')
      expect(title).toContain('English')
    })

    it('should update display when language changes', async () => {
      wrapper = createWrapper()
      const vm = wrapper.vm

      // Initially English
      expect(vm.currentLanguageLabel).toContain('English')

      // Switch to Spanish
      await vm.handleLanguageSelect('es')
      expect(vm.currentLanguageLabel).toContain('Español')
    })
  })

  describe('Error Handling', () => {
    it('should handle preference service errors gracefully', async () => {
      // Mock preference service to reject
      mockServices.value.preferenceService.set.mockRejectedValueOnce(new Error('Storage error'))

      wrapper = createWrapper()
      const vm = wrapper.vm

      // Should not throw even if preference saving fails
      await expect(vm.handleLanguageSelect('es')).resolves.toBeUndefined()
      expect(i18n.global.locale.value).toBe('es') // Language still changed
    })
  })
})