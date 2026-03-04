import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/store/Authentication/auth.models';
import { environment } from 'src/environments/environment';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    user: User | null = null;

    constructor(private http: HttpClient, private tokenStorageService: TokenStorageService) { }

    /**
     * Returns the current user from localStorage
     */
    public currentUser(): User | null {
        if (!this.user) {
            const storedUser = this.tokenStorageService.getUser();
            if (storedUser && Object.keys(storedUser).length > 0) {
                this.user = storedUser;
            }
        }
        return this.user;
    }

    /**
     * Performs the auth
     * @param email email of user
     * @param password password of user
     */
    login(email: string, password: string): Observable<User> {
        return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
            map((response) => {
                // Adjust for data wrapper if exist based on backend guides
                // e.g., if response is { code: 1006, data: { token: '...', id: 1 ... } }
                const user: User = response.data ? response.data : response;

                if (user && user.token) {
                    this.tokenStorageService.saveUser(user);
                    this.tokenStorageService.saveToken(user.token);
                    this.user = user;
                }
                return user;
            })
        );
    }

    /**
     * Performs the register
     * @param user user data
     */
    register(user: User): Observable<User> {
        return this.http.post<User>(`${environment.apiUrl}/auth/register`, user);
    }

    /**
     * Reset password
     * @param email email
     */
    resetPassword(email: string): Observable<any> {
        return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
    }

    /**
     * Logout the user
     */
    logout() {
        this.tokenStorageService.signOut();
        this.user = null;
    }
}
