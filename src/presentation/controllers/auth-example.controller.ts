/**
 * 🎯 EXAMPLE CONTROLLER - Démonstration de l'authentification Passport.js
 *
 * Exemple montrant comment req.user est automatiquement peuplé
 * après authentification avec les strategies Passport.js
 */

import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../infrastructure/security/jwt-auth.guard';
import { LocalAuthGuard } from '../../infrastructure/security/local-auth.guard';
import { Public } from '../../infrastructure/security/public.decorator';
import type { User } from '../../domain/entities/user.entity';

interface LoginDto {
  email: string;
  password: string;
}

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('auth-example')
@Controller('auth-example')
export class AuthExampleController {
  /**
   * 🔐 LOGIN avec Local Strategy
   * Utilise LocalAuthGuard qui exécute LocalStrategy.validate()
   * req.user est automatiquement peuplé après validation
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login avec Passport Local Strategy',
    description: 'Authentification par email/password via Passport.js',
  })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie - req.user peuplé automatiquement',
  })
  @ApiResponse({
    status: 401,
    description: 'Credentials invalides',
  })
  async login(
    @Req() req: AuthenticatedRequest,
    @Body() _loginDto: LoginDto,
  ): Promise<{ user: User; message: string }> {
    // ✅ req.user est automatiquement peuplé par LocalStrategy.validate()
    // Passport.js a exécuté la validation et injecté l'utilisateur
    const user = req.user;

    return {
      user,
      message: `Connexion réussie pour ${user.email.value}. req.user peuplé automatiquement par Passport.js`,
    };
  }

  /**
   * 🔒 PROFILE avec JWT Strategy
   * Utilise JwtAuthGuard qui exécute JwtStrategy.validate()
   * req.user est automatiquement peuplé après validation du token
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Profil utilisateur avec Passport JWT Strategy',
    description: 'Récupération du profil via token JWT et Passport.js',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré - req.user peuplé automatiquement',
  })
  @ApiResponse({
    status: 401,
    description: 'Token JWT invalide ou expiré',
  })
  async getProfile(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ user: User; message: string }> {
    // ✅ req.user est automatiquement peuplé par JwtStrategy.validate()
    // Passport.js a décodé le JWT et récupéré l'utilisateur depuis la DB/cache
    const user = req.user;

    return {
      user,
      message: `Profil de ${user.email.value}. req.user peuplé automatiquement par Passport.js JWT Strategy`,
    };
  }

  /**
   * 📋 STATUS avec JWT Strategy
   * Endpoint pour vérifier l'état de l'authentification
   */
  @UseGuards(JwtAuthGuard)
  @Get('status')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Statut authentification',
    description: "Vérification du statut d'authentification via JWT",
  })
  async getAuthStatus(@Req() req: AuthenticatedRequest): Promise<{
    authenticated: boolean;
    userId: string;
    userEmail: string;
    userRole: string;
    message: string;
  }> {
    // ✅ req.user est disponible car JwtAuthGuard a validé le token
    const user = req.user;

    return {
      authenticated: true,
      userId: user.id,
      userEmail: user.email.value,
      userRole: user.role,
      message: 'Utilisateur authentifié avec succès via Passport.js',
    };
  }

  /**
   * 🌍 PUBLIC endpoint pour comparaison
   * Montre qu'aucune authentification n'est requise
   */
  @Public()
  @Get('public')
  @ApiOperation({
    summary: 'Endpoint public',
    description: 'Accessible sans authentification',
  })
  async getPublicInfo(): Promise<{ message: string; authenticated: boolean }> {
    return {
      message: 'Cet endpoint est public - aucune authentification requise',
      authenticated: false,
    };
  }
}
