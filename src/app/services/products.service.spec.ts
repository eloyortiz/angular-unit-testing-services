import { HTTP_INTERCEPTORS, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { TokenInterceptor } from '../interceptors/token.interceptor';
import { generateManyProducts, generateOneProduct } from "../models/product.mock";
import { CreateProductDTO, Product, UpdateProductDTO } from '../models/product.model';
import { environment } from "./../../environments/environment";
import { ProductsService } from "./products.service";
import { TokenService } from './token.service';

describe('Product Service', () => {
  let productService: ProductsService;
  let httpController: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers:[
        ProductsService,
        TokenService,
        {
          provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true
        }
      ]
    });
    productService = TestBed.inject(ProductsService);
    httpController = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('Should be create', () => {
    expect(productService).toBeTruthy();
  });

  describe('test for getAllSimple', () => {
    it('should return a product list', (doneFn) => {
      //Arrange
      const mockData: Product[] = generateManyProducts(2);
      spyOn(tokenService, 'getToken').and.returnValue('123');
      //Act
      productService.getAllSimple().subscribe((data) => {
        //Assert
        expect(data.length).toEqual(mockData.length);
        expect(data).toEqual(mockData);
        doneFn();
      });

      //http config
      const url = `${environment.API_URL}/api/v1/products`;
      const request = httpController.expectOne(url);
      const headers = request.request.headers;
      expect(headers.get('Authorization')).toEqual('Bearer 123');
      request.flush(mockData);
    });
  });

  describe('test for getAll', () => {
    it('should return a product list', (doneFn) => {
      //Arrange
      const mockData: Product[] = generateManyProducts(3);
      //Act
      productService.getAll().subscribe((data) => {
        //Assert
        expect(data.length).toEqual(mockData.length);
        doneFn();
      });

      //http config
      const url = `${environment.API_URL}/api/v1/products`;
      const request = httpController.expectOne(url);
      request.flush(mockData);
    });

    it('should return product list with taxes', (doneFn) => {
      //Arrange
      const mockData: Product[] = [
        {
          ...generateOneProduct(),
          price: 100, // 100* .19 = 19
        },
        {
          ...generateOneProduct(),
          price: 200, // 200* .19 = 38
        },
        {
          ...generateOneProduct(),
          price: 0, // 0* .19 = 0
        },
        {
          ...generateOneProduct(),
          price: -100, // = 0
        }
      ];
      //Act
      productService.getAll().subscribe((data) => {
        //Assert
        expect(data.length).toEqual(mockData.length);
        expect(data[0].taxes).toEqual(19);
        expect(data[1].taxes).toEqual(38);
        expect(data[2].taxes).toEqual(0);
        expect(data[3].taxes).toEqual(0);
        doneFn();
      });

      //http config
      const url = `${environment.API_URL}/api/v1/products`;
      const request = httpController.expectOne(url);
      request.flush(mockData);
    });

    it('should send query params with limit 10 and offset 3', (doneFn) => {
      //Arrange
      const mockData: Product[] = generateManyProducts(3);
      const limit = 10;
      const offset = 3;
      //Act
      productService.getAll(limit, offset).subscribe((data) => {
        //Assert
        expect(data.length).toEqual(mockData.length);
        doneFn();
      });

      //http config
      const url = `${environment.API_URL}/api/v1/products?limit=${limit}&offset=${offset}`;
      const request = httpController.expectOne(url);
      request.flush(mockData);
      const params = request.request.params;
      expect(params.get('limit')).toEqual(`${limit}`);
      expect(params.get('offset')).toEqual(`${offset}`);
    });

  });

  describe('test for create product', () => {

    it('should return a new product', (doneFn) => {
      //Arrange
      const mockData: Product = generateOneProduct();
      const dto: CreateProductDTO = {
        title: 'new Product',
        price: 123,
        images: ['img'],
        description: 'description',
        categoryId: 12
      }
      //Act
      productService.create({...dto}).subscribe( data => {
        //Assert
        expect(data).toEqual(mockData);
        doneFn();
      });

       //http config
       const url = `${environment.API_URL}/api/v1/products`;
       const request = httpController.expectOne(url);
       expect(request.request.body).toEqual(dto);
       expect(request.request.method).toEqual('POST');
       request.flush(mockData);
    });

  });

  describe('test for update product', () => {

    it('should return an updated product', (doneFn) => {
      //Arrange
      const mockData: Product = generateOneProduct();
      const dto: UpdateProductDTO = {
        title: 'updated Product',
      }
      const productId = '123';
      //Act
      productService.update(productId,{...dto}).subscribe( data => {
        //Assert
        expect(data).toEqual(mockData);
        doneFn();
      });

       //http config
       const url = `${environment.API_URL}/api/v1/products/${productId}`;
       const request = httpController.expectOne(url);
       expect(request.request.body).toEqual(dto);
       expect(request.request.method).toEqual('PUT');
       request.flush(mockData);
    });

  });

  describe('test for delete product', () => {

    it('should delete a product, return if it was deleted', (doneFn) => {
      //Arrange
      const mockData: boolean = true;
      const productId = '123';
      //Act
      productService.delete(productId).subscribe( data => {
        //Assert
        expect(data).toEqual(mockData);
        doneFn();
      });

       //http config
       const url = `${environment.API_URL}/api/v1/products/${productId}`;
       const request = httpController.expectOne(url);
       expect(request.request.method).toEqual('DELETE');
       request.flush(mockData);
    });

  });

  describe('test for getOne', () => {

    it('should return a product', (doneFn) => {
      //Arrange
      const mockData: Product = generateOneProduct();
      const productId = '123';
      //Act
      productService.getOne(productId).subscribe( data => {
        //Assert
        expect(data).toEqual(mockData);
        doneFn();
      });

       //http config
       const url = `${environment.API_URL}/api/v1/products/${productId}`;
       const request = httpController.expectOne(url);
       expect(request.request.method).toEqual('GET');
       request.flush(mockData);
    });

    describe('Erros outputs', () => {
      it('should return the right message when status code is 401', (doneFn) => {
        //Arrange
        const productId = '123';
        const msgError = '401 message';
        const mockError = {
          status: HttpStatusCode.Unauthorized,
          statusText: msgError,
        };
        //Act
        productService.getOne(productId).subscribe({
          error: (err) => {
            //Assert
            expect(err).toEqual('No estas permitido');
            doneFn();
          },
        });

        //http config
        const url = `${environment.API_URL}/api/v1/products/${productId}`;
        const request = httpController.expectOne(url);
        expect(request.request.method).toEqual('GET');
        request.flush(msgError, mockError);
      });

      it('should return the right message when status code is 404', (doneFn) => {
        //Arrange
        const productId = '123';
        const msgError = '404 message';
        const mockError = {
          status: HttpStatusCode.NotFound,
          statusText: msgError
        }
        //Act
        productService.getOne(productId).subscribe({
          error: (err) => {
            //Assert
            expect(err).toEqual('El producto no existe');
            doneFn();
          }
        });

         //http config
         const url = `${environment.API_URL}/api/v1/products/${productId}`;
         const request = httpController.expectOne(url);
         expect(request.request.method).toEqual('GET');
         request.flush(msgError, mockError);
      });

      it('should return the right message when status code is 409', (doneFn) => {
        //Arrange
        const productId = '123';
        const msgError = '409 message';
        const mockError = {
          status: HttpStatusCode.Conflict,
          statusText: msgError
        }
        //Act
        productService.getOne(productId).subscribe({
          error: (err) => {
            //Assert
            expect(err).toEqual('Algo esta fallando en el server');
            doneFn();
          }
        });

         //http config
         const url = `${environment.API_URL}/api/v1/products/${productId}`;
         const request = httpController.expectOne(url);
         expect(request.request.method).toEqual('GET');
         request.flush(msgError, mockError);
      });

      it('should return the right message when status code is undefined', (doneFn) => {
        //Arrange
        const productId = '123';
        const msgError = 'Generic error message';
        const mockError = {
          status: HttpStatusCode?.BadRequest,
          statusText: msgError
        }
        //Act
        productService.getOne(productId).subscribe({
          error: (err) => {
            //Assert
            expect(err).toEqual('Ups algo salio mal');
            doneFn();
          }
        });

         //http config
         const url = `${environment.API_URL}/api/v1/products/${productId}`;
         const request = httpController.expectOne(url);
         expect(request.request.method).toEqual('GET');
         request.flush(msgError, mockError);
      });
    });

  });

});
