import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, ParseBoolPipe, ParseIntPipe, ParseUUIDPipe, Patch, Post, Put, Query, ValidationPipe } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryDto } from './dto/category.dto';
import { FilterCategoriesDto } from './dto/filterCategories.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';

@Controller('categories')
export class CategoriesController {
	constructor(
		private readonly categoriesService: CategoriesService,
	) { }

	@Get(':id')
	async get(@Param('id', new ParseUUIDPipe()) id: string) {
		let category = await this.categoriesService.getById(id);
		if (!category) throw new HttpException('Не найдено', HttpStatus.NOT_FOUND);
		return category;
	}

	@Get('slug/:slug')
	async getBySlug(@Param('slug') slug: string) {
		let category = await this.categoriesService.getBySlug(slug);
		if (!category) throw new HttpException('Не найдено', HttpStatus.NOT_FOUND);
		return category;
	}

	@Get()
	async getByFilter(
		@Query(new ValidationPipe()) filters: FilterCategoriesDto,
	) {
		let categories = await this.categoriesService.search(filters)
		if (!categories) throw new HttpException('Не найдено', HttpStatus.NOT_FOUND);
		return categories;
	}

	@Patch(':id')
	async patch(
		@Param('id', new ParseUUIDPipe()) id: string,
		@Body(new ValidationPipe()) updateCategoryDto: UpdateCategoryDto
	) {
		return this.categoriesService.update(id, updateCategoryDto);
	}

	@Delete(':id')
	async delete(
		@Param('id', new ParseUUIDPipe()) id: string,
	) {
		let deletedCategory = await this.categoriesService.delete(id);
		if (!deletedCategory) throw new HttpException('Не найдено', HttpStatus.NOT_FOUND);
		return deletedCategory;
	}

	@Post()
	async create(@Body(new ValidationPipe()) createCategoryDto: CategoryDto) {
		let category = await this.categoriesService.getBySlug(createCategoryDto.slug);
		if (category) throw new HttpException(`Category with slug ${createCategoryDto.slug} already exist`, HttpStatus.BAD_REQUEST);
		return this.categoriesService.create(createCategoryDto);
	}

}
