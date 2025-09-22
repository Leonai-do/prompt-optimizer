import { describe, it, expect, beforeEach } from 'vitest'
import { createI18n } from 'vue-i18n'
import { createApp } from 'vue'
import enUS from '../../src/i18n/locales/en-US'
import es from '../../src/locales/es.json'

// Performance test for translation loading
// Ensures translation loading meets performance requirements (< 100ms)

describe('Translation Performance', () => {
  let app: any

  beforeEach(() => {
    app = createApp({})
  })

  describe('Translation Loading Performance', () => {
    it('should load English translations in under 100ms', async () => {
      const startTime = performance.now()

      const i18n = createI18n({
        legacy: false,
        locale: 'en-US',
        messages: {
          'en-US': enUS
        }
      })

      app.use(i18n)

      const endTime = performance.now()
      const loadTime = endTime - startTime

      console.log(`English translation load time: ${loadTime.toFixed(2)}ms`)
      expect(loadTime).toBeLessThan(100)
    })

    it('should load Spanish translations in under 100ms', async () => {
      const startTime = performance.now()

      const i18n = createI18n({
        legacy: false,
        locale: 'es',
        messages: {
          'es': es
        }
      })

      app.use(i18n)

      const endTime = performance.now()
      const loadTime = endTime - startTime

      console.log(`Spanish translation load time: ${loadTime.toFixed(2)}ms`)
      expect(loadTime).toBeLessThan(100)
    })

    it('should load both languages simultaneously in under 100ms', async () => {
      const startTime = performance.now()

      const i18n = createI18n({
        legacy: false,
        locale: 'en-US',
        messages: {
          'en-US': enUS,
          'es': es
        }
      })

      app.use(i18n)

      const endTime = performance.now()
      const loadTime = endTime - startTime

      console.log(`Both languages load time: ${loadTime.toFixed(2)}ms`)
      expect(loadTime).toBeLessThan(100)
    })

    it('should switch languages quickly (< 50ms)', async () => {
      const i18n = createI18n({
        legacy: false,
        locale: 'en-US',
        messages: {
          'en-US': enUS,
          'es': es
        }
      })

      app.use(i18n)

      // Test switching from English to Spanish
      const switchStartTime = performance.now()
      i18n.global.locale.value = 'es'
      const switchEndTime = performance.now()
      const switchTime = switchEndTime - switchStartTime

      console.log(`Language switch time: ${switchTime.toFixed(2)}ms`)
      expect(switchTime).toBeLessThan(50)
    })

    it('should access translations quickly (< 10ms per access)', async () => {
      const i18n = createI18n({
        legacy: false,
        locale: 'en-US',
        messages: {
          'en-US': enUS,
          'es': es
        }
      })

      app.use(i18n)

      const testKeys = [
        'common.save',
        'common.cancel',
        'common.settings',
        'test.content',
        'test.placeholder'
      ]

      const accessTimes: number[] = []

      for (const key of testKeys) {
        const accessStartTime = performance.now()
        const translation = i18n.global.t(key)
        const accessEndTime = performance.now()
        const accessTime = accessEndTime - accessStartTime

        accessTimes.push(accessTime)
        expect(translation).toBeDefined()
        expect(typeof translation).toBe('string')
        expect(translation.length).toBeGreaterThan(0)
      }

      const averageAccessTime = accessTimes.reduce((sum, time) => sum + time, 0) / accessTimes.length
      const maxAccessTime = Math.max(...accessTimes)

      console.log(`Average translation access time: ${averageAccessTime.toFixed(2)}ms`)
      console.log(`Max translation access time: ${maxAccessTime.toFixed(2)}ms`)

      expect(averageAccessTime).toBeLessThan(10)
      expect(maxAccessTime).toBeLessThan(20)
    })
  })

  describe('Memory Performance', () => {
    it('should not have excessive memory overhead', async () => {
      // Test that loading translations doesn't consume excessive memory
      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      const i18n = createI18n({
        legacy: false,
        locale: 'en-US',
        messages: {
          'en-US': enUS,
          'es': es
        }
      })

      app.use(i18n)

      const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0

      if (performance.memory) {
        const memoryIncrease = finalMemory - initialMemory
        console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`)

        // Allow up to 10MB increase for translations
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
      }
    })
  })
})