import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NoteService } from '../services/note.service';
import { AccountService } from '../../account-manager/services/account.service';
import { TaskService } from 'src/app/core/services/task.service';
import { Task } from 'src/app/store/Tasks/tasks.model';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { Editor, NgxEditorModule, Toolbar, Validators } from 'ngx-editor';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-note-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalModule, NgxEditorModule],
  templateUrl: './note-create.component.html',
  styleUrl: './note-create.component.css'
})
export class NoteCreateComponent implements OnInit, OnDestroy {
  editor: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  html = '';
  noteTitle: string = '';
  isSaving: boolean = false;
  lastSavedAt: Date | null = null;
  noteId: number | null = null;
  existingNote: any = null;
  selectedProject: string = 'General';
  projects: any[] = [];
  tasks: Task[] = [];
  selectedTaskId: number | null = null;

  @ViewChild('saveNoteModal', { static: false }) saveNoteModal?: ModalDirective;
  @ViewChild('fileInput') fileInput!: ElementRef;

  currentUploadType: 'image' | 'file' = 'image';
  attachments: any[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private noteService: NoteService,
    private accountService: AccountService,
    private taskService: TaskService
  ) { }

  ngOnInit(): void {
    this.editor = new Editor();

    this.accountService.getProjects().subscribe({
      next: (data) => {
        this.projects = data || [];
      },
      error: (err) => {
        console.error('Failed to load projects for dropdown', err);
      }
    });

    this.taskService.getAllTasks().subscribe({
      next: (data) => {
        this.tasks = data || [];
      },
      error: (err) => {
        console.error('Failed to load tasks for dropdown', err);
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.noteId = Number(idParam);
      this.loadNote(this.noteId);
    }
  }

  loadNote(id: number) {
    this.noteService.getNoteById(id).subscribe({
      next: (note: any) => {
        if (!note) {
          console.warn('Note is null or undefined from API.');
          return;
        }
        this.existingNote = note;
        this.noteTitle = note.title || '';
        this.selectedProject = note.projectName || 'General';
        this.selectedTaskId = note.taskId || null;
        this.html = note.content || '';
        if (note.attachments) {
          try {
            this.attachments = JSON.parse(note.attachments);
          } catch (e) {
            this.attachments = [];
          }
        }
      },
      error: (err: any) => {
        console.error('Failed to load note', err);
        Swal.fire('Error', 'Failed to load note data', 'error');
      }
    });
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  uploadFile(type: 'image' | 'file') {
    this.currentUploadType = type;
    const input = this.fileInput.nativeElement;
    input.accept = type === 'image' ? 'image/*' : '*';
    input.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (this.currentUploadType === 'image' && file.type.startsWith('image/')) {
      this.readAndInsertImage(file);
    } else {
      const newAttachment = {
        name: file.name,
        size: this.formatBytes(file.size),
        type: file.type
      };
      this.attachments.push(newAttachment);
    }
    event.target.value = '';
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            this.readAndInsertImage(file);
            event.preventDefault();
            return;
          }
        }
      }
    }
  }

  private readAndInsertImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Url = e.target.result;
      this.insertImageToEditor(base64Url);
    };
    reader.readAsDataURL(file);
  }

  private insertImageToEditor(src: string) {
    const imgHtml = `<img src="${src}" alt="inline-image" style="max-width: 100%; height: auto; border-radius: 4px; margin: 8px 0; display: block;" />`;
    this.editor.commands.insertHTML(imgHtml).exec();
  }

  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  openSaveModal() {
    if (!this.noteTitle.trim()) return;
    this.saveNoteModal?.show();
  }

  executeSave() {
    this.isSaving = true;

    const noteToSave = {
      title: this.noteTitle,
      content: this.html,
      attachments: JSON.stringify(this.attachments),
      projectName: this.selectedProject || 'General',
      taskId: this.selectedTaskId,
      type: this.existingNote?.type || 'other',
      priority: this.existingNote?.priority || 'medium',
      status: this.existingNote?.status || 'open'
    };

    if (this.noteId) {
      this.noteService.updateNote(this.noteId, noteToSave).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          this.saveNoteModal?.hide();
          this.router.navigate(['/notes/list']);
        },
        error: (err: any) => {
          console.error('Update failed: ', err);
          this.isSaving = false;
          Swal.fire('Error', 'Failed to update note', 'error');
        }
      });
    } else {
      this.noteService.addNote(noteToSave).subscribe({
        next: (res: any) => {
          this.isSaving = false;
          this.saveNoteModal?.hide();
          this.router.navigate(['/notes/list']);
        },
        error: (err: any) => {
          console.error('Saving failed: ', err);
          this.isSaving = false;
          Swal.fire('Error', 'Failed to save note', 'error');
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/notes/list']);
  }
}
