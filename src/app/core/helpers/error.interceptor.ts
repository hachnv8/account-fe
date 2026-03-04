import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';
import { ErrorCodes } from '../constants/error-codes';
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(
        private tokenStorageService: TokenStorageService,
        private router: Router
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if (err.status === 401) {
                // auto logout if 401 response returned from api
                this.tokenStorageService.signOut();

                // preservation of returnUrl
                const currentUrl = this.router.url;
                if (!currentUrl.includes('/auth/login')) {
                    this.router.navigate(['/auth/login'], { queryParams: { returnUrl: currentUrl } });
                }
            } else if (err.status === 400 && err.error) {
                const apiCode = err.error.code;

                if (apiCode === ErrorCodes.WRONG_PASSWORD) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Sai mật khẩu!'
                    });
                } else if (apiCode === ErrorCodes.USER_EXISTED) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Tài khoản đã tồn tại!'
                    });
                } else if (apiCode === ErrorCodes.USER_NOT_EXISTED) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Tài khoản không tồn tại!'
                    });
                }
            } else if (err.status === 500) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Lỗi hệ thống, vui lòng thử lại sau!'
                });
            } else if (err.status === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi kết nối',
                    text: 'Không thể kết nối đến máy chủ (ERR_CONNECTION_REFUSED)!'
                });
            }

            // Lấy ra message từ API response Wrapper (ví dụ { code: 1008, message: "Incorrect password" })
            const error = err.error?.message || err.statusText;
            return throwError(() => error);
        }))
    }
}
