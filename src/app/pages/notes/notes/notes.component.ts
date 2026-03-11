import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';

export interface ChangeRequest {
  id: string;
  name: string;
  projectName: string;
  createdAt: string;
  status: string;
  assignee: string;
  priority: string;
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, PagetitleComponent],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent {
  breadCrumbItems: Array<{}>;
  changeRequests: ChangeRequest[] = [];

  constructor() {
    this.breadCrumbItems = [{ label: 'Notes' }, { label: 'Change Requests', active: true }];
    this.loadMockData();
  }

  loadMockData() {
    this.changeRequests = [
      {
        id: 'CR-001',
        name: 'Update user login authentication UI',
        projectName: 'Account Management',
        createdAt: '2026-03-01T10:00:00Z',
        status: 'In Progress',
        assignee: 'Alice Smith',
        priority: 'High'
      },
      {
        id: 'CR-002',
        name: 'Add SSO integration support',
        projectName: 'Main Dashboard',
        createdAt: '2026-03-05T14:30:00Z',
        status: 'Pending',
        assignee: 'Bob Jones',
        priority: 'Medium'
      },
      {
        id: 'CR-003',
        name: 'Fix modal z-index layout issue',
        projectName: 'Account Management',
        createdAt: '2026-03-08T09:15:00Z',
        status: 'Resolved',
        assignee: 'Charlie Brown',
        priority: 'Low'
      }
    ];
  }

  viewCR(cr: ChangeRequest) {
    console.log('View CR:', cr);
    // TODO: Implement view modal or navigation
  }

  editCR(cr: ChangeRequest) {
    console.log('Edit CR:', cr);
    // TODO: Implement edit modal or navigation
  }

  deleteCR(cr: ChangeRequest) {
    console.log('Delete CR:', cr);
    this.changeRequests = this.changeRequests.filter(item => item.id !== cr.id);
  }
}
