import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendBackRequestDto {
  @IsNotEmpty({ message: 'Rectification instructions are required' })
  @IsString()
  rectificationInstructions: string;

  @IsOptional()
  @IsString()
  internalNotes?: string;
}
