// i18n service for managing internationalization settings
export interface I18nService {
  getCurrentLanguage(): string;
  setCurrentLanguage(language: string): Promise<void>;
  getSupportedLanguages(): string[];
  isLanguageSupported(language: string): boolean;
}

export class I18nServiceImpl implements I18nService {
  private supportedLanguages = ['en-US', 'es'];

  getCurrentLanguage(): string {
    // This would integrate with the UI i18n system
    return 'en-US';
  }

  async setCurrentLanguage(language: string): Promise<void> {
    if (!this.isLanguageSupported(language)) {
      throw new Error(`Unsupported language: ${language}`);
    }
    // This would integrate with the UI i18n system
  }

  getSupportedLanguages(): string[] {
    return [...this.supportedLanguages];
  }

  isLanguageSupported(language: string): boolean {
    return this.supportedLanguages.includes(language);
  }
}

export function createI18nService(): I18nService {
  return new I18nServiceImpl();
}