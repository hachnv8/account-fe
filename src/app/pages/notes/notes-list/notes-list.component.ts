import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
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
    // Simulate API delay
    setTimeout(() => {
      this.notesList = [
        {
          id: 1,
          title: 'Sprint Planning - Q1 2026',
          content: 'Discussed feature priorities for Q1. Focus on account management improvements and project dashboard enhancements.',
          projectName: 'Account Management',
          type: 'meeting',
          priority: 'high',
          status: 'done',
          createdBy: 'Hach NV',
          createdAt: '2026-03-01T09:00:00Z',
          updatedAt: '2026-03-01T11:30:00Z'
        },
        {
          id: 2,
          title: 'Add SSO Login Support',
          content: 'Research and implement Single Sign-On (SSO) using OAuth2 / OpenID Connect for enterprise clients.',
          projectName: 'Account Management',
          type: 'feature',
          priority: 'high',
          status: 'in_progress',
          createdBy: 'Hach NV',
          createdAt: '2026-03-03T14:00:00Z',
          updatedAt: '2026-03-10T16:00:00Z'
        },
        {
          id: 3,
          title: 'Modal z-index overlap issue',
          content: 'The View Account Details modal appears behind the Project Details modal. Need to adjust z-index and backdrop configuration.',
          projectName: 'Account Management',
          type: 'bug',
          priority: 'medium',
          status: 'done',
          createdBy: 'Hach NV',
          createdAt: '2026-03-03T15:00:00Z',
          updatedAt: '2026-03-03T17:00:00Z'
        },
        {
          id: 4,
          title: 'Stock data API integration',
          content: 'Replicate vnstock Python API endpoints in Java for fetching historical prices and financial reports.',
          projectName: 'AInvest',
          type: 'feature',
          priority: 'high',
          status: 'open',
          createdBy: 'Hach NV',
          createdAt: '2026-03-02T10:00:00Z',
          updatedAt: '2026-03-02T10:00:00Z'
        },
        {
          id: 5,
          title: 'Weekly team sync - Mar W2',
          content: 'Reviewed deployment progress. Backend deployed on VPS 36.50.135.128. Frontend build pipeline to be set up next.',
          projectName: 'Account Management',
          type: 'meeting',
          priority: 'low',
          status: 'done',
          createdBy: 'Hach NV',
          createdAt: '2026-03-10T09:00:00Z',
          updatedAt: '2026-03-10T10:00:00Z'
        },
        {
          id: 6,
          title: 'Dark mode theming idea',
          content: 'Consider adding a dark mode toggle to the dashboard. Use CSS variables for easy theme switching.',
          projectName: 'Account Management',
          type: 'idea',
          priority: 'low',
          status: 'open',
          createdBy: 'Hach NV',
          createdAt: '2026-03-08T11:00:00Z',
          updatedAt: '2026-03-08T11:00:00Z'
        },
        {
          id: 7,
          title: 'Optimize project list loading',
          content: 'Implement server-side pagination and lazy loading for project list to improve performance with large datasets.',
          projectName: 'Account Management',
          type: 'task',
          priority: 'medium',
          status: 'open',
          createdBy: 'Hach NV',
          createdAt: '2026-03-09T14:00:00Z',
          updatedAt: '2026-03-09T14:00:00Z'
        },
        {
          id: 8,
          title: 'Database schema review',
          content: 'Review and document all entity relationships. Ensure proper indexing for frequently queried columns.',
          projectName: 'AInvest',
          type: 'task',
          priority: 'medium',
          status: 'in_progress',
          createdBy: 'Hach NV',
          createdAt: '2026-03-05T08:00:00Z',
          updatedAt: '2026-03-11T09:00:00Z'
        }
      ];
      this.applyFilter();
      this.isLoading = false;
    }, 500);
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

  // View Note
  viewNote(note: Note) {
    this.selectedNote = note;
    this.viewNoteModal?.show();
  }

  // Edit Note (placeholder)
  editNote(note: Note) {
    Swal.fire('Info', `Edit note: "${note.title}" - Coming soon!`, 'info');
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
        this.notesList = this.notesList.filter(n => n.id !== note.id);
        this.applyFilter();

        const maxPage = Math.ceil(this.totalNotes / this.notesItemsPerPage) || 1;
        if (this.notesPage > maxPage) {
          this.notesPage = maxPage;
          this.updatePagedNotes();
        }

        Swal.fire('Deleted!', 'Note has been deleted.', 'success');
      }
    });
  }
}
