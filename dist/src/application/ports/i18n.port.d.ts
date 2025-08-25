export interface I18nService {
    translate(key: string, params?: Record<string, any>, lang?: string): string;
    t(key: string, params?: Record<string, any>, lang?: string): string;
    setDefaultLanguage(lang: string): void;
    exists(key: string, lang?: string): boolean;
}
export type { I18nService as I18nPort };
