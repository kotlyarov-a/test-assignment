import { IsBoolean, IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsUUID()
  @IsOptional()
  id?: string;
  
  @IsString()
  @IsOptional()
  slug: string;
  
  @IsString()
  @IsOptional()
  name: string;
  
  @IsString()
  @IsOptional()
  description?: string;
  
  @IsDate()
  @IsOptional()
  createdDate: Date;
  
  @IsBoolean()
  @IsOptional()
  active: boolean;
}
