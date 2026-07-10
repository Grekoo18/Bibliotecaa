import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsUrl } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @IsNotEmpty()
  authorId: number;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsInt()
  @Min(1000)
  publicationYear?: number;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
