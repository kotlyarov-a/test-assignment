import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, IsNull, Like, Not, Repository } from 'typeorm';
import { CategoryDto } from './dto/category.dto';
import { FilterCategoriesDto } from './dto/filterCategories.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private categoryRepository: Repository<Category>,
	) { }

	async findAll(): Promise<CategoryDto[]> {
		return this.categoryRepository.find();
	}

	async create(categoryDto: CategoryDto): Promise<CategoryDto> {
		let category = new Category();
		Object.assign(category, categoryDto);
		this.addSeachableFields(category);
		category.createdDate = new Date();
		let saved = await this.categoryRepository.save(category);
		return saved;
	}

	async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDto> {
		const category = await this.categoryRepository.findOne({
			where: { id: id },
		});
		Object.assign(category, updateCategoryDto);
		this.addSeachableFields(category);
		let updated = await this.categoryRepository.update({ id }, category);
		return category;
	}

	async delete(id: string): Promise<CategoryDto | null> {
		let category = await this.categoryRepository.findOne({
			where: { id },
		})
		if (!category) return category;
		let deleted = await this.categoryRepository.remove(category);
		return deleted;
	}

	async getById(id: string): Promise<CategoryDto | null> {
		const category = await this.categoryRepository.findOne({
			where: { id },
		});
		if (category) this.deleteSeachableFields(category);
		return category
	}

	async getBySlug(slug: string): Promise<CategoryDto> {
		const category = await this.categoryRepository.findOne({
			where: { slug },
		});
		return category;
	}

	async search(filters: FilterCategoriesDto): Promise<CategoryDto[]> {
		let category = await this.categoryRepository.findOne({
			where: {
				id: Not(IsNull())
			}
		});
		let options: FindManyOptions = { where: {} }
		options.order = {};
		for (const key in filters) {
			if (key === 'name') {
				let seachableString = convertToSearhableString(filters[key]);
				options.where['seachableName'] = Like(`%${seachableString}%`);
			} else if (key === 'description') {
				let seachableString = convertToSearhableString(filters[key]);
				options.where['seachableDescription'] = Like(`%${seachableString}%`);
			} else if (key === 'active') {
				if (filters[key] === 'true' || filters[key] === '1') options.where[key] = '1'
				if (filters[key] === 'false' || filters[key] === '0') options.where[key] = '0'
			} else if (key === 'search') {
				let seachableString = convertToSearhableString(filters[key]);
				options.where['seachableName'] = Like(`%${seachableString}%`);
				options.where['seachableDescription'] = Like(`%${seachableString}%`);
			} else if (key === 'pageSize') {
				options.take = filters[key];
			} else if (key === 'page') {
				let page = filters[key];
				if (page > 1) {
					options.skip = options.take * (page - 1);
				}
			} else if (key === 'sort') {
				let sortParams: any = filters[key].split(" ");
				let sortDirection: any = "ASC";
				let sortField: string = "";
				if (Array.isArray(sortParams)) {
					sortField = sortParams[0].replace("-", "");
					if (sortParams.length == 2) {
						sortDirection = sortParams[1]
					}
				} else {
					sortField = sortParams.replace("-", "");
				}
				if (category[sortField]) {
					options.order[sortField] = "ASC";
					if (sortDirection) {
						options.order[sortField] = sortDirection;
					}
				}
			}
		}
		if (!options.take) options.take = 2;
		if (Object.keys(options.order).length === 0) options.order = { createdDate: "ASC" }
		let categories = await this.categoryRepository.find(options);
		return categories.map((category: Category) => {
			this.deleteSeachableFields(category);
			return category;
		});
	}

	addSeachableFields(category: Category): void {
		category.seachableName = convertToSearhableString(category.name);
		category.seachableDescription = convertToSearhableString(category.description);
	}

	deleteSeachableFields(category: Category): void {
		delete category.seachableName;
		delete category.seachableDescription;
	}
}

function convertToSearhableString(source: string): string {
	let searchabeString: string = "";
	if (!source) return searchabeString;
	searchabeString = source.toLowerCase();
	searchabeString = searchabeString.replaceAll('ё', 'е');
	return searchabeString;
}