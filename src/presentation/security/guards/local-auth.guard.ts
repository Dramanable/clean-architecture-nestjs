/**
 * 🛡️ LOCAL AUTH GUARD - NestJS Passport Guard
 *
 * Guard Local pour l'authentification par email/password
 * Placé dans la couche Présentation car gère l'authentification HTTP
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 🔑 Local Authentication Guard
 *
 * Utilise la stratégie Local de Passport pour valider email/password
 * Utilisé principalement pour l'endpoint de login
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
