import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

@Injectable()
export class S3Service {
  private readonly s3: AWS.S3;
  readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('CF_R2_BUCKET', '');
    this.s3 = new AWS.S3({
      endpoint: this.config.get<string>('CF_R2_ENDPOINT'),
      accessKeyId: this.config.get<string>('CF_S3_ACCESS_KEY_ID'),
      secretAccessKey: this.config.get<string>('CF_S3_TOKEN_SECRET'),
      region: 'auto',
      signatureVersion: 'v4',
      s3ForcePathStyle: true,
    });
  }

  async upload(key: string, buffer: Buffer, contentType: string): Promise<void> {
    await this.s3
      .upload({ Bucket: this.bucket, Key: key, Body: buffer, ContentType: contentType })
      .promise();
  }

  getSignedDownloadUrl(key: string, expiresInSeconds = 30): string {
    return this.s3.getSignedUrl('getObject', {
      Bucket: this.bucket,
      Key: key,
      Expires: expiresInSeconds,
    });
  }

  async getObject(key: string): Promise<Buffer> {
    const result = await this.s3.getObject({ Bucket: this.bucket, Key: key }).promise();
    return result.Body as Buffer;
  }

  async deleteObject(key: string): Promise<void> {
    await this.s3.deleteObject({ Bucket: this.bucket, Key: key }).promise();
  }
}
