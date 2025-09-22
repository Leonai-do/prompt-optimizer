# Quickstart: Localization Feature

## Overview
This guide provides instructions for implementing and using the localization feature in the application. The feature ensures all text is displayed in English by default, with Spanish as a secondary option, and provides a framework for adding additional languages.

## Prerequisites
- Node.js 16+
- npm or yarn
- Basic understanding of React and i18next

## Setup

### 1. Install Dependencies
```bash
npm install i18next react-i18next i18next-http-backend i18next-browser-languagedetector
```

### 2. Create Translation Files
Create the following directory structure:
```
public/
└── locales/
    ├── en/
    │   └── translation.json
    └── es/
        └── translation.json
```

Example translation.json for English:
```json
{
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "user": {
    "profile": "Profile",
    "settings": "Settings"
  }
}
```

### 3. Configure i18next
Create `src/i18n.js`:
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;
```

### 4. Initialize in App
In your main App.js or App.tsx:
```javascript
import './i18n';

function App() {
  return (
    // Your app content
  );
}

export default App;
```

## Usage

### 1. Basic Translation
```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <h1>{t('navigation.home')}</h1>
  );
}
```

### 2. Language Switcher
```javascript
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('es')}>Español</button>
    </div>
  );
}
```

## Adding New Languages

### 1. Create Translation Files
Add a new directory under `public/locales/` with the ISO 639-1 language code (e.g., `fr` for French).

### 2. Update Configuration
Add the new language to the supported languages list in your i18next configuration.

## Verification

### 1. Check for Chinese Characters
Run the following script to verify no Chinese characters remain:
```bash
# Search for Chinese characters in source files
grep -rP '[\x{4e00}-\x{9fff}]' src/
```

### 2. Test Language Switching
1. Open the application in a browser
2. Verify English is displayed by default
3. Switch to Spanish and verify all text is translated
4. Confirm no Chinese characters are visible in either language

## Troubleshooting

### Issue: Translations not loading
- Check that translation files are in the correct location
- Verify the loadPath in i18next configuration
- Check browser console for errors

### Issue: Language not switching
- Ensure the language switcher is correctly implemented
- Check that the selected language code matches directory names
- Verify i18next is properly initialized

### Issue: Missing translations
- Check that all translation keys exist in all language files
- Verify key names match exactly between languages