import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BsModalService, BsModalRef, ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CommonModule } from '@angular/common';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TaskService } from 'src/app/core/services/task.service';
import { Task } from 'src/app/store/Tasks/tasks.model';
import { taskChart } from './data';
import { ChartType } from './list.model';
import Swal from 'sweetalert2';
import { Editor, NgxEditorModule, Toolbar, Validators as EditorValidators } from 'ngx-editor';

@Component({
  selector: 'app-list',
  standalone: true,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [PagetitleComponent, ReactiveFormsModule, NgApexchartsModule, CommonModule, FormsModule, PaginationModule, ModalModule, NgxEditorModule]
})
export class ListComponent implements OnInit, OnDestroy {

  breadCrumbItems: Array<{}>;
  taskChart: ChartType;

  // Data
  tasksList: Task[] = [];
  filteredTasksList: Task[] = [];
  pagedTasks: Task[] = [];

  // Pagination
  totalTasks: number = 0;
  tasksPage: number = 1;
  tasksItemsPerPage: number = 10;
  isLoading: boolean = false;

  // Search
  searchTerm: string = '';

  // Task Modal (from Kanban)
  @ViewChild('modalForm', { static: false }) modalForm?: ModalDirective;
  taskForm: UntypedFormGroup;
  editor: Editor;
  html = '';
  attachments: any[] = [];
  editId: any;
  status: string = 'todo';

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

  constructor(
    private taskService: TaskService,
    private formBuilder: UntypedFormBuilder
  ) { }

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Task List', active: true }];
    this.taskChart = taskChart;
    
    this.editor = new Editor();
    
    this.taskForm = this.formBuilder.group({
      id: [''],
      title: ['', [Validators.required]],
      taskdesc: [''],
      task: ['To Do', [Validators.required]],
      status: ['todo', [Validators.required]]
    });

    this._fetchData();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  _fetchData() {
    this.isLoading = true;
    this.taskService.getAllTasks().subscribe({
      next: (data) => {
        this.tasksList = data;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching tasks', err);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    this.tasksPage = 1;
    this.applyFilter();
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      this.filteredTasksList = this.tasksList.filter(t =>
        (t.title && t.title.toLowerCase().includes(term)) ||
        (t.task && t.task.toLowerCase().includes(term)) ||
        (t.status && t.status.toLowerCase().includes(term)) ||
        (t.taskdesc && t.taskdesc.toLowerCase().includes(term))
      );
    } else {
      this.filteredTasksList = [...this.tasksList];
    }
    this.totalTasks = this.filteredTasksList.length;
    this.updatePagedTasks();
  }

  updatePagedTasks() {
    const startIndex = (this.tasksPage - 1) * this.tasksItemsPerPage;
    const endIndex = startIndex + this.tasksItemsPerPage;
    this.pagedTasks = this.filteredTasksList.slice(startIndex, endIndex);
  }

  tasksPageChanged(event: any) {
    this.tasksPage = event.page;
    this.updatePagedTasks();
  }

  deleteTask(task: Task) {
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${task.title}". This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.taskService.deleteTask(task.id).subscribe({
          next: () => {
            this.tasksList = this.tasksList.filter(t => t.id !== task.id);
            this.applyFilter();
            Swal.fire('Deleted!', 'Task has been deleted.', 'success');
          },
          error: (err) => {
            console.error('Error deleting task', err);
            Swal.fire('Error!', 'Failed to delete task.', 'error');
          }
        });
      }
    });
  }

  // Modal logic (copied from Kanban)
  addnewTask() {
    this.editId = null;
    this.html = '';
    this.attachments = [];
    this.taskForm.reset();
    this.taskForm.patchValue({ 
      status: 'todo',
      task: 'To Do'
    });
    this.modalForm.show();
  }

  editTask(task: Task) {
    this.editId = task.id;
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

  submitForm() {
    if (this.taskForm.invalid) return;

    const status = this.taskForm.value.status;
    const labelMap: any = { 'todo': 'To Do', 'doing': 'Doing', 'done': 'Done' };
    
    const taskData = {
      ...this.taskForm.value,
      taskdesc: this.html,
      attachments: JSON.stringify(this.attachments),
      status: status,
      task: labelMap[status] || 'To Do'
    };

    if (this.editId) {
      this.taskService.updateTask(this.editId, taskData).subscribe(() => {
          this._fetchData();
      });
    } else {
      delete taskData.id; 
      this.taskService.createTask(taskData).subscribe(() => {
          this._fetchData();
      });
    }

    this.modalForm.hide();
  }

  onPaste(event: ClipboardEvent) {
    const items = event.clipboardData?.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            this.readAndInsertImage(file);
          }
        }
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.readAndInsertImage(file);
    }
    // Reset input
    event.target.value = '';
  }

  readAndInsertImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.insertImageToEditor(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  insertImageToEditor(dataUrl: string) {
    const imgHtml = `<img src="${dataUrl}" style="max-height: 250px; object-fit: contain; display: block; margin: 10px 0;">`;
    this.html += imgHtml;
  }

  uploadFile(event: any) {
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        this.attachments.push({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          lastModified: file.lastModified
        });
      }
    }
    // Reset input
    event.target.value = '';
  }

  removeAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  getStatusClass(status: string) {
    switch (status) {
      case 'todo': return 'badge-soft-secondary';
      case 'doing': return 'badge-soft-primary';
      case 'done': return 'badge-soft-success';
      default: return 'badge-soft-secondary';
    }
  }

  getStatusLabel(status: string) {
    switch (status) {
      case 'todo': return 'To Do';
      case 'doing': return 'Doing';
      case 'done': return 'Done';
      default: return status || 'To Do';
    }
  }
}
