import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    private apiUrl = `${environment.apiUrl}/account/list`;

    constructor(private http: HttpClient) { }

    /**
     * Get all accounts
     * GET /api/account/list
     */
    getAccounts(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    /**
     * Add a new account
     * POST /api/account/list
     * @param account Account data
     */
    addAccount(account: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, account);
    }

    /**
     * Update an existing account
     * PUT /api/account/list/{id}
     * @param id Account ID
     * @param account Updated account data
     */
    updateAccount(id: number, account: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, account);
    }

    /**
     * Delete an account
     * DELETE /api/account/list/{id}
     * @param id Account ID
     */
    deleteAccount(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
