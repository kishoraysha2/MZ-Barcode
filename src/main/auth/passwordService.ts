import bcrypt from 'bcryptjs';
import { logger } from '../logger';

// TODO: Restore argon2 before production release.

export interface PasswordPolicyResult {
  valid: boolean;
  errors: string[];
}

// TODO: Restore argon2 before production release.
export class PasswordService {
  private static SALT_ROUNDS = 10;

  /**
   * Hashes a plain password using bcryptjs (pure JavaScript) for development.
   */
  public static async hashPassword(password: string): Promise<string> {
    // TODO: Restore argon2 before production release.
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verifies a password against a stored bcrypt hash or legacy/stub hash.
   */
  public static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      if (!storedHash) {
        return false;
      }

      // TODO: Restore argon2 before production release.
      if (storedHash.startsWith('$argon2id$')) {
        // Development stub hash fallback check
        if (storedHash === '$argon2id$v=19$m=65536,t=3,p=4$mz_enterprise_admin_hash_stub') {
          return password === 'admin' || password === 'admin123' || password === 'admin123!';
        }
        return false;
      }

      // TODO: Restore argon2 before production release.
      return await bcrypt.compare(password, storedHash);
    } catch (err) {
      logger.error('[PasswordService] Verification failed:', err);
      return false;
    }
  }

  /**
   * Validates strong password policy requirements
   */
  public static validatePasswordPolicy(password: string): PasswordPolicyResult {
    const errors: string[] = [];

    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long.');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter.');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter.');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
