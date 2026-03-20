import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { NoteService } from '../services/note.service';
import Swal from 'sweetalert2';

export interface Note {
  id: number;
  title: string;
  content: string;
  projectName: string;
  type: string;
  priority: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-notes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PagetitleComponent, ModalModule, PaginationModule],
  templateUrl: './notes-list.component.html',
  styleUrl: './notes-list.component.css',
})
export class NotesListComponent implements OnInit {

  breadCrumbItems: Array<{}>;

  constructor(private router: Router, private noteService: NoteService) {}

  // Data
  notesList: Note[] = [];
  filteredNotesList: Note[] = [];
  pagedNotes: Note[] = [];

  // Pagination
  totalNotes: number = 0;
  notesPage: number = 1;
  notesItemsPerPage: number = 10;

  isLoading: boolean = false;

  // Search
  searchTerm: string = '';

  // View detail
  selectedNote: Note | null = null;

  // Modal
  @ViewChild('viewNoteModal', { static: false }) viewNoteModal?: ModalDirective;

  // Type options
  typeOptions = [
    { value: 'meeting', label: 'Meeting Minutes', icon: 'bx bx-group', class: 'bg-primary-subtle text-primary' },
    { value: 'feature', label: 'New Feature', icon: 'bx bx-bulb', class: 'bg-success-subtle text-success' },
    { value: 'bug', label: 'Bug Report', icon: 'bx bx-bug', class: 'bg-danger-subtle text-danger' },
    { value: 'task', label: 'Task', icon: 'bx bx-task', class: 'bg-info-subtle text-info' },
    { value: 'idea', label: 'Idea', icon: 'bx bx-star', class: 'bg-warning-subtle text-warning' },
    { value: 'other', label: 'Other', icon: 'bx bx-note', class: 'bg-secondary-subtle text-secondary' }
  ];

  // Priority options
  priorityOptions = [
    { value: 'high', label: 'High', class: 'bg-danger' },
    { value: 'medium', label: 'Medium', class: 'bg-warning' },
    { value: 'low', label: 'Low', class: 'bg-info' }
  ];

  // Status options
  statusOptions = [
    { value: 'open', label: 'Open', class: 'bg-primary' },
    { value: 'in_progress', label: 'In Progress', class: 'bg-info' },
    { value: 'done', label: 'Done', class: 'bg-success' },
    { value: 'archived', label: 'Archived', class: 'bg-secondary' }
  ];

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Notes' }, { label: 'Notes List', active: true }];
    this.loadMockData();
  }

  loadMockData() {
    this.isLoading = true;
    this.noteService.getNotes().subscribe({
      next: (data) => {
        this.notesList = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching notes', err);
        // Fallback to empty list or keep mock data if backend fails
        this.notesList = [];
        this.applyFilter();
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.notesPage = 1;
    this.applyFilter();
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      this.filteredNotesList = this.notesList.filter(n =>
        (n.title && n.title.toLowerCase().includes(term)) ||
        (n.projectName && n.projectName.toLowerCase().includes(term)) ||
        (n.type && n.type.toLowerCase().includes(term)) ||
        (n.createdBy && n.createdBy.toLowerCase().includes(term))
      );
    } else {
      this.filteredNotesList = [...this.notesList];
    }
    this.totalNotes = this.filteredNotesList.length;
    this.updatePagedNotes();
  }

  updatePagedNotes() {
    const startIndex = (this.notesPage - 1) * this.notesItemsPerPage;
    const endIndex = startIndex + this.notesItemsPerPage;
    this.pagedNotes = this.filteredNotesList.slice(startIndex, endIndex);
  }

  notesPageChanged(event: any) {
    this.notesPage = event.page;
    this.updatePagedNotes();
  }

  refreshData() {
    this.loadMockData();
  }

  // Get config helpers
  getTypeConfig(type: string) {
    return this.typeOptions.find(t => t.value === type) || this.typeOptions[5];
  }

  getPriorityConfig(priority: string) {
    return this.priorityOptions.find(p => p.value === priority) || this.priorityOptions[2];
  }

  getStatusConfig(status: string) {
    return this.statusOptions.find(s => s.value === status) || this.statusOptions[0];
  }

  // View Note -> direct to editor now
  viewNote(note: Note) {
    this.editNote(note);
  }

  // Edit Note
  editNote(note: Note) {
    if (note.id) {
        this.router.navigate(['/notes', note.id]);
    } else {
        this.router.navigate(['/notes', 'new']);
    }
  }

  getPlainText(content: string): string {
    if (!content) return '';
    if (!content.trim().startsWith('{')) return content; // Not JSON

    try {
      const parsed = JSON.parse(content);
      if (parsed && parsed.blocks) {
        return parsed.blocks.map((b: any) => {
          if (b.type === 'paragraph' || b.type === 'header') {
            return b.data.text.replace(/<[^>]*>?/gm, ''); // strip HTML tags
          }
          if (b.type === 'list') {
            return b.data.items.join(' ').replace(/<[^>]*>?/gm, '');
          }
          if (b.type === 'checklist') {
            return b.data.items.map((i: any) => i.text).join(' ').replace(/<[^>]*>?/gm, '');
          }
          return '';
        }).filter((t: string) => t !== '').join(' ');
      }
    } catch (e) {
      return content;
    }
    return '';
  }

  // Delete Note
  deleteNote(note: Note) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${note.title}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.noteService.deleteNote(note.id).subscribe({
          next: () => {
            this.notesList = this.notesList.filter(n => n.id !== note.id);
            this.applyFilter();
            
            const maxPage = Math.ceil(this.totalNotes / this.notesItemsPerPage) || 1;
            if (this.notesPage > maxPage) {
              this.notesPage = maxPage;
              this.updatePagedNotes();
            }
            Swal.fire('Deleted!', 'Note has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Error deleting note', err);
            Swal.fire('Error!', 'Failed to delete note. Please try again.', 'error');
          }
        });
      }
    });
  }
}
