import type { I18nService } from '../../application/ports/i18n.port';
export declare class MockI18nService implements I18nService {
    private defaultLang;
    private mockTranslations;
    translate(key: string, params?: Record<string, any>, lang?: string): string;
    t(key: string, params?: Record<string, any>, lang?: string): string;
    setDefaultLanguage(lang: string): void;
    exists(key: string, lang?: string): boolean;
}
