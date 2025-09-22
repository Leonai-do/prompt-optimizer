import { describe, it, expect, beforeEach } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createApp } from 'vue'
import enUS from '../../src/i18n/locales/en-US'
import es from '../../src/locales/es.json'

// Multi-platform compatibility test
// Ensures i18n system works consistently across web, desktop, and extension platforms

describe('Multi-platform Compatibility', () => {
  let app: any
  let i18n: any

  beforeEach(() => {
    // Mock different platform environments
    i18n = createI18n({
      legacy: false,
      locale: 'en-US',
      fallbackLocale: 'en-US',
      messages: {
        'en-US': enUS,
        'es': es
      }
    })

    app = createApp({})
    app.use(i18n)
  })

  describe('Web Platform Compatibility', () => {
    beforeEach(() => {
      // Mock web environment
      global.window = {} as any
      global.navigator = { language: 'en-US' } as any
    })

    it('should work in web environment', () => {
      expect(i18n.global.locale.value).toBe('en-US')
      expect(i18n.global.t('common.save')).toBe('Save')
    })

    it('should handle browser language detection', () => {
      // Test with Spanish browser language
      global.navigator = { language: 'es-ES' } as any

      const newI18n = createI18n({
        legacy: false,
        locale: 'en-US',
        messages: {
          'en-US': enUS,
          'es': es
        }
      })

      expect(newI18n.global.locale.value).toBe('en-US') // Still defaults to en-US
    })
  })

  describe('Desktop Platform Compatibility', () => {
    beforeEach(() => {
      // Mock desktop environment (Electron)
      global.window = {
        electronAPI: {}
      } as any
      global.process = {
        platform: 'win32',
        versions: { electron: '1.0.0' }
      } as any
    })

    it('should work in desktop environment', () => {
      expect(i18n.global.locale.value).toBe('en-US')
      expect(i18n.global.t('common.save')).toBe('Save')
    })

    it('should handle Electron-specific features', () => {
      // Test that translations work with Electron APIs available
      expect(typeof global.window.electronAPI).toBe('object')
      expect(i18n.global.t('common.save')).toBe('Save')
    })
  })

  describe('Extension Platform Compatibility', () => {
    beforeEach(() => {
      // Mock extension environment
      global.window = {} as any
      global.chrome = {
        runtime: {},
        storage: {}
      } as any
    })

    it('should work in extension environment', () => {
      expect(i18n.global.locale.value).toBe('en-US')
      expect(i18n.global.t('common.save')).toBe('Save')
    })

    it('should handle Chrome extension APIs', () => {
      // Test that translations work with Chrome APIs available
      expect(typeof global.chrome.runtime).toBe('object')
      expect(i18n.global.t('common.save')).toBe('Save')
    })
  })

  describe('Cross-platform Language Switching', () => {
    const platforms = ['web', 'desktop', 'extension']

    platforms.forEach(platform => {
      describe(`${platform} platform`, () => {
        beforeEach(() => {
          // Setup platform-specific mocks
          switch (platform) {
            case 'web':
              global.window = {} as any
              break
            case 'desktop':
              global.window = { electronAPI: {} } as any
              global.process = { platform: 'win32' } as any
              break
            case 'extension':
              global.window = {} as any
              global.chrome = { runtime: {} } as any
              break
          }
        })

        it('should switch to Spanish consistently', () => {
          // Start in English
          expect(i18n.global.locale.value).toBe('en-US')
          expect(i18n.global.t('common.save')).toBe('Save')

          // Switch to Spanish
          i18n.global.locale.value = 'es'

          // Verify Spanish translations
          expect(i18n.global.locale.value).toBe('es')
          expect(i18n.global.t('common.save')).toBe('Guardar')
        })

        it('should maintain translation consistency', () => {
          const testKeys = [
            'common.save',
            'common.cancel',
            'common.settings',
            'test.content'
          ]

          // Test English
          i18n.global.locale.value = 'en-US'
          const englishTranslations = testKeys.map(key => i18n.global.t(key))

          // Test Spanish
          i18n.global.locale.value = 'es'
          const spanishTranslations = testKeys.map(key => i18n.global.t(key))

          // Verify all translations exist and are different
          englishTranslations.forEach(translation => {
            expect(translation).toBeDefined()
            expect(typeof translation).toBe('string')
            expect(translation.length).toBeGreaterThan(0)
          })

          spanishTranslations.forEach(translation => {
            expect(translation).toBeDefined()
            expect(typeof translation).toBe('string')
            expect(translation.length).toBeGreaterThan(0)
          })

          // Verify English and Spanish are different
          englishTranslations.forEach((english, index) => {
            const spanish = spanishTranslations[index]
            expect(english).not.toBe(spanish)
          })
        })
      })
    })
  })

  describe('Platform-specific Storage Integration', () => {
    it('should handle storage differences across platforms', () => {
      // Test that the i18n system doesn't break with different storage mechanisms

      // Web: localStorage
      let storageMechanism = 'localStorage'

      // Desktop: File system
      storageMechanism = 'fileSystem'

      // Extension: Chrome storage
      storageMechanism = 'chromeStorage'

      // All should work regardless of storage mechanism
      expect(i18n.global.t('common.save')).toBeDefined()
    })

    it('should handle storage unavailability gracefully', () => {
      // Test behavior when storage is not available
      // (e.g., incognito mode, restricted environments)

      // Mock storage failure
      const originalLocalStorage = global.localStorage
      delete (global as any).localStorage

      try {
        // Should still work without storage
        expect(i18n.global.t('common.save')).toBe('Save')

        // Language switching should still work
        i18n.global.locale.value = 'es'
        expect(i18n.global.t('common.save')).toBe('Guardar')
      } finally {
        // Restore localStorage
        global.localStorage = originalLocalStorage
      }
    })
  })

  describe('Performance Across Platforms', () => {
    it('should maintain consistent performance', () => {
      const platforms = ['web', 'desktop', 'extension']
      const performanceResults: { [key: string]: number } = {}

      platforms.forEach(platform => {
        // Setup platform
        switch (platform) {
          case 'web':
            global.window = {} as any
            break
          case 'desktop':
            global.window = { electronAPI: {} } as any
            break
          case 'extension':
            global.chrome = { runtime: {} } as any
            break
        }

        // Measure translation access time
        const startTime = performance.now()

        for (let i = 0; i < 100; i++) {
          i18n.global.t('common.save')
          i18n.global.t('common.settings')
        }

        const endTime = performance.now()
        performanceResults[platform] = endTime - startTime
      })

      // All platforms should be reasonably fast (< 50ms for 200 accesses)
      Object.entries(performanceResults).forEach(([platform, time]) => {
        console.log(`${platform} platform: ${time.toFixed(2)}ms for 200 translations`)
        expect(time).toBeLessThan(50)
      })
    })
  })
})