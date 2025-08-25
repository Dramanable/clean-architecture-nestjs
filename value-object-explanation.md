/**
 * 📚 LEÇON : Pourquoi Email Value Object
 * 
 * Un Value Object garantit l'intégrité des données métier
 */

// ❌ SANS VALUE OBJECT - Problèmes multiples :

class UserWithoutVO {
  email: string; // Peut être modifié n'importe quand !
  
  constructor(email: string) {
    // Validation basique uniquement
    if (!email.includes('@')) {
      throw new Error('Invalid email');
    }
    this.email = email;
  }
  
  // Problème : on peut modifier l'email après création
  changeEmail(newEmail: string) {
    this.email = newEmail; // ⚠️ Aucune validation !
  }
}

// ✅ AVEC VALUE OBJECT - Avantages multiples :

class EmailVO {
  public readonly value: string;
  
  constructor(email: string) {
    this.validateFormat(email);
    this.validateLength(email);
    this.validateDomain(email);
    this.value = email.toLowerCase().trim(); // Normalisation
  }
  
  private validateFormat(email: string): void {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      throw new InvalidEmailFormatError(email);
    }
  }
  
  private validateLength(email: string): void {
    if (email.length > 254) { // RFC 5321
      throw new EmailTooLongError(email.length);
    }
  }
  
  private validateDomain(email: string): void {
    const domain = email.split('@')[1];
    if (domain.length > 63) { // RFC 1035
      throw new InvalidEmailDomainError(domain);
    }
  }
  
  // Value Objects sont comparables par valeur
  equals(other: EmailVO): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
}

class UserWithVO {
  public readonly email: EmailVO; // Immutable !
  
  constructor(email: EmailVO, name: string) {
    this.email = email; // Déjà validé, garanti correct !
  }
  
  // Pour changer l'email, on doit créer un nouvel objet
  changeEmail(newEmail: EmailVO): UserWithVO {
    return new UserWithVO(newEmail, this.name); // Immutabilité
  }
}

/**
 * 🎯 AVANTAGES DES VALUE OBJECTS :
 * 
 * 1. VALIDATION CENTRALISÉE
 *    - Toute la logique email est dans Email VO
 *    - Pas de duplication de code
 *    - Validation complexe (format, longueur, domaine)
 * 
 * 2. IMMUTABILITÉ
 *    - Une fois créé, un Email est garanti valide
 *    - Pas de modification accidentelle
 *    - Thread-safe par défaut
 * 
 * 3. EXPRESSIVITÉ DU DOMAINE
 *    - Email est un concept métier, pas juste un string
 *    - Le type système nous protège
 *    - Code auto-documenté
 * 
 * 4. RÉUTILISABILITÉ
 *    - Même Email VO dans User, Order, Newsletter, etc.
 *    - Validation cohérente dans toute l'application
 * 
 * 5. TESTABILITÉ
 *    - Tests focalisés sur la logique email
 *    - Mocks plus faciles
 *    - Edge cases centralisés
 */
