import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AccountService } from '../../account-manager/services/account.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    standalone: true,
    imports: [PagetitleComponent, CommonModule, ModalModule, FormsModule, ReactiveFormsModule, PaginationModule]
})
export class ProjectListComponent implements OnInit {

    // BreadCrumb
    breadCrumbItems: Array<{}>;

    // Data
    projectList: any[] = [];
    filteredProjectList: any[] = [];
    pagedProjects: any[] = [];

    // Pagination
    totalProjects: number = 0;
    projectPage: number = 1;
    projectItemsPerPage: number = 10;

    isLoading: boolean = false;

    // Search
    searchTerm: string = '';

    // Form
    projectForm: FormGroup;
    projectSubmitted: boolean = false;
    editingProjectId: number | null = null;

    // Status options
    statusOptions = [
        { value: 'active', label: 'Active', class: 'bg-success' },
        { value: 'completed', label: 'Completed', class: 'bg-info' },
        { value: 'paused', label: 'Paused', class: 'bg-warning' },
        { value: 'archived', label: 'Archived', class: 'bg-secondary' }
    ];

    // Category options
    categoryOptions = [
        'Frontend', 'Backend', 'Fullstack', 'Tool', 'Mobile App', 'DevOps', 'Other'
    ];

    // Common tech stack suggestions
    techStackSuggestions = [
        'Angular', 'React', 'Vue.js', 'Next.js', 'Spring Boot', 'Node.js', 'Express',
        'NestJS', 'Django', 'Flask', 'Laravel', 'ASP.NET', '.NET', 'Java', 'Python',
        'TypeScript', 'JavaScript', 'Go', 'Rust', 'PostgreSQL', 'MySQL', 'MongoDB',
        'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'Firebase', 'Puppeteer',
        'Selenium', 'Electron', 'Flutter', 'React Native', 'Swift', 'Kotlin'
    ];

    // Modal
    @ViewChild('addProjectModal', { static: false }) addProjectModal?: ModalDirective;

    constructor(private accountService: AccountService, private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.breadCrumbItems = [{ label: 'Project Manager' }, { label: 'Project List', active: true }];
        this.initForm();
        this.fetchProjects();
    }

    initForm() {
        this.projectForm = this.formBuilder.group({
            name: ['', Validators.required],
            description: [''],
            techStack: [''],
            status: ['active'],
            category: [''],
            repoUrl: [''],
            prodUrl: ['']
        });
    }

    get pf() { return this.projectForm.controls; }

    fetchProjects() {
        this.isLoading = true;
        this.accountService.getProjects().subscribe({
            next: (data) => {
                this.projectList = data;
                this.applyProjectFilter();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching projects', err);
                this.isLoading = false;
                this.projectList = [];
                this.applyProjectFilter();
                Swal.fire('Error!', 'Failed to connect to server. Please try again later.', 'error');
            }
        });
    }

    refreshData() {
        this.fetchProjects();
    }

    onSearch() {
        this.projectPage = 1;
        this.applyProjectFilter();
    }

    applyProjectFilter() {
        const term = this.searchTerm.toLowerCase().trim();
        if (term) {
            this.filteredProjectList = this.projectList.filter(p =>
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.description && p.description.toLowerCase().includes(term)) ||
                (p.category && p.category.toLowerCase().includes(term)) ||
                (p.techStack && p.techStack.some((t: string) => t.toLowerCase().includes(term)))
            );
        } else {
            this.filteredProjectList = [...this.projectList];
        }
        this.totalProjects = this.filteredProjectList.length;
        this.updatePagedProjects();
    }

    updatePagedProjects() {
        const startIndex = (this.projectPage - 1) * this.projectItemsPerPage;
        const endIndex = startIndex + this.projectItemsPerPage;
        this.pagedProjects = this.filteredProjectList.slice(startIndex, endIndex);
    }

    projectPageChanged(event: any) {
        this.projectPage = event.page;
        this.updatePagedProjects();
    }

    // Get status config
    getStatusConfig(status: string) {
        return this.statusOptions.find(s => s.value === status) || this.statusOptions[0];
    }

    // Open Add Project modal
    openAddProjectModal() {
        this.projectSubmitted = false;
        this.editingProjectId = null;
        this.projectForm.reset();
        this.projectForm.patchValue({ status: 'active' });
        this.addProjectModal?.show();
    }

    // Save Project
    saveProject() {
        this.projectSubmitted = true;
        if (this.projectForm.invalid) {
            return;
        }

        const formValues = this.projectForm.value;

        // Parse techStack from comma-separated string to array
        const techStackArray = formValues.techStack
            ? formValues.techStack.split(',').map((t: string) => t.trim()).filter((t: string) => t)
            : [];

        const projectData: any = {
            name: formValues.name,
            description: formValues.description || '',
            techStack: techStackArray,
            status: formValues.status || 'active',
            category: formValues.category || '',
            repoUrl: formValues.repoUrl || '',
            prodUrl: formValues.prodUrl || '',
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        this.isLoading = true;

        if (this.editingProjectId) {
            projectData.id = this.editingProjectId;

            this.accountService.updateProject(this.editingProjectId, projectData).subscribe({
                next: (data) => {
                    this.addProjectModal?.hide();
                    setTimeout(() => {
                        this.fetchProjects();
                    }, 400);
                },
                error: (err) => {
                    console.error('Error updating project', err);
                    this.isLoading = false;
                    Swal.fire('Error!', 'Failed to update project. Please try again.', 'error');
                }
            });
        } else {
            this.accountService.addProject(projectData).subscribe({
                next: (data) => {
                    this.addProjectModal?.hide();
                    setTimeout(() => {
                        this.fetchProjects();
                    }, 400);
                },
                error: (err) => {
                    console.error('Error adding project', err);
                    this.isLoading = false;
                    Swal.fire('Error!', 'Failed to add project. Please try again.', 'error');
                }
            });
        }
    }

    // Edit Project
    editProject(project: any) {
        this.editingProjectId = project.id;
        this.projectForm.patchValue({
            name: project.name,
            description: project.description || '',
            techStack: project.techStack ? project.techStack.join(', ') : '',
            status: project.status || 'active',
            category: project.category || '',
            repoUrl: project.repoUrl || '',
            prodUrl: project.prodUrl || ''
        });
        this.addProjectModal?.show();
    }

    // Delete Project
    deleteProject(project: any) {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete the project "${project.name}". This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#34c38f',
            cancelButtonColor: '#f46a6a',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.accountService.deleteProject(project.id).subscribe({
                    next: () => {
                        this.projectList = this.projectList.filter(p => p.id !== project.id);
                        this.applyProjectFilter();

                        const maxPage = Math.ceil(this.totalProjects / this.projectItemsPerPage) || 1;
                        if (this.projectPage > maxPage) {
                            this.projectPage = maxPage;
                            this.updatePagedProjects();
                        }

                        Swal.fire('Deleted!', 'Project has been deleted.', 'success');
                    },
                    error: (err) => {
                        console.error('Error deleting project', err);
                        Swal.fire('Error!', 'Failed to delete project. Please try again.', 'error');
                    }
                });
            }
        });
    }
}
