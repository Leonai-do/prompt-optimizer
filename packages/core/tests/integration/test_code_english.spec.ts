import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

// Integration test for code English-only requirement
// This test verifies that all code files contain only English text
// and should FAIL if any Chinese characters are found

describe('Code English-Only Integration', () => {
  const srcDir = join(process.cwd(), 'src')

  // Helper function to check if file contains Chinese characters
  const containsChinese = (content: string): boolean => {
    // Check for Chinese characters (CJK Unified Ideographs range)
    const chineseRegex = /[\u4e00-\u9fff]/
    return chineseRegex.test(content)
  }

  // Helper function to get all source files recursively
  const getAllSourceFiles = (dir: string): string[] => {
    const files: string[] = []

    try {
      const items = readdirSync(dir)

      for (const item of items) {
        const fullPath = join(dir, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          files.push(...getAllSourceFiles(fullPath))
        } else if (stat.isFile()) {
          const ext = extname(item)
          // Check TypeScript, JavaScript, and Vue files
          if (['.ts', '.js', '.vue', '.tsx', '.jsx'].includes(ext)) {
            files.push(fullPath)
          }
        }
      }
    } catch (error) {
      // Skip directories we can't read
      console.warn(`Could not read directory: ${dir}`)
    }

    return files
  }

  describe('Source Code Analysis', () => {
    const sourceFiles = getAllSourceFiles(srcDir)

    it('should find source files to analyze', () => {
      // Integration: Should be able to find source files
      expect(sourceFiles.length).toBeGreaterThan(0)
      console.log(`Found ${sourceFiles.length} source files to analyze`)
    })

    it('should not contain Chinese characters in any source file', () => {
      // Integration: No Chinese characters should exist in code
      const filesWithChinese: string[] = []

      for (const file of sourceFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          if (containsChinese(content)) {
            filesWithChinese.push(file)
          }
        } catch (error) {
          // Skip files we can't read
          console.warn(`Could not read file: ${file}`)
        }
      }

      // This test will fail if Chinese characters are found
      expect(filesWithChinese).toHaveLength(0)

      if (filesWithChinese.length > 0) {
        console.error('Files containing Chinese characters:')
        filesWithChinese.forEach(file => console.error(`  - ${file}`))
      }
    })

    it('should not contain Chinese characters in comments', () => {
      // Integration: Comments should be in English
      const filesWithChineseComments: string[] = []

      for (const file of sourceFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          const lines = content.split('\n')

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            // Check for Chinese in comments (// or /* */)
            const commentRegex = /(?:\/\/.*|\/\*[\s\S]*?\*\/)/g
            let match
            while ((match = commentRegex.exec(line)) !== null) {
              if (containsChinese(match[0])) {
                filesWithChineseComments.push(`${file}:${i + 1}`)
                break
              }
            }
          }
        } catch (error) {
          // Skip files we can't read
        }
      }

      expect(filesWithChineseComments).toHaveLength(0)

      if (filesWithChineseComments.length > 0) {
        console.error('Lines with Chinese in comments:')
        filesWithChineseComments.forEach(line => console.error(`  - ${line}`))
      }
    })

    it('should not contain Chinese characters in string literals', () => {
      // Integration: String literals should be in English
      const filesWithChineseStrings: string[] = []

      for (const file of sourceFiles) {
        try {
          const content = readFileSync(file, 'utf-8')
          // Simple regex to find string literals
          const stringRegex = /(["'`])(?:(?=(\\?))\2.)*?\1/g
          let match

          while ((match = stringRegex.exec(content)) !== null) {
            if (containsChinese(match[0])) {
              const lines = content.substring(0, match.index).split('\n')
              const lineNumber = lines.length
              filesWithChineseStrings.push(`${file}:${lineNumber}`)
              break
            }
          }
        } catch (error) {
          // Skip files we can't read
        }
      }

      expect(filesWithChineseStrings).toHaveLength(0)

      if (filesWithChineseStrings.length > 0) {
        console.error('Lines with Chinese in strings:')
        filesWithChineseStrings.forEach(line => console.error(`  - ${line}`))
      }
    })
  })

  describe('Code Quality Checks', () => {
    it('should have valid file encodings', () => {
      // Integration: All files should be readable as UTF-8
      const invalidFiles: string[] = []

      for (const file of sourceFiles) {
        try {
          readFileSync(file, 'utf-8')
        } catch (error) {
          invalidFiles.push(file)
        }
      }

      expect(invalidFiles).toHaveLength(0)

      if (invalidFiles.length > 0) {
        console.error('Files with invalid encoding:')
        invalidFiles.forEach(file => console.error(`  - ${file}`))
      }
    })
  })
})