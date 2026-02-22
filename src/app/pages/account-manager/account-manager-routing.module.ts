import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountListComponent } from './account-list/account-list.component';

const routes: Routes = [
    {
        path: '',
        children: [
            { path: 'list', component: AccountListComponent },
            { path: '', redirectTo: 'list', pathMatch: 'full' }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AccountManagerRoutingModule { }
