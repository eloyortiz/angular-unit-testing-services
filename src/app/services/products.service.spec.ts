import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { generateManyProducts } from "../models/product.mock";
import { Product } from "../models/product.model";
import { environment } from "./../../environments/environment";
import { ProductsService } from "./products.service";

fdescribe('Product Service', () => {
  let productService: ProductsService;
  let httpController: HttpTestingController;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers:[
        ProductsService
      ]
    });
    productService = TestBed.inject(ProductsService);
    httpController = TestBed.inject(HttpTestingController);
  });

  it('Should be create', () => {
    expect(productService).toBeTruthy();
  });

  describe('test for getAllSimple', () => {
    it('should return a product list', (doneFn) => {
      //Arrange
      const mockData: Product[] = generateManyProducts(2);
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
      request.flush(mockData);
      httpController.verify();
    });
  });


});
