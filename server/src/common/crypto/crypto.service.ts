import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(cfg: ConfigService) {
    const secret = cfg.get<string>('ENCRYPTION_KEY');
    if (!secret || secret.length < 32) {
      throw new Error('ENCRYPTION_KEY must have at least 32 characters');
    }
    this.key = crypto.scryptSync(secret, 'app-skeleton-salt', 32);
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(12); // 12 bytes for GCM
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // store iv + authTag + encrypted, concatenated and base64-encoded
    return Buffer.concat([iv, authTag, encrypted]).toString('base64');
  }

  decrypt(ciphertext: string): string {
    const buffer = Buffer.from(ciphertext, 'base64');

    // values shorter than iv(12) + authTag(16) bytes were stored as plain text
    if (buffer.length < 28) return ciphertext;

    const iv = buffer.subarray(0, 12);
    const authTag = buffer.subarray(12, 28);
    const encrypted = buffer.subarray(28);

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    return decipher.update(encrypted) + decipher.final('utf8');
  }

  // deterministic hash for dedup lookups — you can't search inside encrypted data
  hash(value: string): string {
    return crypto.createHmac('sha256', this.key).update(value.toLowerCase().trim()).digest('hex');
  }
}
