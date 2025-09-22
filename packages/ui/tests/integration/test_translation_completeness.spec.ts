import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import enUS from '../../src/i18n/locales/en-US'
import es from '../../src/locales/es.json'

// Translation completeness validation
// Ensures all UI strings have translations in all supported languages

describe('Translation Completeness', () => {
  const componentsDir = join(process.cwd(), 'src/components')

  // Extract all translation keys used in Vue components
  const extractTranslationKeys = (content: string): string[] => {
    const keyRegex = /\$t\(['"]([^'"]+)['"]\)/g
    const useI18nRegex = /\bt\(['"]([^'"]+)['"]\)/g

    const keys: string[] = []
    let match

    // Extract $t() calls
    while ((match = keyRegex.exec(content)) !== null) {
      keys.push(match[1])
    }

    // Extract t() calls from useI18n
    while ((match = useI18nRegex.exec(content)) !== null) {
      keys.push(match[1])
    }

    return [...new Set(keys)] // Remove duplicates
  }

  // Get all translation keys from a translation object
  const getAllTranslationKeys = (obj: any, prefix = ''): string[] => {
    const keys: string[] = []

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'object' && value !== null) {
        keys.push(...getAllTranslationKeys(value, fullKey))
      } else {
        keys.push(fullKey)
      }
    }

    return keys
  }

  // Check if a key exists in translation object
  const keyExists = (obj: any, key: string): boolean => {
    const parts = key.split('.')
    let current = obj

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return false
      }
    }

    return true
  }

  // Get all Vue component files
  const getVueFiles = (dir: string): string[] => {
    const files: string[] = []

    try {
      const items = readdirSync(dir)

      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.')) {
          files.push(...getVueFiles(fullPath))
        } else if (stat.isFile() && item.endsWith('.vue')) {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.warn(`Could not read directory: ${dir}`)
    }

    return files
  }

  describe('Translation Key Extraction', () => {
    it('should find Vue component files', () => {
      const vueFiles = getVueFiles(componentsDir)
      expect(vueFiles.length).toBeGreaterThan(0)
      console.log(`Found ${vueFiles.length} Vue component files`)
    })

    it('should extract translation keys from components', () => {
      const vueFiles = getVueFiles(componentsDir)
      const allKeys: string[] = []

      for (const file of vueFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const keys = extractTranslationKeys(content)
          allKeys.push(...keys)
        } catch (error) {
          console.warn(`Could not read file: ${file}`)
        }
      }

      const uniqueKeys = [...new Set(allKeys)]
      console.log(`Found ${uniqueKeys.length} unique translation keys in components`)

      expect(uniqueKeys.length).toBeGreaterThan(0)
    })
  })

  describe('English Translation Completeness', () => {
    const englishKeys = getAllTranslationKeys(enUS)

    it('should have English translations loaded', () => {
      expect(englishKeys.length).toBeGreaterThan(0)
      console.log(`English translation has ${englishKeys.length} keys`)
    })

    it('should have all component translation keys in English', () => {
      const vueFiles = getVueFiles(componentsDir)
      const missingKeys: string[] = []

      for (const file of vueFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const keys = extractTranslationKeys(content)

          for (const key of keys) {
            if (!keyExists(enUS, key)) {
              missingKeys.push(key)
            }
          }
        } catch (error) {
          console.warn(`Could not read file: ${file}`)
        }
      }

      if (missingKeys.length > 0) {
        console.error('Missing English translations for keys:')
        missingKeys.forEach(key => console.error(`  - ${key}`))
      }

      expect(missingKeys).toHaveLength(0)
    })
  })

  describe('Spanish Translation Completeness', () => {
    const spanishKeys = getAllTranslationKeys(es)

    it('should have Spanish translations loaded', () => {
      expect(spanishKeys.length).toBeGreaterThan(0)
      console.log(`Spanish translation has ${spanishKeys.length} keys`)
    })

    it('should have all component translation keys in Spanish', () => {
      const vueFiles = getVueFiles(componentsDir)
      const missingKeys: string[] = []

      for (const file of vueFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const keys = extractTranslationKeys(content)

          for (const key of keys) {
            if (!keyExists(es, key)) {
              missingKeys.push(key)
            }
          }
        } catch (error) {
          console.warn(`Could not read file: ${file}`)
        }
      }

      if (missingKeys.length > 0) {
        console.error('Missing Spanish translations for keys:')
        missingKeys.forEach(key => console.error(`  - ${key}`))
      }

      expect(missingKeys).toHaveLength(0)
    })
  })

  describe('Translation Consistency', () => {
    it('should have consistent key structure between languages', () => {
      const englishKeys = getAllTranslationKeys(enUS)
      const spanishKeys = getAllTranslationKeys(es)

      const englishOnlyKeys = englishKeys.filter(key => !spanishKeys.includes(key))
      const spanishOnlyKeys = spanishKeys.filter(key => !englishKeys.includes(key))

      if (englishOnlyKeys.length > 0) {
        console.warn('Keys only in English:')
        englishOnlyKeys.forEach(key => console.warn(`  - ${key}`))
      }

      if (spanishOnlyKeys.length > 0) {
        console.warn('Keys only in Spanish:')
        spanishOnlyKeys.forEach(key => console.warn(`  - ${key}`))
      }

      // Allow some keys to be English-only (like technical keys), but warn about inconsistencies
      expect(spanishOnlyKeys.length).toBeLessThanOrEqual(5) // Allow small number of Spanish-only keys
    })

    it('should not have empty translations', () => {
      const checkEmptyTranslations = (obj: any, prefix = ''): string[] => {
        const emptyKeys: string[] = []

        for (const [key, value] of Object.entries(obj)) {
          const fullKey = prefix ? `${prefix}.${key}` : key

          if (typeof value === 'object' && value !== null) {
            emptyKeys.push(...checkEmptyTranslations(value, fullKey))
          } else if (typeof value === 'string' && value.trim() === '') {
            emptyKeys.push(fullKey)
          }
        }

        return emptyKeys
      }

      const englishEmpty = checkEmptyTranslations(enUS)
      const spanishEmpty = checkEmptyTranslations(es)

      if (englishEmpty.length > 0) {
        console.error('Empty English translations:')
        englishEmpty.forEach(key => console.error(`  - ${key}`))
      }

      if (spanishEmpty.length > 0) {
        console.error('Empty Spanish translations:')
        spanishEmpty.forEach(key => console.error(`  - ${key}`))
      }

      expect(englishEmpty).toHaveLength(0)
      expect(spanishEmpty).toHaveLength(0)
    })
  })

  describe('Translation Key Validation', () => {
    it('should follow translation key naming conventions', () => {
      const vueFiles = getVueFiles(componentsDir)
      const invalidKeys: string[] = []

      const keyPattern = /^[a-z][a-zA-Z0-9]*(\.[a-z][a-zA-Z0-9]*)*$/

      for (const file of vueFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const keys = extractTranslationKeys(content)

          for (const key of keys) {
            if (!keyPattern.test(key)) {
              invalidKeys.push(key)
            }
          }
        } catch (error) {
          console.warn(`Could not read file: ${file}`)
        }
      }

      if (invalidKeys.length > 0) {
        console.error('Invalid translation key format:')
        invalidKeys.forEach(key => console.error(`  - ${key}`))
      }

      expect(invalidKeys).toHaveLength(0)
    })
  })
})