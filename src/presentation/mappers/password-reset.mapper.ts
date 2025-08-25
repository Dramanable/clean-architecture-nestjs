import {
    PasswordResetConfirmDto,
    PasswordResetRequestDto,
    PasswordResetResponseDto,
    TokenValidationResponseDto,
} from '../dtos/password-reset.dto';

/**
 * 🔄 MAPPER - Password Reset Infrastructure Entity to DTO Mapping
 *
 * Responsable de la conversion entre entités infrastructure et DTOs
 * pour les opérations de réinitialisation de mot de passe
 */
export class PasswordResetMapper {
  /**
   * Convertit un résultat de service en DTO de réponse
   */
  static toResponseDto(
    success: boolean,
    message: string,
  ): PasswordResetResponseDto {
    return {
      success,
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Convertit un résultat de validation de token en DTO
   */
  static toTokenValidationDto(
    isValid: boolean,
    error?: string,
  ): TokenValidationResponseDto {
    return {
      isValid,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extrait l'email du DTO de requête
   */
  static extractEmailFromRequest(dto: PasswordResetRequestDto): string {
    return dto.email;
  }

  /**
   * Extrait les données du DTO de confirmation
   */
  static extractConfirmationData(dto: PasswordResetConfirmDto): {
    token: string;
    newPassword: string;
  } {
    return {
      token: dto.token,
      newPassword: dto.newPassword,
    };
  }
}
