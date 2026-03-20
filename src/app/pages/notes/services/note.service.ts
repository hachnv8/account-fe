import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NoteService {

    // Assuming a standard REST endpoint for notes
    private apiUrl = `${environment.apiUrl}/notes`;

    constructor(private http: HttpClient) { }

    /**
     * Get all notes
     * GET /api/notes
     */
    getNotes(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    /**
     * Get a note by ID
     * GET /api/notes/{id}
     * @param id Note ID
     */
    getNoteById(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    /**
     * Add a new note
     * POST /api/notes
     * @param note Note data
     */
    addNote(note: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, note);
    }

    /**
     * Update an existing note
     * PUT /api/notes/{id}
     * @param id Note ID
     * @param note Updated note data
     */
    updateNote(id: number, note: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/${id}`, note);
    }

    /**
     * Delete a note
     * DELETE /api/notes/{id}
     * @param id Note ID
     */
    deleteNote(id: number): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/${id}`);
    }
}
