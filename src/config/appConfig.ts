import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { Category } from '../categories/entities/category.entity';

export const mysqlConfig: TypeOrmModuleOptions = {
	type: 'mysql',
	host: '10.10.1.4',
	port: 3306,
	username: 'admin',
	password: '12345679',
	database: 'test-assignment-nest-js',
	entities: [Category],
	keepConnectionAlive: true,
	synchronize: true,
}