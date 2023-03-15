import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TokenInterceptor } from '../interceptors/token.interceptor';
import { Auth } from '../models/auth.model';
import { environment } from './../../environments/environment';
import { AuthService } from './auth.service';
import { TokenService } from './token.service';

describe('AuthService', () => {
  let authService: AuthService;
  let httpController: HttpTestingController;
  let tokenService: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        TokenService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true,
        },
      ],
    });
    authService = TestBed.inject(AuthService);
    httpController = TestBed.inject(HttpTestingController);
    tokenService = TestBed.inject(TokenService);
  });

  afterEach(() => {
    httpController.verify();
  });

  it('Should be create', () => {
    expect(authService).toBeTruthy();
  });

  describe('Test for login', () => {
    it('should return a token', (doneFn) => {
      //Arrange
      const mockData: Auth = {
        access_token: '121212',
      };
      const email = 'john@doe.com';
      const password = '123123';

      //Act
      authService.login(email, password).subscribe((data) => {
        //Assert
        expect(data).toEqual(mockData);
        doneFn();
      });

      //http config
      const url = `${environment.API_URL}/api/v1/auth/login`;
      const request = httpController.expectOne({ method: 'POST' });
      request.flush(mockData);
    });

    it('should call to save token', (doneFn) => {
      //Arrange
      const mockData: Auth = {
        access_token: '121212',
      };
      const email = 'john@doe.com';
      const password = '123123';
      spyOn(tokenService, 'saveToken').and.callThrough();

      //Act
      authService.login(email, password).subscribe((data) => {
        //Assert
        expect(data).toEqual(mockData);
        expect(tokenService.saveToken).toHaveBeenCalledTimes(1);
        expect(tokenService.saveToken).toHaveBeenCalledOnceWith('121212');
        doneFn();
      });

      //http config
      const url = `${environment.API_URL}/api/v1/auth/login`;
      const request = httpController.expectOne({ method: 'POST' });
      request.flush(mockData);
    });
  });
});
