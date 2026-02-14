import { RouterModule, Routes } from '@angular/router';
import { Page404Component } from './extrapages/page404/page404.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layouts/layout.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: "auth",
        loadChildren: () =>
            import("./account/account.module").then((m) => m.AccountModule),
    },
    {
        path: "",
        component: LayoutComponent,
        loadChildren: () =>
            import("./pages/pages.module").then((m) => m.PagesModule),
        canActivate: [AuthGuard],
    },
    {
        path: "pages",
        loadChildren: () =>
            import("./extrapages/extrapages.module").then((m) => m.ExtrapagesModule),
        canActivate: [AuthGuard],
    },
    { path: "**", component: Page404Component },
];
