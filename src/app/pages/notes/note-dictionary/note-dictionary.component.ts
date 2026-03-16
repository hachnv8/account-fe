import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SearchResult {
  icon: string;
  iconColorClass?: string;
  iconImage?: string; // If using an image instead of icon font
  title: string;
  path: string;
  author: string;
  date: string;
  snippet?: string;
}

@Component({
  selector: 'app-note-dictionary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './note-dictionary.component.html',
  styleUrl: './note-dictionary.component.css'
})
export class NoteDictionaryComponent implements OnInit {
  searchTerm: string = 'docker';

  quickMatches: SearchResult[] = [
    {
      icon: 'bx bx-basketball',
      iconColorClass: 'text-warning',
      title: 'Docker',
      path: '',
      author: 'Hách Nguyễn Văn',
      date: 'Jul 8, 2023',
    },
    {
      icon: 'bx bx-server',
      iconColorClass: 'text-primary',
      title: 'Install Docker, using Docker to install gitlab and jenkins',
      path: 'IT / Linux',
      author: 'Hách Nguyễn Văn',
      date: 'Jul 22, 2025',
    },
    {
      icon: 'bx bx-file',
      iconColorClass: 'text-muted',
      title: 'docker-compose.yml',
      path: 'Project Workspace / ... / Infra setup',
      author: 'Hách Nguyễn Văn',
      date: 'Jun 3, 2025',
    },
    {
      icon: 'bx bx-image',
      iconColorClass: 'text-info',
      title: 'Install Docker',
      path: 'IT / ... / Install Docker, using Docker to install gitlab and jenkins',
      author: 'Hách Nguyễn Văn',
      date: 'Jul 28, 2025',
      snippet: 'By default, Docker requires sudo to run. If you want to run Docker commands without needing sudo , add your user to the Docker group:'
    },
    {
      icon: 'bx bx-ghost',
      iconColorClass: 'text-warning',
      title: 'Install Gitlab and Jenkins using Docker',
      path: 'IT / ... / Install Docker, using Docker to install gitlab and jenkins',
      author: 'Hách Nguyễn Văn',
      date: 'May 28, 2025',
      snippet: 'Pull the GitLab Docker image : Run the following command to pull the official GitLab Docker image:'
    },
    {
      icon: 'bx bx-spade',
      iconColorClass: 'text-secondary',
      title: 'Docker',
      path: 'IT',
      author: 'Hách Nguyễn Văn',
      date: 'Jul 17, 2023',
      snippet: 'Docker for spring-boot app...'
    }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  clearSearch() {
    this.searchTerm = '';
  }
}
