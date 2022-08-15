import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { mysqlConfig } from './config/appConfig';

@Module({
  imports: [
    CategoriesModule,
    TypeOrmModule.forRoot(mysqlConfig)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
