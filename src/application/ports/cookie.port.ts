/**
 * 🍪 COOKIE PORT - Interface pour la gestion des cookies
 */

export interface CookieOptions {
  readonly httpOnly?: boolean;
  readonly secure?: boolean;
  readonly sameSite?: 'strict' | 'lax' | 'none';
  readonly maxAge?: number;
  readonly domain?: string;
  readonly path?: string;
}

export interface ICookieService {
  /**
   * Définit un cookie avec options
   */
  setCookie(
    response: any,
    name: string,
    value: string,
    options?: CookieOptions,
  ): void;

  /**
   * Récupère un cookie depuis la requête
   */
  getCookie(request: any, name: string): string | undefined;

  /**
   * Supprime un cookie
   */
  clearCookie(response: any, name: string, options?: CookieOptions): void;
}
