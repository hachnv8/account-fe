import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NoteService } from '../services/note.service';
import { AccountService } from '../../account-manager/services/account.service';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Checklist from '@editorjs/checklist';
import Quote from '@editorjs/quote';
import Table from '@editorjs/table';
import Code from '@editorjs/code';
import InlineCode from '@editorjs/inline-code';
import Marker from '@editorjs/marker';
import Delimiter from '@editorjs/delimiter';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-note-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalModule],
  templateUrl: './note-create.component.html',
  styleUrl: './note-create.component.css'
})
export class NoteCreateComponent implements OnInit, AfterViewInit, OnDestroy {
  editor!: EditorJS;
  noteTitle: string = '';
  isSaving: boolean = false;
  lastSavedAt: Date | null = null;
  noteId: number | null = null;
  existingNote: any = null;
  selectedProject: string = 'General';
  projects: any[] = [];
  
  @ViewChild('saveNoteModal', { static: false }) saveNoteModal?: ModalDirective;

  constructor(private router: Router, private route: ActivatedRoute, private noteService: NoteService, private accountService: AccountService) {}

  ngOnInit(): void {
    this.accountService.getProjects().subscribe({
      next: (data) => {
        this.projects = data || [];
        // Defaults to 'General' if not in list, but user can select from the fetched options
      },
      error: (err) => {
        console.error('Failed to load projects for dropdown', err);
      }
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.noteId = Number(idParam);
    }
  }

  ngAfterViewInit(): void {
    if (this.noteId) {
      this.loadNote(this.noteId);
    } else {
      this.initEditor();
    }
  }

  loadNote(id: number) {
    this.noteService.getNoteById(id).subscribe({
      next: (note: any) => {
        if (!note) {
          console.warn('Note is null or undefined from API.');
          this.initEditor();
          return;
        }
        this.existingNote = note;
        this.noteTitle = note.title || '';
        this.selectedProject = note.projectName || 'General';
        let editorData = { time: new Date().getTime(), blocks: [], version: "2.31.4" };
        if (note.content) {
            try {
               editorData = JSON.parse(note.content);
            } catch(e) {}
        }
        this.initEditor(editorData);
      },
      error: (err: any) => {
        console.error('Failed to load note', err);
        this.initEditor();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.editor && typeof this.editor.destroy === 'function') {
      try {
        this.editor.destroy();
      } catch (e) {
        console.warn('Could not cleanly destroy editor', e);
      }
    }
  }

  initEditor(initialData?: any) {
    this.editor = new EditorJS({
      holder: 'editorjs',
      placeholder: 'Type \'/\' for commands, or just start typing...',
      autofocus: true,
      tools: {
        header: {
          class: Header as any,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+H',
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4],
            defaultLevel: 2
          }
        },
        list: {
          class: List as any,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+L'
        },
        checklist: {
          class: Checklist as any,
          inlineToolbar: true,
        },
        quote: {
          class: Quote as any,
          inlineToolbar: true,
          shortcut: 'CMD+SHIFT+O',
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: "Quote's author",
          },
        },
        table: {
          class: Table as any,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3,
          },
        },
        code: {
          class: Code as any,
          shortcut: 'CMD+SHIFT+C'
        },
        delimiter: Delimiter as any,
        inlineCode: {
          class: InlineCode as any,
          shortcut: 'CMD+SHIFT+M',
        },
        marker: {
          class: Marker as any,
          shortcut: 'CMD+SHIFT+M',
        }
      },
      data: initialData || {
        time: new Date().getTime(),
        blocks: [],
        version: "2.31.4"
      },
      onChange: () => {
        // Auto-save or show unsaved changes indicator could happen here
      }
    });
  }

  openSaveModal() {
    if (!this.noteTitle.trim()) return;
    this.saveNoteModal?.show();
  }

  async executeSave() {
    this.saveNoteModal?.hide();
    this.isSaving = true;
    try {
      const outputData = await this.editor.save();
      
      const noteToSave = {
        title: this.noteTitle,
        content: JSON.stringify(outputData),
        projectName: this.selectedProject || 'General',
        type: this.existingNote?.type || 'other',
        priority: this.existingNote?.priority || 'medium',
        status: this.existingNote?.status || 'open'
      };

      if (this.noteId) {
          this.noteService.updateNote(this.noteId, noteToSave).subscribe({
            next: (res: any) => {
              this.isSaving = false;
              this.router.navigate(['/notes/list']);
            },
            error: (err: any) => {
              console.error('Update failed: ', err);
              this.isSaving = false;
            }
          });
      } else {
          this.noteService.addNote(noteToSave).subscribe({
            next: (res: any) => {
              this.isSaving = false;
              this.router.navigate(['/notes/list']);
            },
            error: (err: any) => {
              console.error('Saving failed: ', err);
              this.isSaving = false;
            }
          });
      }
      
    } catch (error) {
      console.error('Editor parsing failed: ', error);
      this.isSaving = false;
    }
  }

  goBack() {
    this.router.navigate(['/notes/list']);
  }
}
