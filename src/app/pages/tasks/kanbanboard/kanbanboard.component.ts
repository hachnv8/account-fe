import { Component, OnInit, ViewChild } from '@angular/core';
import { DndDropEvent } from 'ngx-drag-drop';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { selectData } from 'src/app/store/Tasks/tasks-selector';
import { addtasklist, fetchtasklistData, updatetasklist } from 'src/app/store/Tasks/tasks.action';
import { Task } from 'src/app/store/Tasks/tasks.model';
import { memberList } from 'src/app/core/data';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

@Component({
  selector: 'app-kanbanboard',
  standalone: true,
  templateUrl: './kanbanboard.component.html',
  styleUrls: ['./kanbanboard.component.scss'],
  imports: [PagetitleComponent, BsDropdownModule, ReactiveFormsModule, ModalModule, CommonModule]
})
export class KanbanboardComponent implements OnInit {

  upcomingTasks: Task[] = [];
  inprogressTasks: Task[] = [];
  completedTasks: Task[] = [];
  memberLists: any[] = memberList;

  breadCrumbItems: any[] = [];
  taskForm!: UntypedFormGroup;
  assigneeMember: string[] = [];
  status = 'upcoming';
  editId: number | null = null;

  @ViewChild('modalForm') modalForm!: ModalDirective;

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Tasks' }, { label: 'Kanban Board', active: true }];

    this.taskForm = this.fb.group({
      id: [''],
      title: ['', Validators.required],
      taskdesc: ['', Validators.required],
      task: ['', Validators.required],
      budget: ['', Validators.required],
      user: [[]],
      status: [''],
      date: ['']
    });

    this.store.dispatch(fetchtasklistData());

    this.store.select(selectData).subscribe(tasks => {
      this.splitTasks(tasks);
    });
  }

  private splitTasks(tasks: Task[]) {
    this.upcomingTasks = tasks.filter(t => t.status === 'upcoming');
    this.inprogressTasks = tasks.filter(t => t.status === 'inprogress');
    this.completedTasks = tasks.filter(t => t.status === 'completed');
  }

  onDragged(item: any, list: Task[]) {
    list.splice(list.indexOf(item), 1);
  }

  onDrop(event: DndDropEvent, list: Task[], status: string) {
    if (event.dropEffect === 'move') {
      const task = { ...event.data, status };
      list.splice(event.index ?? list.length, 0, task);
      this.store.dispatch(updatetasklist({ updatedData: task }));
    }
  }

  deleteTask(task: Task) {
    task.status === 'upcoming' && this.upcomingTasks.splice(this.upcomingTasks.indexOf(task), 1);
    task.status === 'inprogress' && this.inprogressTasks.splice(this.inprogressTasks.indexOf(task), 1);
    task.status === 'completed' && this.completedTasks.splice(this.completedTasks.indexOf(task), 1);
  }

  selectMember(i: number) {
    const member = this.memberLists[i];
    member.checked = !member.checked;

    if (member.checked) {
      this.assigneeMember.push(member.profile);
    } else {
      this.assigneeMember = this.assigneeMember.filter(p => p !== member.profile);
    }
  }

  addnewTask(status: string) {
    this.status = status;
    this.editId = null;
    this.assigneeMember = [];
    this.memberLists.forEach(m => (m.checked = false));
    this.taskForm.reset();
    this.modalForm.show();
  }

submitForm() {
  if (this.taskForm.invalid) return;

  if (this.editId) {
    const updatedTask = {
      ...this.taskForm.value,
      id: this.editId,
      user: this.assigneeMember,
      status: this.status
    };

    this.store.dispatch(updatetasklist({ updatedData: updatedTask }));

  } else {
    const newTask = {
      ...this.taskForm.value,
      id: Date.now(),
      status: this.status,
      user: this.assigneeMember,
      date: this.datePipe.transform(new Date(), 'dd MMM, yyyy')
    };

    this.store.dispatch(addtasklist({ newData: newTask }));
  }

  this.modalForm.hide();
  this.taskForm.reset();
}


updateTask(task: Task) {
  this.editId = task.id;
  this.status = task.status;

  // ✅ SAFE USER NORMALIZATION (FIXES YOUR ERROR)
  if (Array.isArray(task.user)) {
    this.assigneeMember = [...task.user];
  } else if (task.user) {
    this.assigneeMember = [task.user as any];
  } else {
    this.assigneeMember = [];
  }

  // ✅ SYNC CHECKED STATUS
  this.memberLists.forEach(m => {
    m.checked = this.assigneeMember.includes(m.profile);
  });

  // ✅ PATCH FORM
  this.taskForm.patchValue({
    id: task.id,
    title: task.title,
    taskdesc: task.taskdesc || '',
    task: task.task,
    budget: task.budget,
    status: task.status,
    date: task.date
  });

  this.modalForm.show();
}

}
