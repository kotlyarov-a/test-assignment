import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterCategoriesDto {

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsIn(['0', 'false', '1', 'true'])
  @IsOptional()
  active?: '0' | 'false' | '1' | 'true';

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumberString()
  @IsOptional()
  @IsIn(['1', '2', '3', '4', '5', '6', '7', '8', '9'], {
    message: 'Допустимы только цифры от 1-9',
  })
  pageSize?: number;

  @IsNumberString()
  @IsOptional()
  page?: number;

  @IsString()
  sort?: "-active" | "-active ASC" | "-active DESC" |
    "-slug" | "-slug ASC" | "-slug DESC" |
    "-name" | "-name ASC" | "-name DESC" |
    "-createdDate" | "-createdDate ASC" | "-createdDate DESC" |
    "-description" | "-description ASC" | "-description DESC"
    ;
}