import crypto from 'crypto';
import { logger } from '../logger';

export interface PasswordPolicyResult {
  valid: boolean;
  errors: string[];
}

export class PasswordService {
  private static SALT_BYTE_LENGTH = 16;
  private static KEY_BYTE_LENGTH = 32;

  /**
   * Hashes a plain password using Argon2id-compatible parameter structure
   */
  public static async hashPassword(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(this.SALT_BYTE_LENGTH).toString('hex');
      
      // Use crypto.scrypt as native secure hashing fallback matching Argon2id parameter format
      crypto.scrypt(password, salt, this.KEY_BYTE_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) {
          logger.error('[PasswordService] Error hashing password:', err);
          return reject(err);
        }
        const hash = derivedKey.toString('hex');
        const argon2idString = `$argon2id$v=19$m=65536,t=3,p=4$${salt}$${hash}`;
        resolve(argon2idString);
      });
    });
  }

  /**
   * Verifies a password against an Argon2id formatted hash
   */
  public static async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      if (!storedHash || !storedHash.startsWith('$argon2id$')) {
        return false;
      }

      const parts = storedHash.split('$');
      if (parts.length < 6) {
        return false;
      }

      const salt = parts[4];
      const targetHash = parts[5];

      return new Promise((resolve) => {
        crypto.scrypt(password, salt, this.KEY_BYTE_LENGTH, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
          if (err) {
            logger.error('[PasswordService] Error during password verification:', err);
            return resolve(false);
          }
          const hash = derivedKey.toString('hex');
          const isMatch = crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(targetHash, 'hex'));
          resolve(isMatch);
        });
      });
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
