import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { DndDropEvent } from 'ngx-drag-drop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { selectData } from 'src/app/store/Tasks/tasks-selector';
import { addtasklist, fetchtasklistData, updatetasklist } from 'src/app/store/Tasks/tasks.action';
import { Task } from 'src/app/store/Tasks/tasks.model';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { TaskService } from 'src/app/core/services/task.service';
import { DndModule } from 'ngx-drag-drop';
import { Editor, NgxEditorModule } from 'ngx-editor';

@Component({
  selector: 'app-kanbanboard',
  standalone: true,
  templateUrl: './kanbanboard.component.html',
  styleUrls: ['./kanbanboard.component.scss'],
  imports: [PagetitleComponent, BsDropdownModule, ReactiveFormsModule, FormsModule, ModalModule, CommonModule, DndModule, NgxEditorModule]
})
export class KanbanboardComponent implements OnInit, OnDestroy {

  todoTasks: Task[] = [];
  doingTasks: Task[] = [];
  doneTasks: Task[] = [];

  breadCrumbItems: any[] = [];
  taskForm!: UntypedFormGroup;
  status = 'todo';
  editId: number | null = null;

  editor: Editor;
  html = '';
  attachments: any[] = [];
  @ViewChild('fileInput') fileInput!: ElementRef;
  currentUploadType: 'image' | 'file' = 'image';

  @ViewChild('modalForm') modalForm!: ModalDirective;

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Kanban Board', active: true }];

    this.taskForm = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      taskdesc: [''],
      task: ['', Validators.required],
      status: ['']
    });

    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  private loadTasks() {
    this.taskService.getAllTasks().subscribe(tasks => {
      this.splitTasks(tasks);
    });
  }

  private splitTasks(tasks: Task[]) {
    this.todoTasks = tasks.filter(t => t.status === 'todo' || t.status === 'upcoming' || !t.status);
    this.doingTasks = tasks.filter(t => t.status === 'doing' || t.status === 'inprogress');
    this.doneTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed');
  }

  onDragged(item: any, list: Task[]) {
    list.splice(list.indexOf(item), 1);
  }

  onDrop(event: DndDropEvent, list: Task[], status: string) {
    if (event.dropEffect === 'move') {
      const task = { ...event.data, status };
      list.splice(event.index ?? list.length, 0, task);
      this.taskService.updateTask(task.id, task).subscribe();
    }
  }

  deleteTask(task: Task) {
    this.taskService.deleteTask(task.id).subscribe(() => {
      task.status === 'todo' && this.todoTasks.splice(this.todoTasks.indexOf(task), 1);
      task.status === 'doing' && this.doingTasks.splice(this.doingTasks.indexOf(task), 1);
      task.status === 'done' && this.doneTasks.splice(this.doneTasks.indexOf(task), 1);
    });
  }

  addnewTask(status: string) {
    this.status = status;
    this.editId = null;
    this.html = '';
    this.attachments = [];
    this.taskForm.reset();
    
    // Map internal status to badge label
    const labelMap: any = { 'todo': 'To Do', 'doing': 'Doing', 'done': 'Done' };
    this.taskForm.patchValue({ 
      status: status,
      task: labelMap[status] || 'To Do'
    });
    
    this.modalForm.show();
  }

  submitForm() {
    if (this.taskForm.invalid) return;

    // Synchronize status and task label
    const status = this.taskForm.value.status || this.status;
    const labelMap: any = { 'todo': 'To Do', 'doing': 'Doing', 'done': 'Done' };
    
    const taskData = {
      ...this.taskForm.value,
      taskdesc: this.html,
      attachments: JSON.stringify(this.attachments),
      status: status,
      task: labelMap[status] || 'To Do'
    };

    if (this.editId) {
      taskData.id = this.editId;
      this.taskService.updateTask(taskData.id, taskData).subscribe(() => {
          this.loadTasks();
      });
    } else {
      delete taskData.id; 
      this.taskService.createTask(taskData).subscribe(() => {
          this.loadTasks();
      });
    }

    this.modalForm.hide();
    this.taskForm.reset();
    this.html = '';
    this.attachments = [];
  }

  updateTask(task: Task) {
    this.editId = task.id;
    this.status = task.status || 'todo';
    this.html = task.taskdesc || '';
    
    try {
      this.attachments = task.attachments ? JSON.parse(task.attachments) : [];
    } catch (e) {
      this.attachments = [];
    }

    this.taskForm.patchValue({
      id: task.id,
      title: task.title,
      taskdesc: task.taskdesc || '',
      task: task.task || 'To Do',
      status: task.status || 'todo'
    });

    this.modalForm.show();
  }

  // --- Rich Text & Attachment Logic ---

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
}

