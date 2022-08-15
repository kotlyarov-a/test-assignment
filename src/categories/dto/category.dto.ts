import { IsBoolean, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CategoryDto {
  @IsUUID()
  @IsOptional()
  id?: string;

  @IsString()
  slug: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @IsOptional()
  createdDate?: Date;

  @IsBoolean()
  active: boolean;
}
