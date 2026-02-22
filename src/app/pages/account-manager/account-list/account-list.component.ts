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
    accountList: any[] = [];
    filteredList: any[] = [];
    pagedAccounts: any[] = [];
    selectedAccount: any;
    loginDetailsContent: string = '';
    loginDetailEntries: { key: string, value: string }[] = [];

    // Pagination
    total: number = 0;
    page: number = 1;
    itemsPerPage: number = 10;
    isLoading: boolean = false;

    // Search
    searchTerm: string = '';

    // Auto generate
    isGenerating: boolean = false;
    generatedCount: number = 0;

    // Multi-select
    selectedIds: number[] = [];

    // Forms
    accountForm: FormGroup;
    submitted: boolean = false;

    // Platform options for the automated icon selection
    platformOptions = [
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

    constructor(private accountService: AccountService, private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.breadCrumbItems = [{ label: 'Account Manager' }, { label: 'Account List', active: true }];
        this.initForm();
        this.fetchData();
    }

    fetchData() {
        this.isLoading = true;
        this.accountService.getAccounts().subscribe({
            next: (data) => {
                this.accountList = data;
                this.applyFilter();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error fetching data', err);
                this.isLoading = false;
            }
        });
    }

    onSearch() {
        this.page = 1;
        this.applyFilter();
    }

    applyFilter() {
        const term = this.searchTerm.toLowerCase().trim();
        if (term) {
            this.filteredList = this.accountList.filter(a =>
                (a.name && a.name.toLowerCase().includes(term)) ||
                (a.url && a.url.toLowerCase().includes(term))
            );
        } else {
            this.filteredList = [...this.accountList];
        }
        this.total = this.filteredList.length;
        this.updatePagedAccounts();
    }

    updatePagedAccounts() {
        const startIndex = (this.page - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        this.pagedAccounts = this.filteredList.slice(startIndex, endIndex);
    }

    pageChanged(event: any) {
        this.page = event.page;
        this.updatePagedAccounts();
    }

    initForm() {
        this.accountForm = this.formBuilder.group({
            name: ['', Validators.required],
            url: ['', Validators.required],
            platformIcon: [this.platformOptions[0].icon, Validators.required],
            tags: [''], // Comma separated
            // Login Details Group
            username: [''],
            password: [''],
            port: [''],
            notes: ['']
        });
    }

    get f() { return this.accountForm.controls; }

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
        this.accountForm.reset();
        this.accountForm.patchValue({
            platformIcon: this.platformOptions[0].icon
        });
        this.addAccountModal?.show();
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
            name: formValues.name,
            url: formValues.url,
            platformIcon: formValues.platformIcon,
            tags: formValues.tags ? formValues.tags.split(',').map((tag: string) => tag.trim()) : [],
            lastUpdated: new Date().toISOString().split('T')[0],
            loginDetails: loginDetails
        };

        this.isLoading = true;
        this.accountService.addAccount(newAccount).subscribe({
            next: (data) => {
                this.accountList.unshift(data);
                this.page = 1;
                this.applyFilter();
                this.isLoading = false;
                this.addAccountModal?.hide();
            },
            error: (err) => {
                console.error('Error adding account', err);
                this.isLoading = false;
            }
        });
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
        console.log('Edit account', id);
        // Add logic later
    }

    // ========== Multi-select ==========

    toggleSelect(id: number) {
        const idx = this.selectedIds.indexOf(id);
        if (idx > -1) {
            this.selectedIds.splice(idx, 1);
        } else {
            this.selectedIds.push(id);
        }
    }

    isSelected(id: number): boolean {
        return this.selectedIds.includes(id);
    }

    toggleSelectAll(event: any) {
        if (event.target.checked) {
            this.selectedIds = this.pagedAccounts.map(a => a.id);
        } else {
            this.selectedIds = [];
        }
    }

    isAllSelected(): boolean {
        return this.pagedAccounts.length > 0 && this.pagedAccounts.every(a => this.selectedIds.includes(a.id));
    }

    deleteSelected() {
        if (this.selectedIds.length === 0) return;

        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${this.selectedIds.length} account(s). You won\'t be able to revert this!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#34c38f',
            cancelButtonColor: '#f46a6a',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const idsToDelete = [...this.selectedIds];
                this.deleteSequentially(idsToDelete, 0);
            }
        });
    }

    private deleteSequentially(ids: number[], index: number) {
        if (index >= ids.length) {
            this.selectedIds = [];
            this.fetchData();
            Swal.fire('Deleted!', 'Selected accounts have been deleted.', 'success');
            return;
        }
        this.accountService.deleteAccount(ids[index]).subscribe({
            next: () => this.deleteSequentially(ids, index + 1),
            error: (err) => {
                console.error(`Error deleting account ${ids[index]}`, err);
                this.deleteSequentially(ids, index + 1);
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
                        this.accountList = this.accountList.filter(a => a.id !== id);
                        this.applyFilter();
                        const maxPage = Math.ceil(this.total / this.itemsPerPage) || 1;
                        if (this.page > maxPage) {
                            this.page = maxPage;
                            this.updatePagedAccounts();
                        }
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
            this.fetchData(); // Refresh full list from backend
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
