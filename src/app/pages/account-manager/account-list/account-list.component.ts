import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalDirective, ModalModule } from 'ngx-bootstrap/modal';
import { PagetitleComponent } from 'src/app/shared/ui/pagetitle/pagetitle.component';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { AccountService } from '../services/account.service';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-account-list',
    templateUrl: './account-list.component.html',
    standalone: true,
    imports: [PagetitleComponent, CommonModule, ModalModule, BsDropdownModule, FormsModule, ReactiveFormsModule, PaginationModule]
})
export class AccountListComponent implements OnInit {

    // BreadCrumb
    breadCrumbItems: Array<{}>;

    // Data
    projectList: any[] = [];
    filteredProjectList: any[] = [];

    // Cache all accounts
    allAccounts: any[] = [];
    hasFetchedAccounts: boolean = false;

    // Manage all accounts
    accountList: any[] = [];
    filteredAccountList: any[] = [];
    pagedAccounts: any[] = [];

    selectedAccount: any;
    accountToCopy: any;
    copyTargetProjectId: string = '';
    targetProjects: any[] = [];
    loginDetailsContent: string = '';
    loginDetailEntries: { key: string, value: string }[] = [];

    // Pagination for Accounts
    totalAccounts: number = 0;
    accountPage: number = 1;
    accountItemsPerPage: number = 10;

    isLoading: boolean = false;
    isAccountLoading: boolean = false;

    // Search
    searchTerm: string = '';
    accountSearchTerm: string = '';

    // Auto generate
    isGenerating: boolean = false;
    generatedCount: number = 0;

    // Multi-select Data (Accounts)
    selectedAccountIds: number[] = [];

    // Forms
    accountForm: FormGroup;
    projectForm: FormGroup;
    submitted: boolean = false;
    projectSubmitted: boolean = false;
    editingProjectId: number | null = null;
    editingAccountId: number | null = null;

    // Platform options for the automated icon selection
    platformOptions = [
        { name: 'Unknown', icon: 'bx bx-globe', needsPort: false },
        { name: 'Facebook', icon: 'bx bxl-facebook-square', needsPort: false },
        { name: 'Google', icon: 'bx bxl-google', needsPort: false },
        { name: 'SSH/Terminal', icon: 'bx bxs-terminal', needsPort: true },
        { name: 'Database', icon: 'bx bxs-data', needsPort: true },
        { name: 'YouTube', icon: 'bx bxl-youtube', needsPort: false },
        { name: 'GitHub', icon: 'bx bxl-github', needsPort: false },
        { name: 'AWS', icon: 'bx bxl-aws', needsPort: false },
        { name: 'WordPress', icon: 'bx bxl-wordpress', needsPort: false },
        { name: 'DigitalOcean', icon: 'bx bxl-digitalocean', needsPort: true },
        { name: 'Slack', icon: 'bx bxl-slack', needsPort: false },
        { name: 'Other', icon: 'bx bx-globe', needsPort: false }
    ];

    // Modal
    @ViewChild('loginDetailsModal', { static: false }) loginDetailsModal?: ModalDirective;
    @ViewChild('addAccountModal', { static: false }) addAccountModal?: ModalDirective;
    @ViewChild('projectDetailsModal', { static: false }) projectDetailsModal?: ModalDirective;
    @ViewChild('addProjectModal', { static: false }) addProjectModal?: ModalDirective;
    @ViewChild('copyAccountModal', { static: false }) copyAccountModal?: ModalDirective;

    constructor(private accountService: AccountService, private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.breadCrumbItems = [{ label: 'Account Manager' }, { label: 'Projects', active: true }];
        this.initForm();
        this.fetchProjects();
    }

    fetchProjects() {
        this.isLoading = true;
        this.accountService.getProjects().subscribe({
            next: (data) => {
                this.projectList = data;
                this.fetchAllAccounts();
            },
            error: (err) => {
                console.error('Error fetching projects', err);
                this.isLoading = false;
                this.projectList = [];
                Swal.fire('Error!', 'Failed to connect to server. Please try again later.', 'error');
            }
        });
    }

    fetchAllAccounts() {
        this.isAccountLoading = true;
        this.accountService.getAccounts().subscribe({
            next: (data) => {
                this.allAccounts = data;
                this.accountList = this.mapProjectNamesToAccounts(this.allAccounts);
                this.applyAccountFilter();
                this.isLoading = false;
                this.isAccountLoading = false;
            },
            error: (err) => {
                console.error('Error fetching accounts', err);
                this.isLoading = false;
                this.isAccountLoading = false;
                Swal.fire('Error!', 'Failed to fetch accounts. Please try again later.', 'error');
            }
        });
    }

    mapProjectNamesToAccounts(accounts: any[]): any[] {
        return accounts.map(account => {
            const project = this.projectList.find(p => p.id === account.projectId);
            return {
                ...account,
                projectName: project ? project.name : 'Unknown Project'
            };
        });
    }

    refreshData() {
        this.fetchProjects();
    }

    onSearch() {
        this.accountPage = 1;
        this.applyAccountFilter();
    }

    applyProjectFilter() {
        const term = this.searchTerm.toLowerCase().trim();
        if (term) {
            this.filteredProjectList = this.projectList.filter(p =>
                (p.name && p.name.toLowerCase().includes(term))
            );
        } else {
            this.filteredProjectList = [...this.projectList];
        }
    }

    applyAccountFilter() {
        const term = this.searchTerm.toLowerCase().trim();
        if (term) {
            this.filteredAccountList = this.accountList.filter(a =>
                (a.name && a.name.toLowerCase().includes(term)) ||
                (a.url && a.url.toLowerCase().includes(term)) ||
                (a.projectName && a.projectName.toLowerCase().includes(term))
            );
        } else {
            this.filteredAccountList = [...this.accountList];
        }
        this.totalAccounts = this.filteredAccountList.length;
        this.updatePagedAccounts();
    }

    updatePagedAccounts() {
        const startIndex = (this.accountPage - 1) * this.accountItemsPerPage;
        const endIndex = startIndex + this.accountItemsPerPage;
        this.pagedAccounts = this.filteredAccountList.slice(startIndex, endIndex);
    }

    accountPageChanged(event: any) {
        this.accountPage = event.page;
        this.updatePagedAccounts();
    }

    initForm() {
        this.accountForm = this.formBuilder.group({
            projectId: ['', Validators.required],
            name: ['', Validators.required],
            url: [''],
            platformIcon: [''], // Will be set to a default if still needed by backend
            // Login Details Group
            username: [''],
            password: [''],
            port: [''],
            notes: ['']
        });

        this.projectForm = this.formBuilder.group({
            name: ['', Validators.required],
            prodUrl: ['']
        });

        // Listen for project selection changes in account form
        this.accountForm.get('projectId')?.valueChanges.subscribe(projectId => {
            if (projectId) {
                const project = this.projectList.find(p => p.id == projectId);
                if (project) {
                    // Always update URL based on project selection, clearing it if project has no URL
                    this.accountForm.patchValue({ url: project.prodUrl || '' }, { emitEvent: false });
                }
            }
        });
    }

    get f() { return this.accountForm.controls; }
    get pf() { return this.projectForm.controls; }

    /**
     * Check if current platform needs a port field
     */
    get needsPort(): boolean {
        const currentIcon = this.accountForm?.get('platformIcon')?.value;
        const platform = this.platformOptions.find(p => p.icon === currentIcon);
        return platform?.needsPort ?? false;
    }

    // Open Add modal
    openAddModal() {
        this.submitted = false;
        this.editingAccountId = null;
        this.accountForm.reset();
        
        this.accountForm.patchValue({
            platformIcon: this.platformOptions[0].icon,
            projectId: '',
            url: ''
        });
        this.addAccountModal?.show();
    }

    // Open Add Project modal
    openAddProjectModal() {
        this.projectSubmitted = false;
        this.editingProjectId = null;
        this.projectForm.reset();
        this.addProjectModal?.show();
    }

    // Save Account
    saveAccount() {
        this.submitted = true;
        if (this.accountForm.invalid) {
            return;
        }

        const formValues = this.accountForm.value;

        // Construct loginDetails based on platform type
        const loginDetails: any = {
            username: formValues.username,
            password: formValues.password
        };
        if (this.needsPort) {
            loginDetails.port = formValues.port;
        } else {
            loginDetails.notes = formValues.notes;
        }

        // Construct the account object
        const newAccount: any = {
            projectId: formValues.projectId,
            name: formValues.name,
            url: formValues.url,
            platformIcon: formValues.platformIcon,
            lastUpdated: new Date().toISOString().split('T')[0],
            loginDetails: loginDetails
        };

        this.isAccountLoading = true;
        this.isAccountLoading = true;

        if (this.editingAccountId) {
            this.accountService.updateAccount(this.editingAccountId, newAccount).subscribe({
                next: (data) => {
                    const idx = this.allAccounts.findIndex(a => a.id === this.editingAccountId);
                    if (idx > -1) {
                        this.allAccounts[idx] = this.mapProjectNamesToAccounts([data])[0];
                    }
                    const listIdx = this.accountList.findIndex(a => a.id === this.editingAccountId);
                    if (listIdx > -1) {
                        this.accountList[listIdx] = this.allAccounts[idx];
                    }
                    this.applyAccountFilter();
                    this.isAccountLoading = false;
                    this.addAccountModal?.hide();
                    this.fetchProjects();
                },
                error: (err) => {
                    console.error('Error updating account', err);
                    this.isAccountLoading = false;
                }
            });
        } else {
            this.accountService.addAccount(newAccount).subscribe({
                next: (data) => {
                    const mappedData = this.mapProjectNamesToAccounts([data])[0];
                    this.allAccounts.unshift(mappedData);
                    this.accountList.unshift(mappedData);
                    this.accountPage = 1;
                    this.applyAccountFilter();
                    this.isAccountLoading = false;
                    this.addAccountModal?.hide();
                    this.fetchProjects();
                },
                error: (err) => {
                    console.error('Error adding account', err);
                    this.isAccountLoading = false;
                }
            });
        }
    }

    // Save Project
    saveProject() {
        this.projectSubmitted = true;
        if (this.projectForm.invalid) {
            return;
        }

        const projectData = {
            name: this.projectForm.value.name,
            prodUrl: this.projectForm.value.prodUrl,
            count: 0,
            lastUpdated: new Date().toISOString().split('T')[0] // Only update last updated on create
        };

        this.isLoading = true;

        if (this.editingProjectId) {
            // Edit existing project
            const updateData = {
                id: this.editingProjectId,
                name: projectData.name,
                prodUrl: projectData.prodUrl
            };

            this.accountService.updateProject(this.editingProjectId, updateData).subscribe({
                next: (data) => {
                    const idx = this.projectList.findIndex(p => p.id === this.editingProjectId);
                    if (idx > -1) {
                        this.projectList[idx].name = updateData.name;
                        this.projectList[idx].prodUrl = updateData.prodUrl;
                    }
                    this.applyProjectFilter();
                    this.isLoading = false;
                    this.addProjectModal?.hide();
                },
                error: (err) => {
                    console.error('Error updating project', err);
                    this.isLoading = false;
                    Swal.fire('Error!', 'Failed to update project. Please try again.', 'error');
                }
            });
        } else {
            // Add new project
            this.accountService.addProject(projectData).subscribe({
                next: (data) => {
                    this.applyProjectFilter();
                    this.isLoading = false;
                    this.addProjectModal?.hide();
                },
                error: (err) => {
                    console.error('Error adding project', err);
                    this.isLoading = false;
                    Swal.fire('Error!', 'Failed to add project. Please try again.', 'error');
                }
            });
        }
    }

    /**
     * Edit Project
     */
    editProject(project: any, event: Event) {
        event.stopPropagation(); // prevent opening the project accounts modal
        this.editingProjectId = project.id;
        this.projectForm.patchValue({
            name: project.name,
            prodUrl: project.prodUrl || ''
        });
        this.addProjectModal?.show();
    }

    /**
     * Delete Project
     */
    deleteProject(project: any, event: Event) {
        event.stopPropagation(); // prevent opening the project accounts modal

        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete the project "${project.name}". This might delete all nested accounts!`,
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

    /**
     * Open the modal to view project accounts - DEPRECATED
     */
    viewProjectAccounts(project: any) {
        // No longer used since accounts are flattened
    }

    /**
     * Open the modal to view login details
     * @param account The account object
     */
    viewLoginDetails(account: any) {
        this.selectedAccount = account;
        // Include url/ip along with loginDetails
        const details = {
            url: account.url,
            ...account.loginDetails
        };

        // Remove notes if empty as requested
        if (!details.notes) {
            delete details.notes;
        }

        this.loginDetailsContent = JSON.stringify(details, null, 2);
        this.loginDetailsModal?.show();
    }

    /**
     * Copy logic for the modal content
     */
    copyToClipboard() {
        // Use the navigator clipboard API
        if (this.loginDetailsContent) {
            navigator.clipboard.writeText(this.loginDetailsContent).then(() => {
                // Optional: Show a toast or alert. using simple alert for now as no Toastr service added here yet
                // alert('Copied to clipboard!'); 
                // Ideally we can change the button text temporarily to "Copied!"
                const copyBtn = document.getElementById('btn-copy-clipboard') as HTMLElement;
                if (copyBtn) {
                    const originalText = copyBtn.innerText;
                    copyBtn.innerText = 'Copied!';
                    setTimeout(() => {
                        copyBtn.innerText = originalText;
                    }, 2000);
                }
            }).catch(err => {
                console.error('Could not copy text: ', err);
            });
        }
    }

    /**
     * Edit account (Placeholder)
     * @param id Account ID
     */
    editAccount(id: number) {
        this.editingAccountId = id;
        this.submitted = false;

        const account = this.allAccounts.find(a => a.id === id);
        if (account) {
            if (account.tags && Array.isArray(account.tags)) {
                // tags are no longer used in the form
            }

            this.accountForm.patchValue({
                projectId: account.projectId,
                name: account.name,
                url: account.url,
                platformIcon: account.platformIcon,
                username: account.loginDetails?.username || '',
                password: account.loginDetails?.password || '',
                port: account.loginDetails?.port || '',
                notes: account.loginDetails?.notes || ''
            }, { emitEvent: false });
            this.addAccountModal?.show();
        }
    }

    /**
     * Open copy account modal
     */
    copyAccount(account: any) {
        this.accountToCopy = account;
        this.copyTargetProjectId = '';
        // Filter out current project
        this.targetProjects = this.projectList.filter(p => p.id !== account.projectId);
        this.copyAccountModal?.show();
    }

    /**
     * Execute copy logic
     */
    executeCopyAccount() {
        if (!this.copyTargetProjectId || !this.accountToCopy) return;

        this.isLoading = true;

        const newAccount = {
            ...this.accountToCopy,
            id: undefined, // New ID will be generated
            projectId: Number(this.copyTargetProjectId),
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        this.accountService.addAccount(newAccount).subscribe({
            next: (response) => {
                this.copyAccountModal?.hide();
                // Refresh accounts
                this.fetchAllAccounts();
                this.isLoading = false;
                Swal.fire({
                    title: 'Success!',
                    text: 'Account copied successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: (err) => {
                console.error('Error copying account', err);
                this.isLoading = false;
                Swal.fire('Error!', 'Failed to copy account. Please try again.', 'error');
            }
        });
    }

    // ========== Multi-select ==========

    toggleAccountSelect(id: number) {
        const idx = this.selectedAccountIds.indexOf(id);
        if (idx > -1) {
            this.selectedAccountIds.splice(idx, 1);
        } else {
            this.selectedAccountIds.push(id);
        }
    }

    isAccountSelected(id: number): boolean {
        return this.selectedAccountIds.includes(id);
    }

    toggleAccountSelectAll(event: any) {
        if (event.target.checked) {
            this.selectedAccountIds = this.pagedAccounts.map(a => a.id);
        } else {
            this.selectedAccountIds = [];
        }
    }

    isAllAccountsSelected(): boolean {
        return this.pagedAccounts.length > 0 && this.pagedAccounts.every(a => this.selectedAccountIds.includes(a.id));
    }

    deleteSelectedAccounts() {
        if (this.selectedAccountIds.length === 0) return;

        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${this.selectedAccountIds.length} account(s). You won\'t be able to revert this!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#34c38f',
            cancelButtonColor: '#f46a6a',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const idsToDelete = [...this.selectedAccountIds];
                this.deleteAccountsSequentially(idsToDelete, 0);
            }
        });
    }

    private deleteAccountsSequentially(ids: number[], index: number) {
        if (index >= ids.length) {
            this.selectedAccountIds = [];
            this.fetchAllAccounts();
            this.fetchProjects(); // update counts
            Swal.fire('Deleted!', 'Selected accounts have been deleted.', 'success');
            return;
        }
        this.accountService.deleteAccount(ids[index]).subscribe({
            next: () => {
                this.allAccounts = this.allAccounts.filter(a => a.id !== ids[index]);
                this.deleteAccountsSequentially(ids, index + 1);
            },
            error: (err) => {
                console.error(`Error deleting account ${ids[index]}`, err);
                this.deleteAccountsSequentially(ids, index + 1);
            }
        });
    }

    /**
     * Delete account
     * @param id Account ID
     */
    deleteAccount(id: number) {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#34c38f',
            cancelButtonColor: '#f46a6a',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                this.accountService.deleteAccount(id).subscribe({
                    next: () => {
                        this.allAccounts = this.allAccounts.filter(a => a.id !== id);
                        this.accountList = this.accountList.filter(a => a.id !== id);
                        this.applyAccountFilter();
                        const maxPage = Math.ceil(this.totalAccounts / this.accountItemsPerPage) || 1;
                        if (this.accountPage > maxPage) {
                            this.accountPage = maxPage;
                            this.updatePagedAccounts();
                        }
                        this.fetchProjects(); // Update project counts
                        Swal.fire('Deleted!', 'Account has been deleted.', 'success');
                    },
                    error: (err) => {
                        console.error('Error deleting account', err);
                        Swal.fire('Error!', 'Failed to delete account.', 'error');
                    }
                });
            }
        });
    }

    /**
     * Auto generate 50 fake accounts for testing
     */
    autoGenerateAccounts() {
        if (this.isGenerating) return;

        this.isGenerating = true;
        this.generatedCount = 0;

        const fakeAccounts = this.buildFakeAccounts(50);
        this.createAccountSequentially(fakeAccounts, 0);
    }

    private createAccountSequentially(accounts: any[], index: number) {
        if (index >= accounts.length) {
            this.isGenerating = false;
            this.hasFetchedAccounts = false;
            this.fetchProjects(); // Refresh full list from backend
            return;
        }

        this.accountService.addAccount(accounts[index]).subscribe({
            next: (data) => {
                this.generatedCount = index + 1;
                this.createAccountSequentially(accounts, index + 1);
            },
            error: (err) => {
                console.error(`Error creating account ${index + 1}`, err);
                this.generatedCount = index + 1;
                this.createAccountSequentially(accounts, index + 1); // Continue even on error
            }
        });
    }

    private buildFakeAccounts(count: number): any[] {
        const templates = [
            { platform: 'Facebook', icon: 'bx bxl-facebook-square', domains: ['business.facebook.com', 'facebook.com/ads', 'fb.com/pages'], tags: ['Social', 'Marketing', 'Ads'] },
            { platform: 'Google', icon: 'bx bxl-google', domains: ['analytics.google.com', 'ads.google.com', 'console.cloud.google.com', 'search.google.com'], tags: ['Analytics', 'Cloud', 'SEO'] },
            { platform: 'SSH/Terminal', icon: 'bx bxs-terminal', domains: ['10.0.0.', '192.168.1.', '172.16.0.'], tags: ['Server', 'Dev', 'Staging', 'Prod'] },
            { platform: 'Database', icon: 'bx bxs-data', domains: ['192.168.1.', '10.10.0.', 'db.internal.'], tags: ['Database', 'MySQL', 'PostgreSQL', 'MongoDB'] },
            { platform: 'YouTube', icon: 'bx bxl-youtube', domains: ['studio.youtube.com', 'youtube.com/channel'], tags: ['Social', 'Media', 'Video'] },
            { platform: 'GitHub', icon: 'bx bxl-github', domains: ['github.com/org/', 'github.com/team/', 'gitlab.com/'], tags: ['Code', 'Git', 'DevOps'] },
            { platform: 'AWS', icon: 'bx bxl-aws', domains: ['console.aws.amazon.com', 'us-east-1.aws', 'ap-southeast-1.aws'], tags: ['Cloud', 'Infra', 'Storage'] },
            { platform: 'WordPress', icon: 'bx bxl-wordpress', domains: ['myblog.com/wp-admin', 'shop.example.com/wp-admin', 'news.site.com/wp-admin'], tags: ['Blog', 'Content', 'CMS'] },
            { platform: 'DigitalOcean', icon: 'bx bxl-digitalocean', domains: ['142.93.', '167.71.', '206.189.'], tags: ['Server', 'Cloud', 'VPS'] },
            { platform: 'Slack', icon: 'bx bxl-slack', domains: ['workspace.slack.com', 'team.slack.com', 'company.slack.com'], tags: ['Communication', 'Team', 'Chat'] },
        ];

        const adjectives = ['Main', 'Backup', 'Dev', 'Staging', 'Prod', 'Test', 'Legacy', 'New', 'Primary', 'Secondary', 'Beta', 'Alpha', 'Internal', 'External', 'Client'];
        const purposes = ['Account', 'Manager', 'Console', 'Dashboard', 'Portal', 'Admin', 'Panel', 'Service', 'Instance', 'Workspace'];

        const accounts: any[] = [];

        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const purpose = purposes[Math.floor(Math.random() * purposes.length)];
            const domain = template.domains[Math.floor(Math.random() * template.domains.length)];
            const randomSuffix = template.icon.includes('terminal') || template.icon.includes('data')
                ? Math.floor(Math.random() * 254 + 1)
                : `project-${Math.floor(Math.random() * 999)}`;

            // Pick 1-2 random tags from the template
            const shuffledTags = [...template.tags].sort(() => 0.5 - Math.random());
            const selectedTags = shuffledTags.slice(0, Math.floor(Math.random() * 2) + 1);

            const now = new Date();
            const randomDaysAgo = Math.floor(Math.random() * 365);
            const lastUpdated = new Date(now.getTime() - randomDaysAgo * 86400000).toISOString().split('T')[0];

            accounts.push({
                projectId: Math.floor(Math.random() * 5) + 1, // map to mock projects 1-5
                name: `${adj} ${template.platform} ${purpose} #${i + 1}`,
                url: `${domain}${randomSuffix}`,
                platformIcon: template.icon,
                tags: selectedTags,
                lastUpdated: lastUpdated,
                loginDetails: {
                    username: `user_${template.platform.toLowerCase().replace(/\//g, '_')}_${i + 1}@example.com`,
                    password: `P@ss${Math.random().toString(36).substring(2, 10)}!${i}`,
                    notes: `Auto-generated test account #${i + 1} for ${template.platform}`
                }
            });
        }

        return accounts;
    }
}
