# Data Model: Localization System

## Entities

### LocalizationSettings
Represents the user's language preference and system language configuration.

**Fields:**
- `userId`: String - Unique identifier for the user (optional for anonymous users)
- `preferredLanguage`: String - The user's preferred language code (e.g., "en", "es")
- `fallbackLanguage`: String - The fallback language code (default: "en")
- `lastUpdated`: DateTime - Timestamp of when the settings were last updated
- `isAutoDetected`: Boolean - Whether the language was automatically detected

**Validation Rules:**
- `preferredLanguage` must be a valid ISO 639-1 language code
- `fallbackLanguage` must be a valid ISO 639-1 language code
- `preferredLanguage` cannot be empty

### TranslationKey
Represents a key used for translation lookups.

**Fields:**
- `key`: String - Unique identifier for the translation (e.g., "navigation.home")
- `defaultValue`: String - Default value in the fallback language
- `description`: String - Description of the context for translators
- `createdAt`: DateTime - Timestamp of when the key was created
- `updatedAt`: DateTime - Timestamp of when the key was last updated

**Validation Rules:**
- `key` must be unique
- `key` must follow naming convention (lowercase, dot-separated)
- `defaultValue` cannot be empty

### LanguagePack
Represents a collection of translations for a specific language.

**Fields:**
- `languageCode`: String - ISO 639-1 language code (e.g., "en", "es")
- `translations`: Map<String, String> - Key-value pairs of translations
- `isActive`: Boolean - Whether the language is available for selection
- `isRTL`: Boolean - Whether the language is right-to-left
- `createdAt`: DateTime - Timestamp of when the language pack was created
- `updatedAt`: DateTime - Timestamp of when the language pack was last updated

**Validation Rules:**
- `languageCode` must be a valid ISO 639-1 language code
- `languageCode` must be unique
- `translations` map cannot be null

### TranslationEntry
Represents a single translation for a specific key in a specific language.

**Fields:**
- `keyId`: String - Reference to the TranslationKey
- `languageCode`: String - ISO 639-1 language code
- `translatedValue`: String - The translated text
- `isVerified`: Boolean - Whether the translation has been verified by a human
- `verifiedBy`: String - User ID of the person who verified the translation (optional)
- `verifiedAt`: DateTime - Timestamp of when the translation was verified (optional)

**Validation Rules:**
- Combination of `keyId` and `languageCode` must be unique
- `translatedValue` cannot be empty
- `languageCode` must be a valid ISO 639-1 language code

## Relationships

1. **User** → **LocalizationSettings** (One-to-One)
   - Each user has one set of localization settings

2. **TranslationKey** → **TranslationEntry** (One-to-Many)
   - Each translation key can have multiple translation entries (one per language)

3. **LanguagePack** ↔ **TranslationEntry** (One-to-Many)
   - Each language pack contains multiple translation entries

## State Transitions

### LocalizationSettings
```
[Created] → [Updated]
    ↑          ↓
[Auto-Detected] ← [Manually Set]
```

### LanguagePack
```
[Created] → [Activated]
    ↓         ↓
[Inactive] ← [Deactivated]
```

### TranslationEntry
```
[Created] → [Verified]
    ↓         ↓
[Unverified] ← [Unverified (after edit)]
```