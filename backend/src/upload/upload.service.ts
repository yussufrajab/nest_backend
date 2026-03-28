import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as fs from 'fs';
import { pipeline } from 'stream';
import { promisify } from 'util';

const streamPipeline = promisify(pipeline);

export interface UploadResult {
  url: string;
  bucket: string;
  key: string;
  size: number;
  mimeType: string;
}

export interface UploadOptions {
  bucket: string;
  allowedMimeTypes?: string[];
  maxSizeMB?: number;
  customKey?: string;
}

@Injectable()
export class UploadService {
  private minioClient: Minio.Client;
  private defaultBucket: string;

  constructor(private configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(this.configService.get('MINIO_PORT', '9001'), 10),
      useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.configService.get('MINIO_SECRET_KEY', 'minioadmin'),
    });
    this.defaultBucket = this.configService.get('MINIO_DEFAULT_BUCKET', 'csms-documents');
  }

  /**
   * Upload a file buffer to MinIO
   */
  async uploadFile(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const { bucket, allowedMimeTypes, maxSizeMB, customKey } = options;

    // Validate file size
    const maxSizeBytes = (maxSizeMB || 2) * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new BadRequestException(
        `File size exceeds maximum limit of ${maxSizeMB || 2}MB`,
      );
    }

    // Validate MIME type
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Generate unique key
    const ext = path.extname(file.originalname);
    const key = customKey || `${uuidv4()}${ext}`;

    // Ensure bucket exists
    const bucketExists = await this.minioClient.bucketExists(bucket);
    if (!bucketExists) {
      await this.minioClient.makeBucket(bucket);
    }

    // Upload file
    try {
      await this.minioClient.putObject(bucket, key, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });

      return {
        url: `/api/upload/${bucket}/${key}`,
        bucket,
        key,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file to storage');
    }
  }

  /**
   * Upload request documents (PDF only, max 2MB)
   */
  async uploadRequestDocument(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      allowedMimeTypes: ['application/pdf'],
      maxSizeMB: 2,
    });
  }

  /**
   * Upload complaint evidence (PDF, JPEG, PNG, max 1MB)
   */
  async uploadComplaintEvidence(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSizeMB: 1,
    });
  }

  /**
   * Upload decision letter (PDF only, max 2MB)
   */
  async uploadDecisionLetter(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      allowedMimeTypes: ['application/pdf'],
      maxSizeMB: 2,
    });
  }

  /**
   * Upload employee profile image (JPEG, PNG, max 2MB)
   */
  async uploadProfileImage(file: Express.Multer.File): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: 'csms-profiles',
      allowedMimeTypes: ['image/jpeg', 'image/png'],
      maxSizeMB: 2,
    });
  }

  /**
   * Get file from MinIO
   */
  async getFile(bucket: string, key: string): Promise<Buffer> {
    try {
      const stream = await this.minioClient.getObject(bucket, key);
      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (error) => reject(error));
      });
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }

  /**
   * Delete file from MinIO
   */
  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucket, key);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete file');
    }
  }

  /**
   * Get presigned URL for file access (expires in 1 hour)
   */
  async getPresignedUrl(bucket: string, key: string): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(bucket, key, 3600);
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate presigned URL');
    }
  }

  /**
   * Check if bucket exists, create if not
   */
  async ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName);
    }
  }

  /**
   * Initialize required buckets
   */
  async initializeBuckets(): Promise<void> {
    const buckets = [
      this.defaultBucket,
      'csms-profiles',
      'csms-decision-letters',
    ];

    for (const bucket of buckets) {
      await this.ensureBucketExists(bucket);
    }
  }
}
