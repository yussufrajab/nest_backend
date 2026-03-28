import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Controller('api/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('request-documents')
  @UseInterceptors(FileInterceptor('file'))
  async uploadRequestDocument(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadRequestDocument(file);
    return {
      success: true,
      data: result,
    };
  }

  @Post('complaint-evidence')
  @UseInterceptors(FileInterceptor('file'))
  async uploadComplaintEvidence(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadComplaintEvidence(file);
    return {
      success: true,
      data: result,
    };
  }

  @Post('decision-letters')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDecisionLetter(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadDecisionLetter(file);
    return {
      success: true,
      data: result,
    };
  }

  @Post('profile-images')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.uploadProfileImage(file);
    return {
      success: true,
      data: result,
    };
  }

  @Get(':bucket/{*path}')
  async getFile(
    @Param('bucket') bucket: string,
    @Param('path') path: string,
    @Res() res: Response,
  ) {
    try {
      const fileBuffer = await this.uploadService.getFile(bucket, path);

      // Determine content type based on file extension
      const ext = path.split('.').pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
      };

      const contentType = contentTypes[ext || ''] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${path}"`);
      res.send(fileBuffer);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  @Delete(':bucket/{*path}')
  async deleteFile(
    @Param('bucket') bucket: string,
    @Param('path') path: string,
  ) {
    await this.uploadService.deleteFile(bucket, path);
    return {
      success: true,
      message: 'File deleted successfully',
    };
  }

  @Post('presigned-url/:bucket/{*path}')
  async getPresignedUrl(
    @Param('bucket') bucket: string,
    @Param('path') path: string,
  ) {
    const url = await this.uploadService.getPresignedUrl(bucket, path);
    return {
      success: true,
      data: { url },
    };
  }
}
