import { Component, OnInit, NO_ERRORS_SCHEMA, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule } from 'ngx-editor';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Editor } from 'ngx-editor';
import { TaskService } from 'src/app/core/services/task.service';
import { Task } from 'src/app/store/Tasks/tasks.model';

@Component({
    selector: 'app-createtask',
    templateUrl: './createtask.component.html',
    styleUrls: ['./createtask.component.scss'],
    imports: [NgxEditorModule, FormsModule],
    schemas: [NO_ERRORS_SCHEMA]
})

/**
 * Tasks-create component
 */
export class CreatetaskComponent implements OnInit {

  // bread crumb items
  breadCrumbItems: Array<{}>;

  editor: Editor;
  html = '';
  taskTitle: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef;
  currentUploadType: 'image' | 'file' = 'image';
  attachments: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    this.editor = new Editor();
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Create Task', active: true }];
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
      // Insert image inline into editor as base64
      this.readAndInsertImage(file);
    } else {
      // Non-image files go to attachments list
      const newAttachment = {
        name: file.name,
        size: this.formatBytes(file.size),
        type: file.type
      };
      this.attachments.push(newAttachment);
    }
    // Reset input so the same file can be selected again
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

  /**
   * Read image file as base64 and insert inline into the editor at cursor position
   */
  private readAndInsertImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Url = e.target.result;
      this.insertImageToEditor(base64Url);
    };
    reader.readAsDataURL(file);
  }

  /**
   * Insert an <img> tag into the editor content at current cursor
   */
  private insertImageToEditor(src: string) {
    const imgHtml = `<img src="${src}" alt="inline-image" style="max-width: 100%; height: auto; border-radius: 4px; margin: 8px 0; display: block;" />`;
    // insertHTML inserts at the current cursor position
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

  createTask() {
    if (!this.taskTitle) {
      alert('Please enter a task name');
      return;
    }

    const taskData: any = {
      title: this.taskTitle,
      taskdesc: this.html,
      status: 'todo',
      task: 'Waiting',
      attachments: JSON.stringify(this.attachments)
    };

    this.taskService.createTask(taskData).subscribe({
      next: (res) => {
        console.log('Task created successfully', res);
        this.router.navigate(['/tasks/kanban']);
      },
      error: (err) => {
        console.error('Error creating task', err);
        alert('Failed to create task. Check if backend is running.');
      }
    });
  }
}
