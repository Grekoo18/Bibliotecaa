import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestLoanDto {
  @IsInt()
  @IsNotEmpty()
  bookId: number;

  @IsOptional()
  @IsString()
  documentType?: string;
}
