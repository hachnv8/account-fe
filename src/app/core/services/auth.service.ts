import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/store/Authentication/auth.models';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {

    user: User | null = null;

    constructor(private http: HttpClient) { }

    /**
     * Returns the current user from localStorage
     */
    public currentUser(): User | null {
        if (!this.user) {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.user = JSON.parse(storedUser);
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
                const user: User = response;
                if (user && user.token) {
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    localStorage.setItem('token', user.token);
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
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        this.user = null;
    }
}
