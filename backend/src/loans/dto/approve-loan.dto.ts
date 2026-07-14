import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ApproveLoanDto {
  @IsInt()
  @IsNotEmpty()
  bookCopyId: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  documentType?: string;
}
