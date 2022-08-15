import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { CategoryDto } from 'src/categories/dto/category.dto';

describe('TEST CRUD API (e2e)', () => {
  let app: INestApplication;

  let newCategoryDto: CategoryDto = {
    "name": "Категория1",
    "slug": "cat1",
    "active": true,
    "description": "Описание1"
  }

  let newCategoryId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    app.close();
  })

  it('/categories POST', async () => {
    const response = await request(app.getHttpServer())
      .post('/categories')
      .send(newCategoryDto)
      .expect(201);
    newCategoryId = JSON.parse(response.text).id;
  });

  it('/categories GET by Id', async () => {
    const response = await request(app.getHttpServer())
      .get(`/categories/` + newCategoryId)
      .expect(200);
    let newCategory = JSON.parse(response.text);
    expect(newCategory).toMatchObject(newCategoryDto);
  });

  it('/categories GET by slug', async () => {
    const response = await request(app.getHttpServer())
      .get(`/categories/slug/` + newCategoryDto.slug)
      .expect(200);
    let newCategory = JSON.parse(response.text);
    expect(newCategory).toMatchObject(newCategoryDto);
  });

  it('/categories PATCH slug', async () => {
    newCategoryDto.slug = 'cat2';
    const response = await request(app.getHttpServer())
      .patch(`/categories/` + newCategoryId)
      .send({ "slug": newCategoryDto.slug })
      .expect(200);
    let newCategoryPatched = JSON.parse(response.text);
    expect(newCategoryPatched).toMatchObject(newCategoryDto);
  });

  it('/categories PATCH name', async () => {
    newCategoryDto.name = 'Категория2';
    const response = await request(app.getHttpServer())
      .patch(`/categories/` + newCategoryId)
      .send({ "name": newCategoryDto.name })
      .expect(200);
    let newCategoryPatched = JSON.parse(response.text);
    expect(newCategoryPatched).toMatchObject(newCategoryDto);
  });

  it('/categories PATCH description', async () => {
    newCategoryDto.description = "Описание2";
    const response = await request(app.getHttpServer())
      .patch(`/categories/` + newCategoryId)
      .send({ "description": newCategoryDto.description })
      .expect(200);
    let newCategoryPatched = JSON.parse(response.text);
    expect(newCategoryPatched).toMatchObject(newCategoryDto);
  });

  it('/categories PATCH active', async () => {
    newCategoryDto.active = false;
    const response = await request(app.getHttpServer())
      .patch(`/categories/` + newCategoryId)
      .send({ "active": newCategoryDto.active })
      .expect(200);
    let newCategoryPatched = JSON.parse(response.text);
    expect(newCategoryPatched).toMatchObject(newCategoryDto);
  });

  it('/categories PATCH whole model', async () => {
    newCategoryDto.slug = 'cat3';
    newCategoryDto.name = 'Категория3';
    newCategoryDto.description = 'Описание3';
    newCategoryDto.active = true;
    const response = await request(app.getHttpServer())
      .patch(`/categories/` + newCategoryId)
      .send(newCategoryDto)
      .expect(200);
    let newCategoryPatched = JSON.parse(response.text);
    expect(newCategoryPatched).toMatchObject(newCategoryDto);
  });

  it('/categories DELETE newCategory', async () => {
    const response = await request(app.getHttpServer())
      .delete('/categories/' + newCategoryId)
      .expect(200);
    let newCategoryDeleted = JSON.parse(response.text);
    expect(newCategoryDeleted).toMatchObject(newCategoryDto);
  })

});


describe('TEST filters(e2e)', () => {
  let app: INestApplication;

  let newCategories: CategoryDto[] = [];

  for (let i = 0; i < 10; i++) {
    newCategories.push({
      name: `Категория ${i}`,
      slug: `cat${i}`,
      active: true,
      description: `Описание${i}`
    })
  }

  newCategories.push({
    name: `Мёд ёж`,
    slug: `cat${newCategories.length}`,
    active: true,
    description: `Мёд ёж ёлка`
  })

  newCategories.push({
    name: `Тапочки`,
    slug: `cat${newCategories.length}`,
    active: true,
    description: `Текст`
  })

  let randomCategory = newCategories[Math.floor(Math.random() * newCategories.length)];
  randomCategory.active = false;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    app.close();
  })

  for (const newCategoryDto of newCategories) {
    it('/categories POST', async () => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .send(newCategoryDto)
        .expect(201);
    });
  }

  // Поиск категорий по полю name
  it('by name', async () => {
    const response = await request(app.getHttpServer())
      .get(`/categories/?name=` + encodeURIComponent(randomCategory.name))
      .expect(200);
    let categories = JSON.parse(response.text);
    expect(categories.length).toBeGreaterThan(0);
  });

  // По вхождение переданного текста без учета регистра
  it('by name UpperCase', async () => {
    const response1 = await request(app.getHttpServer())
      .get(`/categories/?name=` + encodeURIComponent(randomCategory.name).toUpperCase())
      .expect(200);
    let categories1 = JSON.parse(response1.text);
    expect(categories1.length).toBeGreaterThan(0);

    const response2 = await request(app.getHttpServer())
      .get(`/categories/?name=` + encodeURIComponent(randomCategory.name).toLowerCase())
      .expect(200);
    let categories2 = JSON.parse(response2.text);
    expect(categories2.length).toBeGreaterThan(0);
  });

  // Например категория “Мёд”. Запрос “?name=мед” найдет категорию
  // Мёд
  it('by name', async () => {
    let searchStrings: string[] = ['ёж', 'мед'];
    for (let i = 0; i < searchStrings.length; i++) {
      const searchString = searchStrings[i];
      const response = await request(app.getHttpServer())
        .get(`/categories/?name=` + encodeURIComponent(searchString))
        .expect(200);
      let categories = JSON.parse(response.text);
      expect(categories.length).toBeGreaterThan(0);
    }
  });

  // Все условия от поля name, но поиск идет по полю description
  it('by description', async () => {
    const response = await request(app.getHttpServer())
      .get(`/categories/?description=` + encodeURIComponent(randomCategory.description))
      .expect(200);
    let categories = JSON.parse(response.text);
    expect(categories.length).toBeGreaterThan(0);
  });

  it('by description UpperCase', async () => {
    const response1 = await request(app.getHttpServer())
      .get(`/categories/?description=` + encodeURIComponent(randomCategory.description).toUpperCase())
      .expect(200);
    let categories1 = JSON.parse(response1.text);
    expect(categories1.length).toBeGreaterThan(0);

    const response2 = await request(app.getHttpServer())
      .get(`/categories/?description=` + encodeURIComponent(randomCategory.description).toLowerCase())
      .expect(200);
    let categories2 = JSON.parse(response2.text);
    expect(categories2.length).toBeGreaterThan(0);
  });

  it('by description', async () => {
    let searchStrings: string[] = ['ёлка', 'елка'];
    for (let i = 0; i < searchStrings.length; i++) {
      const searchString = searchStrings[i];
      const response = await request(app.getHttpServer())
        .get(`/categories/?description=` + encodeURIComponent(searchString))
        .expect(200);
      let categories = JSON.parse(response.text);
      expect(categories.length).toBeGreaterThan(0);
    }
  });

  // Поиск по полю active
  // Поддерживаемые значения в параметрах: 0, false, 1, true.
  // Например active=1 или active=true отдаем только активные категории
  // active=0 или active=false отдаем только неактивные категории
  it('by active', async () => {
    let pageSize = 8;
    await run(['true', '1'], true);
    await run(['false', '0'], false);
    async function run(searchStrings: string[], value: boolean) {
      for (let i = 0; i < searchStrings.length; i++) {
        const searchString = searchStrings[i];
        const response = await request(app.getHttpServer())
          .get(`/categories/?active=` + encodeURIComponent(searchString) + `&pageSize=${pageSize}`)
          .expect(200);
        let categories = JSON.parse(response.text);
        expect(categories.length).toBe(newCategories.filter(c => c.active === value).slice(0, pageSize).length);
      }
    }
  });

  // Все условия от поля name и description
  // Поиск осуществляется по полю name и description через “или”
  // Переданные фильтры по name и description должны игнорироваться
  // Например ?name=тапочки&description=текст&search=мед
  // При таком запросе фильтры name и description игнорируются
  it('search', async () => {
    let url = `/categories/?name=${encodeURIComponent("тапочки")}&description=${encodeURIComponent('текст')}`;
    const response1 = await request(app.getHttpServer())
      .get(url)
      .expect(200);
    let categories1 = JSON.parse(response1.text);
    expect(categories1.length).toBeGreaterThan(0);
    expect(categories1.filter((c: CategoryDto) => c.name === 'Тапочки').length).toBe(1)

    const response2 = await request(app.getHttpServer())
      .get(url + `&search=${encodeURIComponent('мед')}`)
      .expect(200);
    let categories2 = JSON.parse(response2.text);
    expect(categories2.length).toBeGreaterThan(0);
    expect(categories2.filter((c: CategoryDto) => c.name === 'Тапочки').length).toBe(0)
  });

  // Кол-во записей на страницу. Допустимы только цифры от 1-9
  // Например pageSize=1. В ответе увидим только одну запись,
  // т.е одну категория.
  // При условии что есть записи в бд с переданными фильтрами
  // По умолчанию 2
  it('pageSize', async () => {
    let pageSize = 4;
    const response = await request(app.getHttpServer())
      .get(`/categories/?name=${encodeURI('категория')}&pageSize=` + pageSize)
      .expect(200);
    let categories = JSON.parse(response.text);
    expect(categories.length).toBe(pageSize);
  });
  it('pageSize', async () => {
    const response = await request(app.getHttpServer())
      .get(`/categories/?name=${encodeURI('категория')}`)
      .expect(200);
    let categories = JSON.parse(response.text);
    expect(categories.length).toBe(2);
  });
  it('pageSize', async () => {
    let pageSizes = ['0', '22', 'фыва'];
    for (let i = 0; i < pageSizes.length; i++) {
      await request(app.getHttpServer())
        .get(`/categories/?name=${encodeURI('категория')}&pageSize=` + encodeURIComponent(pageSizes[i]))
        .expect(400);
    }
  });

  // Номер страницы. Допустимы только цифры
  // 0 и 1 являются первой страницей.
  // В ответ приходит кол-во записей с учетом pageSize
  // Например у нас в бд есть 4 записи(категории)
  // Запрос: “?page=1&pageSize=2”.
  // Ответ: первые две записи.
  // Запрос: “?page=2&pageSize=2”.
  // Ответ: следующие две записи
  it('page', async () => {
    let pageSize = 3;
    let page = 1;
    let url = `/categories/?name=${encodeURI('категория')}&pageSize=` + pageSize + '&sort=-name ASC';
    const response1 = await request(app.getHttpServer())
      .get(url + '&page=' + page)
      .expect(200);
    let categories1 = JSON.parse(response1.text);
    expect(categories1.pop().slug).toBe('cat2');
    page = 2;
    const response2 = await request(app.getHttpServer())
      .get(url + '&page=' + page)
      .expect(200);
    let categories2 = JSON.parse(response2.text);
    expect(categories2.pop().slug).toBe('cat5');
  });

  it('clear db', async () => {
    const response1 = await request(app.getHttpServer())
      .get('/categories/?pageSize=9')
      .expect(200);
    let categories1 = JSON.parse(response1.text);
    await deleteCategories(categories1)
    const response2 = await request(app.getHttpServer())
      .get('/categories/?pageSize=9')
      .expect(200);
    let categories2 = JSON.parse(response2.text);
    await deleteCategories(categories2)

    async function deleteCategories(categories) {
      for (const category of categories) {
        const response = await request(app.getHttpServer())
          .delete('/categories/' + category.id)
          .expect(200);
      }
    }
  })

});
