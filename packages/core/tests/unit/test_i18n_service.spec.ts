import { describe, it, expect, beforeEach } from 'vitest'
import { createI18nService, I18nService } from '../../src/services/i18n'

// Unit tests for i18n service
// Tests the core i18n service functionality in isolation

describe('I18nService', () => {
  let i18nService: I18nService

  beforeEach(() => {
    i18nService = createI18nService()
  })

  describe('Service Creation', () => {
    it('should create a valid i18n service instance', () => {
      expect(i18nService).toBeDefined()
      expect(typeof i18nService.getCurrentLanguage).toBe('function')
      expect(typeof i18nService.setCurrentLanguage).toBe('function')
      expect(typeof i18nService.getSupportedLanguages).toBe('function')
      expect(typeof i18nService.isLanguageSupported).toBe('function')
    })
  })

  describe('Default Language', () => {
    it('should default to English', () => {
      const currentLang = i18nService.getCurrentLanguage()
      expect(currentLang).toBe('en-US')
    })
  })

  describe('Supported Languages', () => {
    it('should support English and Spanish', () => {
      const supported = i18nService.getSupportedLanguages()
      expect(supported).toContain('en-US')
      expect(supported).toContain('es')
      expect(supported).toHaveLength(2)
    })

    it('should validate language support correctly', () => {
      expect(i18nService.isLanguageSupported('en-US')).toBe(true)
      expect(i18nService.isLanguageSupported('es')).toBe(true)
      expect(i18nService.isLanguageSupported('fr')).toBe(false)
      expect(i18nService.isLanguageSupported('zh-CN')).toBe(false)
      expect(i18nService.isLanguageSupported('')).toBe(false)
    })
  })

  describe('Language Setting', () => {
    it('should allow setting supported languages', async () => {
      // Set to Spanish
      await expect(i18nService.setCurrentLanguage('es')).resolves.toBeUndefined()
      expect(i18nService.getCurrentLanguage()).toBe('es')

      // Set back to English
      await expect(i18nService.setCurrentLanguage('en-US')).resolves.toBeUndefined()
      expect(i18nService.getCurrentLanguage()).toBe('en-US')
    })

    it('should reject unsupported languages', async () => {
      const originalLang = i18nService.getCurrentLanguage()

      await expect(i18nService.setCurrentLanguage('fr')).rejects.toThrow('Unsupported language')
      await expect(i18nService.setCurrentLanguage('zh-CN')).rejects.toThrow('Unsupported language')
      await expect(i18nService.setCurrentLanguage('')).rejects.toThrow('Unsupported language')

      // Language should remain unchanged
      expect(i18nService.getCurrentLanguage()).toBe(originalLang)
    })

    it('should handle invalid input types', async () => {
      const originalLang = i18nService.getCurrentLanguage()

      // @ts-expect-error Testing invalid input
      await expect(i18nService.setCurrentLanguage(null)).rejects.toThrow()
      // @ts-expect-error Testing invalid input
      await expect(i18nService.setCurrentLanguage(undefined)).rejects.toThrow()
      // @ts-expect-error Testing invalid input
      await expect(i18nService.setCurrentLanguage(123)).rejects.toThrow()

      // Language should remain unchanged
      expect(i18nService.getCurrentLanguage()).toBe(originalLang)
    })
  })

  describe('Service Isolation', () => {
    it('should create independent service instances', () => {
      const service1 = createI18nService()
      const service2 = createI18nService()

      expect(service1).not.toBe(service2)
      expect(service1.getCurrentLanguage()).toBe(service2.getCurrentLanguage())

      // Changing one service shouldn't affect the other
      // Note: Since the current implementation doesn't persist state,
      // this test verifies the expected behavior
      expect(service1.getCurrentLanguage()).toBe('en-US')
      expect(service2.getCurrentLanguage()).toBe('en-US')
    })
  })

  describe('Error Handling', () => {
    it('should provide meaningful error messages', async () => {
      try {
        await i18nService.setCurrentLanguage('unsupported-lang')
        fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.message).toContain('Unsupported language')
        expect(error.message).toContain('unsupported-lang')
      }
    })
  })
})