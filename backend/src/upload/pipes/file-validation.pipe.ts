import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

export interface FileValidationOptions {
  allowedMimeTypes?: string[];
  maxSizeMB?: number;
  minSizeKB?: number;
}

@Injectable()
export class FileValidationPipe implements PipeTransform<Express.Multer.File> {
  constructor(private options: FileValidationOptions = {}) {}

  transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const { allowedMimeTypes, maxSizeMB, minSizeKB } = this.options;

    // Validate MIME type
    if (allowedMimeTypes && !allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Expected: ${allowedMimeTypes.join(', ')}. Received: ${file.mimetype}`,
      );
    }

    // Validate max size
    if (maxSizeMB) {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        throw new BadRequestException(
          `File size exceeds maximum limit of ${maxSizeMB}MB`,
        );
      }
    }

    // Validate min size
    if (minSizeKB) {
      const minSizeBytes = minSizeKB * 1024;
      if (file.size < minSizeBytes) {
        throw new BadRequestException(
          `File size is below minimum limit of ${minSizeKB}KB`,
        );
      }
    }

    return file;
  }
}

// Pre-configured validators for common use cases
export const requestDocumentValidator = new FileValidationPipe({
  allowedMimeTypes: ['application/pdf'],
  maxSizeMB: 2,
});

export const complaintEvidenceValidator = new FileValidationPipe({
  allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  maxSizeMB: 1,
});

export const decisionLetterValidator = new FileValidationPipe({
  allowedMimeTypes: ['application/pdf'],
  maxSizeMB: 2,
});

export const profileImageValidator = new FileValidationPipe({
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  maxSizeMB: 2,
});
